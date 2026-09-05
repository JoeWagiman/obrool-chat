import React, { useState } from "react";
import { type AgentProfile, type BioLink, DEFAULT_AVATAR } from "../types";
import { updateAgentProfile, addQuickKnowledge } from "../services/api";
import { GripVertical } from "lucide-react";

interface OwnerSidebarPanelProps {
  agent: AgentProfile;
  token: string;
  onClose?: () => void;
  onProfileUpdated: (agent: AgentProfile) => void;
}

export const OwnerSidebarPanel: React.FC<OwnerSidebarPanelProps> = ({
  agent,
  token,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "links" | "knowledge">("profile");

  // Profile state
  const [avatar, setAvatar] = useState(agent.avatar || "");
  const [bio, setBio] = useState(agent.bio || "");
  const [adminWhatsApp, setAdminWhatsApp] = useState(agent.adminWhatsApp || "");
  const [pageBackground, setPageBackground] = useState(agent.pageBackground || "");

  // Links state
  const [links, setLinks] = useState<BioLink[]>(agent.links || []);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState<string>("globe");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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

      setSaveSuccess("Pengaturan berhasil diperbarui!");
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
      await addQuickKnowledge(agent.id, token, kbTitle || "Panduan / Informasi", kbContent.trim());
      setKbSuccess("Pengetahuan berhasil ditambahkan ke AI!");
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
    <div className="h-full flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200 text-[15px]">
      {/* Header: Judul "Pengaturan", Dropdown Menu Tab, dan tombol text "Tutup" */}
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider shrink-0">
            Pengaturan
          </h3>
          <span className="text-zinc-300">/</span>
          {/* Dropdown Menu Tab Selector */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as "profile" | "links" | "knowledge")}
            className="px-3 py-1.5 bg-white border border-zinc-300 hover:border-zinc-400 rounded-xl text-[13px] font-semibold text-zinc-900 outline-none focus:border-black shadow-2xs cursor-pointer transition-colors"
          >
            <option value="profile">Profil</option>
            <option value="links">Tautan ({links.length})</option>
            <option value="knowledge">Pengetahuan</option>
          </select>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 px-2.5 py-1 rounded-lg hover:bg-zinc-200/80 transition-colors shrink-0"
            title="Tutup Panel"
          >
            Tutup
          </button>
        )}
      </div>

      {/* Tab Content Area - Full Width */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-[15px]">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1.5 text-[14px]">
                  Logo / Avatar
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar || DEFAULT_AVATAR}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shadow-2xs"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg font-semibold text-zinc-800 cursor-pointer text-[13px] transition-colors">
                        <span>Unggah Logo</span>
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
                          className="px-2.5 py-1.5 text-[13px] text-zinc-500 hover:text-red-600 border border-transparent hover:border-zinc-200 rounded-lg transition-colors font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-400">PNG/JPG, maks 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1 text-[14px]">
                  Bio / Deskripsi
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tulis deskripsi, penawaran spesial, atau profil Anda..."
                  rows={3}
                  maxLength={240}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black resize-none transition-colors bg-white"
                />
                <p className="text-[12px] text-zinc-400 text-right mt-0.5">
                  {bio.length}/240 karakter
                </p>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1 text-[14px]">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={adminWhatsApp}
                  onChange={(e) => setAdminWhatsApp(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black transition-colors bg-white"
                />
                <p className="text-[12px] text-zinc-400 mt-0.5">
                  Akan otomatis muncul sebagai tombol kontak langsung.
                </p>
              </div>

              {/* Background Halaman (Warna atau Gambar) */}
              <div className="pt-2 border-t border-zinc-200/80 space-y-2.5">
                <div>
                  <label className="block font-semibold text-zinc-700 text-[14px] mb-0.5">
                    Background Halaman Chat
                  </label>
                  <p className="text-[12px] text-zinc-400">
                    Pilih warna solid atau unggah gambar latar sesuai keinginan.
                  </p>
                </div>

                {/* Preset Warna Monokrom & Netral */}
                <div className="flex items-center gap-2 flex-wrap">
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
                        className="px-2 py-0.5 bg-white/90 text-zinc-900 rounded-md text-[10px] hover:bg-white font-semibold"
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
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <h4 className="font-bold text-zinc-900 text-[14px]">Tambah Tautan Baru</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Judul tautan (misal: Shopee / Portofolio)"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black bg-white"
                  />
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="px-2.5 py-2 border border-zinc-300 rounded-lg text-[13px] outline-none focus:border-black bg-white flex-1"
                    >
                      <option value="globe">Website</option>
                      <option value="shopping-bag">Toko Online</option>
                      <option value="tag">Promo / Diskon</option>
                      <option value="message-circle">Komunitas</option>
                      <option value="link">Tautan Umum</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      disabled={!newTitle.trim() || !newUrl.trim()}
                      className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 disabled:opacity-50 text-[13px] shadow-2xs"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* List Tautan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <label className="font-semibold text-zinc-700">
                    Daftar Tautan Aktif ({links.length})
                  </label>
                  {links.length > 1 && (
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Geser untuk urutkan
                    </span>
                  )}
                </div>
                {links.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {links.map((lnk, idx) => (
                      <div
                        key={lnk.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`p-2.5 bg-white border rounded-xl flex items-center justify-between gap-2.5 shadow-2xs transition-all cursor-grab active:cursor-grabbing ${
                          draggedIdx === idx
                            ? "border-zinc-900 bg-zinc-50 opacity-60 scale-[0.99]"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="text-zinc-400 hover:text-zinc-600 p-0.5 -ml-0.5 cursor-grab active:cursor-grabbing flex-shrink-0"
                            title="Tahan dan geser untuk memindahkan urutan"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-zinc-900 truncate text-[14px] leading-tight">
                              {lnk.title}
                            </div>
                            <div className="text-[12px] text-zinc-400 truncate">{lnk.url}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(lnk.id)}
                          className="text-xs font-semibold text-zinc-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-[13px] text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                    Belum ada tautan. Tambahkan lewat form di atas.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI KNOWLEDGE */}
          {activeTab === "knowledge" && (
            <form onSubmit={handleSaveKnowledge} className="space-y-3.5">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <p className="font-bold text-zinc-900 text-[14px]">
                  Tambah Pengetahuan AI Baru
                </p>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  Tuliskan aturan, jadwal operasional, layanan, atau FAQ agar asisten AI memahaminya.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1 text-[14px]">
                  Judul Pengetahuan
                </label>
                <input
                  type="text"
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                  placeholder="Contoh: Syarat Layanan / Jam Operasional"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1 text-[14px]">
                  Isi Pengetahuan / FAQ
                </label>
                <textarea
                  value={kbContent}
                  onChange={(e) => setKbContent(e.target.value)}
                  placeholder="Contoh: Buka setiap hari Senin-Sabtu pukul 09.00-17.00 WIB. Layanan konsultasi dapat dijadwalkan via WhatsApp..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black resize-none bg-white"
                />
              </div>

              {kbSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] text-emerald-800 font-medium">
                  {kbSuccess}
                </div>
              )}

              {kbError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700 font-medium">
                  {kbError}
                </div>
              )}

              <button
                type="submit"
                disabled={savingKb || !kbContent.trim()}
                className="w-full py-2.5 bg-black text-white rounded-lg text-[14px] font-semibold hover:bg-zinc-800 disabled:opacity-50 shadow-2xs"
              >
                {savingKb ? "Menyimpan ke AI..." : "Tambahkan ke Pengetahuan AI"}
              </button>
            </form>
          )}

          {/* Status for Profile/Links */}
          {activeTab !== "knowledge" && (
            <div className="pt-2 space-y-3">
              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] text-emerald-800 font-medium">
                  {saveSuccess}
                </div>
              )}

              {saveError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700 font-medium">
                  {saveError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-2.5 bg-zinc-950 text-white rounded-lg text-[14px] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                {saving ? "Menyimpan Perubahan..." : "Simpan Pengaturan"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
