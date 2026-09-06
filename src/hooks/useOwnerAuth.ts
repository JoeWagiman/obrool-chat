import { useState, useEffect, useCallback } from "react";
import { type AgentProfile } from "../types";

function parseJwtRole(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed?.role || null;
  } catch {
    return null;
  }
}

export function useOwnerAuth(agent: AgentProfile | null) {
  const [ownerToken, setOwnerToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("obrool_owner_token") : null;
  });
  const [ownerUserId, setOwnerUserId] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("obrool_owner_uid") : null;
  });
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const userRole = parseJwtRole(ownerToken);
  const isAdmin = userRole === "admin";

  const isOwner = Boolean(
    ownerToken &&
    (isAdmin || (agent?.userId && ownerUserId && ownerUserId === agent.userId))
  );

  // Check SSO token from URL hash (e.g. #sso_token=...&sso_user_id=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const ssoToken = params.get("sso_token") || params.get("token");
    const ssoUid = params.get("sso_user_id") || params.get("uid");

    if (ssoToken) {
      localStorage.setItem("obrool_owner_token", ssoToken);
      setOwnerToken(ssoToken);
      if (ssoUid) {
        localStorage.setItem("obrool_owner_uid", ssoUid);
        setOwnerUserId(ssoUid);
      }
      // Bersihkan hash fragment agar URL tetap bersih tanpa token
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  const handleOwnerLoginSuccess = useCallback((token: string, uid: string) => {
    setOwnerToken(token);
    setOwnerUserId(uid);
    localStorage.setItem("obrool_owner_token", token);
    localStorage.setItem("obrool_owner_uid", uid);
    setShowOwnerPanel(true);
  }, []);

  return {
    ownerToken,
    ownerUserId,
    isOwner,
    isAdmin,
    showOwnerLogin,
    setShowOwnerLogin,
    showOwnerPanel,
    setShowOwnerPanel,
    handleOwnerLoginSuccess,
  };
}
