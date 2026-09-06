import { useState, useEffect, useCallback } from "react";
import { fetchAgentProfile } from "../services/api";
import { type AgentProfile } from "../types";
import { updateDocumentSEO } from "../utils/seo";

export function getIdentifierFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const queryAgent = params.get("agent") || params.get("id") || params.get("h");

  let pathHandle = window.location.pathname.replace(/^\/+/, "");
  if (pathHandle.startsWith("@")) {
    pathHandle = pathHandle.slice(1);
  }

  return queryAgent || pathHandle || null;
}

export function useAgentProfile() {
  const [activeIdentifier, setActiveIdentifier] = useState<string | null>(getIdentifierFromUrl);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const id = getIdentifierFromUrl();
      setActiveIdentifier(id);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync page SEO metadata, OpenGraph, and Schema.org
  useEffect(() => {
    updateDocumentSEO(agent);
  }, [agent]);

  // Load Agent whenever activeIdentifier changes
  useEffect(() => {
    if (!activeIdentifier) {
      setAgent(null);
      setLoadingProfile(false);
      setProfileError(null);
      return;
    }

    setLoadingProfile(true);
    setProfileError(null);

    fetchAgentProfile(activeIdentifier)
      .then((profile) => {
        setAgent(profile);
      })
      .catch((err) => {
        setProfileError(err.message || "Gagal memuat profil asisten.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [activeIdentifier]);

  const handleSelectHandle = useCallback((handle: string) => {
    const clean = handle.trim().replace(/^@+/, "");
    window.history.pushState({}, "", `/@${clean}`);
    setActiveIdentifier(clean);
  }, []);

  const handleBackToHome = useCallback(() => {
    window.history.pushState({}, "", "/");
    setActiveIdentifier(null);
    setAgent(null);
  }, []);

  return {
    activeIdentifier,
    agent,
    setAgent,
    loadingProfile,
    profileError,
    handleSelectHandle,
    handleBackToHome,
  };
}
