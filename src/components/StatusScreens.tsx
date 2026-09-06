import { Loader2, AlertCircle } from "lucide-react";

export function ProfileLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center text-[15px]">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-3" />
      <p className="text-[15px] font-semibold text-zinc-600">Menghubungkan ke Profil...</p>
    </div>
  );
}

export function ProfileErrorScreen({
  error,
  onBackToHome,
}: {
  error: string | null;
  onBackToHome: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] p-4 text-center text-[15px]">
      <div className="p-6 bg-white rounded-2xl border border-zinc-200 max-w-md w-full space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-950">Halaman Tidak Ditemukan</h2>
          <p className="text-[15px] text-zinc-600">
            {error || "Pastikan tautan atau nama handle yang Anda tuju sudah benar."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={onBackToHome}
            className="px-4 py-2 bg-black text-white rounded-xl text-[15px] font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Cari Handle Lain
          </button>
          <a
            href="https://obrool.com/register"
            className="px-4 py-2 bg-zinc-100 text-zinc-800 rounded-xl text-[15px] font-semibold hover:bg-zinc-200 transition-colors"
          >
            Klaim Handle Ini
          </a>
        </div>
      </div>
    </div>
  );
}
