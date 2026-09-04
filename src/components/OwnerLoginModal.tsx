import React, { useState } from "react";
import { loginOwner, OBROOL_API_URL } from "../services/api";
import { X, Lock, Loader2, AlertCircle } from "lucide-react";

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, userId: string) => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginOwner(email, password);
      onSuccess(res.token, res.user.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 text-[15px]">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[15px] text-zinc-950">
            <div className="w-8 h-8 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-800">
              <Lock className="w-4 h-4" />
            </div>
            <span>Masuk Mode Pemilik</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[14px] text-zinc-500 leading-relaxed">
          Masuk dengan akun Obrool Anda untuk mengelola logo, tautan bio, dan pengetahuan asisten ini langsung dari sini.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              const currentUrl = window.location.href;
              const ssoUrl = `${OBROOL_API_URL}/api/auth/sso/handoff?redirect=${encodeURIComponent(currentUrl)}`;
              window.location.href = ssoUrl;
            }}
            className="w-full py-2.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <span>Masuk Cepat via Obrool SSO</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[13px] uppercase">
              <span className="bg-white px-2 text-zinc-400 font-semibold">Atau via Email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[14px] font-semibold text-zinc-700 mb-1">
              Email Akun Obrool
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[15px] outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-zinc-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[15px] outline-none focus:border-black transition-colors"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-[14px] text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-[15px] font-semibold hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-zinc-900 text-white rounded-lg text-[15px] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </div>

          <p className="text-[13px] text-zinc-500 text-center pt-2 border-t border-zinc-100">
            Belum punya akun Obrool?{" "}
            <a
              href={`${OBROOL_API_URL}/register?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              className="text-zinc-900 font-semibold underline hover:text-black"
            >
              Daftar Akun Baru
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
