import { useState, useEffect, useRef } from "react";
import { checkHandleAvailability, type HandleCheckResult, OBROOL_API_URL } from "../services/api";
import { ObroolLogo } from "./Logo";
import {
  Check,
  ArrowRight,
  MessageSquare,
  Globe,
  Loader2,
  Menu,
  X,
} from "lucide-react";

interface LandingHandleClaimProps {
  onSelectHandle: (handle: string) => void;
}

export function LandingHandleClaim({ onSelectHandle }: LandingHandleClaimProps) {
  const [inputHandle, setInputHandle] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<HandleCheckResult | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/^@+/, "")
      .replace(/[^a-z0-9_-]/g, "");

    setInputHandle(sanitized);
    setCheckResult(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (sanitized.length >= 3) {
      setChecking(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await checkHandleAvailability(sanitized);
          setCheckResult(res);
        } catch {
          setCheckResult({ valid: false, error: "Gagal memeriksa handle." });
        } finally {
          setChecking(false);
        }
      }, 350);
    } else {
      setChecking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);


  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-between selection:bg-zinc-200">
      {/* Top Navigation */}
      <header className="w-full px-6 sm:px-12 py-4 flex items-center justify-between border-b border-zinc-200/60 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <ObroolLogo size={34} />

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href={`${OBROOL_API_URL}/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}${inputHandle.length >= 3 ? `&claim=${encodeURIComponent(inputHandle)}` : ""}`}
            className="text-[15px] font-semibold text-zinc-600 hover:text-black transition-colors"
          >
            Masuk Studio
          </a>
          <a
            href={`${OBROOL_API_URL}/register?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}${inputHandle.length >= 3 ? `&claim=${encodeURIComponent(inputHandle)}` : ""}`}
            className="text-[15px] font-semibold px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            Mulai Gratis
          </a>
        </div>

        {/* Mobile Dropdown Strip 3 Button */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="sm:hidden p-2 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors"
          aria-label="Menu"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-4 shadow-lg flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 z-50">
            <a
              href={`${OBROOL_API_URL}/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}${inputHandle.length >= 3 ? `&claim=${encodeURIComponent(inputHandle)}` : ""}`}
              className="w-full py-2.5 px-4 text-center rounded-xl border border-zinc-200 font-semibold text-[15px] text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              Masuk Studio
            </a>
            <a
              href={`${OBROOL_API_URL}/register?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}${inputHandle.length >= 3 ? `&claim=${encodeURIComponent(inputHandle)}` : ""}`}
              className="w-full py-2.5 px-4 text-center rounded-xl bg-black text-white font-semibold text-[15px] hover:bg-zinc-800 transition-colors shadow-2xs"
              onClick={() => setMobileNavOpen(false)}
            >
              Mulai Gratis
            </a>
          </div>
        )}
      </header>

      {/* Hero & Claim Form (Wide 2-Column Split on Desktop/Widescreen) */}
      <main className="w-full px-6 sm:px-12 lg:px-16 py-10 sm:py-16 flex-1 flex flex-col justify-center max-w-[1600px] mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center hero-grid-container">
          {/* Left Column: Hand Image Element with crop, fade-out mask, and vertical translateY */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start items-center relative image-column">
            {/* Subtle soft ambient glow behind hand */}
            <div className="absolute w-72 h-72 bg-gradient-to-tr from-blue-500/10 via-zinc-300/30 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <img
              src="/images/hero-hand-transparent.png"
              alt="Tampilan Bio Link & Asisten AI di Smartphone"
              className="hero-hand-image relative w-full max-w-[340px] sm:max-w-[380px] xl:max-w-[420px] h-auto transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          {/* Right Column: Headline, Claim Input & Quick Pick */}
          <div className="lg:col-span-7 text-left space-y-6 text-column">
            {/* Subtle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-[15px] font-medium text-zinc-700">
              <Globe className="w-4 h-4 text-zinc-600" />
              <span>Hanya link yang menyatukan</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.12]">
                Kalau bisa disatuin kenapa harus pisah?
              </h1>
              <p className="text-[15px] sm:text-lg text-zinc-600 max-w-xl leading-relaxed">
                Sebelum platform ini jadi famous, ambil handlemu duluan.
              </p>
            </div>

            {/* Claim Input Box */}
            <div className="w-full max-w-xl space-y-3">
              <div className="bg-white border-2 border-zinc-200 focus-within:border-black rounded-2xl p-2 shadow-sm transition-all flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center w-full px-3 py-2 sm:py-1">
                  <span className="text-[15px] sm:text-base font-medium text-zinc-400 select-none">
                    chat.obrool.com/@
                  </span>
                  <input
                    type="text"
                    value={inputHandle}
                    onChange={handleInputChange}
                    placeholder="nama-kamu-atau-brand"
                    autoFocus
                    className="w-full bg-transparent outline-none font-medium text-[15px] sm:text-base text-zinc-900 placeholder:text-zinc-300 font-mono"
                  />
                  {checking && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin flex-shrink-0" />}
                </div>

                {/* Action button inside input */}
                {checkResult?.available && (() => {
                  const targetHandle = checkResult.handle || inputHandle;
                  const chatOrigin = typeof window !== "undefined" ? window.location.origin : "https://chat.obrool.com";
                  const targetRedirect = `${chatOrigin}/@${targetHandle}`;
                  const claimHref = `${OBROOL_API_URL}/register?claim=${encodeURIComponent(targetHandle)}&redirect=${encodeURIComponent(targetRedirect)}`;
                  return (
                    <a
                      href={claimHref}
                      className="w-full sm:w-auto px-5 py-2.5 bg-black text-white rounded-xl text-[15px] font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
                    >
                      <span>Gunakan Handle Ini</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  );
                })()}

                {checkResult && !checkResult.available && checkResult.agent && (
                  <button
                    type="button"
                    onClick={() => onSelectHandle(checkResult.agent!.handle)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-[15px] font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap"
                  >
                    <span>Buka Halaman</span>
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Feedback Card */}
              {inputHandle.length >= 3 && !checking && checkResult && (
                <div className="transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                  {checkResult.available ? (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-center text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-700 flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-zinc-900">
                            Handle @{checkResult.handle || inputHandle} masih tersedia
                          </div>
                          <div className="text-[14px] text-zinc-500">
                            Handle ini dapat Anda gunakan untuk profil bio link & asisten AI Anda.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : checkResult.agent ? (
                    <div className="bg-white border border-zinc-200 rounded-xl p-3.5 flex items-center justify-between text-left shadow-2xs">
                      <div className="flex items-center gap-3">
                        {checkResult.agent.avatar ? (
                          <img
                            src={checkResult.agent.avatar}
                            alt={checkResult.agent.name}
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm">
                            {checkResult.agent.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-[15px] font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">
                            {checkResult.agent.name}
                          </div>
                          <div className="text-[14px] text-zinc-500 font-mono">
                            @{checkResult.agent.handle} • Profil Aktif
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectHandle(checkResult.agent!.handle)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-[15px] font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>Buka Halaman</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[15px] text-zinc-500">
                      {checkResult.error || "Handle tidak tersedia atau telah dicadangkan."}
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>

        {/* Feature Highlights - Clean text without icons, outline borders, or horizontal line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-2">
          <div className="space-y-2">
            <h3 className="text-[16px] font-bold text-zinc-950">Semua Tautan Jadi Satu</h3>
            <p className="text-[14px] text-zinc-600 leading-relaxed">
              Satukan semua tautan media sosial, toko online, marketplace, formulir kontak, dan tautan afiliasi kamu dalam satu halaman.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-[16px] font-bold text-zinc-950">Asisten AI</h3>
            <p className="text-[14px] text-zinc-600 leading-relaxed">
              Si AI yang selalu siap menjawab pertanyaan pengunjung halamanmu, membantu mereka mengenal kamu lebih jauh.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-[16px] font-bold text-zinc-950">Apa salahnya mencoba?</h3>
            <p className="text-[14px] text-zinc-600 leading-relaxed">
              Mungkin kami masih muda, tapi 20 tahun yang akan datang kami jadi tua, mudah-mudahan panjang umur and Grow Together With Us!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 sm:px-12 py-6 border-t border-zinc-200 text-center text-[14px] sm:text-[15px] text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>© 2026 Obrool. Hak Cipta Dilindungi.</div>
        <div className="flex items-center gap-4">
          <a
            href="https://obrool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 transition-colors"
          >
            Website Utama
          </a>
          <a
            href="https://obrool.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 transition-colors"
          >
            Dokumentasi
          </a>
          <a
            href="https://obrool.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 transition-colors"
          >
            Kebijakan Privasi
          </a>
        </div>
      </footer>
    </div>
  );
}
