import React, { useState } from "react";
import { User, Phone, CheckCircle, X } from "lucide-react";
import { submitLeadCapture } from "../services/api";

interface LeadModalProps {
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  themeColor?: string;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  agentId,
  isOpen,
  onClose,
  title = "Tinggalkan Kontak Anda",
  themeColor = "#0a0a0b",
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || loading) return;

    setLoading(true);
    const ok = await submitLeadCapture({
      agentId,
      name: name.trim(),
      phone: phone.trim(),
    });
    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-zinc-200 relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-zinc-950">Terima Kasih!</h3>
            <p className="text-xs text-zinc-500">Data Anda telah kami simpan. Tim kami akan segera menghubungi Anda.</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-base font-bold text-zinc-950">{title}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Agar kami dapat membantu dan menindaklanjuti percakapan Anda dengan lebih baik.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:bg-white focus:border-zinc-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !phone.trim()}
                className="w-full py-3 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                {loading ? "Menyimpan..." : "Kirim Kontak"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
