import React, { useState } from "react";
import { type AgentProfile, type BioLink, DEFAULT_AVATAR } from "../types";
import { updateAgentProfile, addQuickKnowledge } from "../services/api";
import {
  X,
  User,
  Link as LinkIcon,
  BookOpen,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  GripVertical,
} from "lucide-react";

interface OwnerEditModalProps {
  agent: AgentProfile;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (agent: AgentProfile) => void;
}

export const OwnerEditModal: React.FC<OwnerEditModalProps> = ({
  agent,
  token,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "links" | "knowledge">("profile");

  // Profile state
  const [avatar, setAvatar] = useState(agent.avatar || "");
  const [bio, setBio] = useState(agent.bio || "");
  const [adminWhatsApp, setAdminWhatsApp] = useState(agent.adminWhatsApp || "");
  const [pageBackground, setPageBackground] = useState<string>(agent.pageBackground || "");

  // Links state
  const [links, setLinks] = useState<BioLink[]>(agent.links || []);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState<string>("globe");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const newLinks = [...links];
    const draggedItem = newLinks[draggedIdx];
    newLinks.splice(draggedIdx, 1);
    newLinks.splice(index, 0, draggedItem);

    setDraggedIdx(index);
    setLinks(newLinks);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // Knowledge state
  const [kbTitle, setKbTitle] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [savingKb, setSavingKb] = useState(false);
  const [kbSuccess, setKbSuccess] = useState("");
  const [kbError, setKbError] = useState("");

  // Saving general profile
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  if (!isOpen) return null;

  // Handle avatar upload to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Ukuran gambar maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle background image upload to base64
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Ukuran gambar background maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setPageBackground(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add a new link
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const item: BioLink = {
      id: "lnk_" + Date.now(),
      title: newTitle.trim(),
      url: formattedUrl,
      icon: newIcon,
    };

    setLinks((prev) => [...prev, item]);
    setNewTitle("");
    setNewUrl("");
  };

  // Remove a link
  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // Save profile & links changes
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const updated = await updateAgentProfile(agent.id, token, {
        avatar: avatar || undefined,
        bio: bio.trim(),
        links,
        adminWhatsApp: adminWhatsApp.trim(),
        pageBackground: pageBackground.trim() || undefined,
      });

      setSaveSuccess("Perubahan profil berhasil disimpan!");
      onProfileUpdated(updated);
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  // Save quick knowledge
  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbContent.trim()) return;

    setSavingKb(true);
    setKbSuccess("");
    setKbError("");

    try {
      await addQuickKnowledge(agent.id, token, kbTitle || "Panduan Toko", kbContent.trim());
      setKbSuccess("Pengetahuan berhasil ditambahkan! Asisten AI akan segera menggunakannya.");
      setKbTitle("");
      setKbContent("");
      setTimeout(() => setKbSuccess(""), 4000);
    } catch (err) {
      setKbError(err instanceof Error ? err.message : "Gagal menambahkan pengetahuan.");
    } finally {
      setSavingKb(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-950">
              Kelola Profil & Asisten AI
            </h2>
            <p className="text-[11px] text-zinc-500">
              Ubah logo, tautan, dan panduan profil secara instan tanpa masuk studio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 px-4 bg-zinc-50 text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "profile"
                ? "border-black text-zinc-950 bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Logo & Profil</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "links"
                ? "border-black text-zinc-950 bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Tautan Bio ({links.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("knowledge")}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "knowledge"
                ? "border-black text-zinc-950 bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pengetahuan AI</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: PROFILE & LOGO */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1.5">
                  Logo / Avatar Profil
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar || DEFAULT_AVATAR}
                    alt="Preview Avatar"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shadow-2xs"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg font-semibold text-zinc-800 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Gambar Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar("")}
                          className="px-2.5 py-1.5 text-zinc-500 hover:text-red-600 border border-transparent hover:border-zinc-200 rounded-lg transition-colors font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      PNG, JPG, atau WebP. Maksimal 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Bio / Deskripsi Singkat Profil
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Misal: Konsultan kreatif & layanan profesional. Siap membantu kebutuhan Anda."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg outline-none focus:border-black transition-colors"
                />
                <div className="text-right text-[10px] text-zinc-400">
                  {bio.length}/300 karakter
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Nomor WhatsApp Admin (Opsional)
                </label>
                <input
                  type="text"
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="08123456789 atau 628123456789"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Background Halaman */}
              <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-0.5">
                    Latar Belakang Halaman
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Pilih palet warna monokrom atau unggah gambar latar sendiri.
                  </p>
                </div>

                {/* Preset Warna Monokrom */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Default", val: "" },
                    { label: "White", val: "#ffffff" },
                    { label: "Warm Light", val: "#f5f5f0" },
                    { label: "Slate", val: "#f1f5f9" },
                    { label: "Zinc Dark", val: "#18181b" },
                    { label: "Midnight", val: "#09090b" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPageBackground(p.val)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        pageBackground === p.val
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Input Color Picker & Image Upload */}
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pageBackground && pageBackground.startsWith("#") ? pageBackground : "#fbfbfa"}
                      onChange={(e) => setPageBackground(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-zinc-300 cursor-pointer p-0.5 bg-white"
                      title="Pilih Warna Custom"
                    />
                    <span className="text-[12px] font-mono text-zinc-600 uppercase">
                      {pageBackground && pageBackground.startsWith("#") ? pageBackground : "Custom"}
                    </span>
                  </div>

                  <span className="text-zinc-300">|</span>

                  {/* Unggah Gambar Background */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <label className="inline-flex items-center px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg font-semibold text-zinc-800 cursor-pointer text-[12px] transition-colors shrink-0">
                      <span>Unggah Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgUpload}
                        className="hidden"
                      />
                    </label>

                    {pageBackground && (
                      <button
                        type="button"
                        onClick={() => setPageBackground("")}
                        className="text-xs text-zinc-400 hover:text-red-600 px-2 py-1 rounded transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Thumbnail if Background is Image */}
                {pageBackground && (pageBackground.startsWith("data:image/") || pageBackground.startsWith("http")) && (
                  <div className="relative w-full h-16 rounded-xl overflow-hidden border border-zinc-200 shadow-2xs">
                    <img
                      src={pageBackground}
                      alt="Preview Background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-between px-3 text-white text-[11px] font-medium">
                      <span>Gambar latar aktif</span>
                      <button
                        type="button"
                        onClick={() => setPageBackground("")}
                        className="bg-black/60 hover:bg-red-600 text-white px-2 py-0.5 rounded text-[10px] transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BIO LINKS */}
          {activeTab === "links" && (
            <div className="space-y-4">
              {/* Add Link Form */}
              <form onSubmit={handleAddLink} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
                <div className="font-semibold text-zinc-900">Tambah Tautan Baru</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Judul (misal: Toko Shopee Kami)"
                    className="px-3 py-1.5 border border-zinc-300 rounded-lg outline-none focus:border-black bg-white"
                  />
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-1.5 border border-zinc-300 rounded-lg outline-none focus:border-black bg-white"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white outline-none text-zinc-700"
                  >
                    <option value="globe">Ikon Web / Toko</option>
                    <option value="shopping-bag">Ikon Marketplace</option>
                    <option value="message-circle">Ikon WhatsApp</option>
                    <option value="tag">Ikon Promo / Afiliasi</option>
                    <option value="link">Ikon Tautan Biasa</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan</span>
                  </button>
                </div>
              </form>

              {/* List of existing links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-zinc-700">Daftar Tautan Aktif ({links.length}):</div>
                  {links.length > 1 && (
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Geser untuk urutkan
                    </span>
                  )}
                </div>
                {links.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {links.map((lnk, idx) => (
                      <div
                        key={lnk.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 bg-white border rounded-xl flex items-center justify-between gap-2 shadow-2xs transition-all cursor-grab active:cursor-grabbing ${
                          draggedIdx === idx
                            ? "border-zinc-900 bg-zinc-50 opacity-60 scale-[0.99]"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className="text-zinc-400 hover:text-zinc-600 p-0.5 -ml-0.5 cursor-grab active:cursor-grabbing flex-shrink-0"
                            title="Tahan dan geser untuk memindahkan urutan"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-zinc-900 truncate leading-tight">{lnk.title}</div>
                            <a
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-zinc-400 hover:text-zinc-600 truncate flex items-center gap-1"
                            >
                              <span className="truncate">{lnk.url}</span>
                              <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(lnk.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Hapus tautan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                    Belum ada tautan yang ditambahkan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <form onSubmit={handleSaveKnowledge} className="space-y-3">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 space-y-1">
                <span className="font-semibold text-zinc-900 block">
                  💡 Cara Kerja Pengetahuan Asisten:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Tuliskan informasi penting seperti jam buka, kebijakan retur barang, rekening resmi, atau garansi produk. Asisten AI akan langsung menjawab pertanyaan pembeli sesuai catatan ini.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Judul Topik / Dokumen
                </label>
                <input
                  type="text"
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                  placeholder="Misal: Aturan Pengiriman & Garansi"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Catatan / Informasi Penting (Teks Lengkap)
                </label>
                <textarea
                  value={kbContent}
                  onChange={(e) => setKbContent(e.target.value)}
                  rows={5}
                  required
                  placeholder="Misal:
1. Jam operasional layanan: Senin - Sabtu 08.00 - 17.00 WIB.
2. Konsultasi dan pertanyaan dapat disampaikan langsung di chat ini.
3. Kontak darurat / WhatsApp resmi: 0812xxxx."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg outline-none focus:border-black font-sans"
                />
              </div>

              {kbSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{kbSuccess}</span>
                </div>
              )}

              {kbError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{kbError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingKb || !kbContent.trim()}
                className="w-full py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {savingKb ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke AI...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Simpan Pengetahuan Ini ke AI</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Feedback messages for Profile/Links tab */}
          {activeTab !== "knowledge" && saveSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {activeTab !== "knowledge" && saveError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer (for saving profile & links) */}
        {activeTab !== "knowledge" && (
          <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
