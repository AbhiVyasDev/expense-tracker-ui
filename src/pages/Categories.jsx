import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import categoryService from "../services/categoryService";

const TAG_COLORS = [
  { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  { bg: "#FDF4FF", text: "#9333EA", dot: "#C084FC" },
  { bg: "#ECFEFF", text: "#0E7490", dot: "#22D3EE" },
  { bg: "#FFF1F2", text: "#BE123C", dot: "#FB7185" },
  { bg: "#FEFCE8", text: "#A16207", dot: "#FACC15" },
  { bg: "#F0FDF4", text: "#166534", dot: "#4ADE80" },
];

const CATEGORY_ICONS = {
  FOOD: "🍔", ELECTRICITY: "⚡", TRAVEL: "✈️", SHOPPING: "🛍️",
  ENTERTAINMENT: "🎬", EDUCATION: "📚", HEALTH: "🏥", RENT: "🏠",
  GROCERIES: "🛒", INVESTMENT: "📈", MOBILE: "📱",
};

function getCategoryIcon(name) {
  const upper = (name || "").toUpperCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (upper.includes(key)) return CATEGORY_ICONS[key];
  }
  return "📂";
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    setPageError("");
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error(err);
      setPageError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setFormError("Category name is required."); return; }
    setSubmitting(true);
    try {
      await categoryService.createCategory(formData);
      closeModal();
      setSuccessMsg(`"${formData.name}" category created successfully!`);
      setTimeout(() => setSuccessMsg(""), 3500);
      loadCategories();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", description: "" });
    setFormError("");
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const inputBase = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0",
    borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
    fontFamily: "'Inter', sans-serif", background: "#fff",
  };

  return (
    <MainLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .cat-row:hover { background: #F8FAFC !important; }
        .cat-row { transition: background 0.15s; }
      `}</style>

      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: "36px 40px", maxWidth: 960, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, background: "#EEF2FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="#6366F1" strokeWidth="1.7" />
                  <path d="M6 9h8M6 13h5" stroke="#6366F1" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
                Categories
              </h1>
            </div>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 0 52px" }}>
              {loading ? "Loading…" : `${categories.length} ${categories.length === 1 ? "category" : "categories"} total`}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.background = "#4F46E5"}
            onMouseLeave={e => e.currentTarget.style.background = "#6366F1"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Add Category
          </button>
        </div>

        {/* ── Success toast ── */}
        {successMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, animation: "fadeIn 0.3s ease", color: "#15803D", fontSize: 14, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5" />
              <path d="M5 8l2.5 2.5L11 5.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── Error banner ── */}
        {pageError && (
          <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#BE123C", fontSize: 14 }}>
            {pageError}
          </div>
        )}

        {/* ── Search bar ── */}
        {!loading && categories.length > 0 && (
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="#94A3B8" strokeWidth="1.5" />
                <path d="M10.5 10.5l2.5 2.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputBase, paddingLeft: 40, background: "#F8FAFC" }}
              onFocus={e => { e.target.style.borderColor = "#6366F1"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F8FAFC"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── States ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220, gap: 14 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTop: "3px solid #6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Loading categories…</p>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 24px", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
            <div style={{ width: 56, height: 56, background: "#EEF2FF", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>
              {search ? "🔍" : "📂"}
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              {search ? "No results found" : "No categories yet"}
            </p>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>
              {search ? `No categories match "${search}".` : "Create your first category to start organising expenses."}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Add Category
              </button>
            )}
          </div>

        ) : (
          /* ── Table ── */
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", animation: "fadeIn 0.3s ease" }}>
            {/* Stats strip */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                {filtered.length} {filtered.length === 1 ? "result" : "results"}{search ? ` for "${search}"` : ""}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #E2E8F0" }}>
                  {["#", "Name", "Description"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", width: i === 0 ? 48 : "auto" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((category, index) => {
                  const color = TAG_COLORS[index % TAG_COLORS.length];
                  const icon = getCategoryIcon(category.name);
                  return (
                    <tr key={category.id} className="cat-row" style={{ borderBottom: index < filtered.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#CBD5E1", fontWeight: 600 }}>
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: color.bg, color: color.text, borderRadius: 8, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>
                          <span style={{ fontSize: 14 }}>{icon}</span>
                          {category.name}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: category.description ? "#374151" : "#CBD5E1", maxWidth: 400 }}>
                        {category.description || <span style={{ fontStyle: "italic" }}>No description</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: "32px", width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "slideIn 0.25s ease", fontFamily: "'Inter', sans-serif" }}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, background: "#EEF2FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  📂
                </div>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0F172A", margin: "0 0 2px", letterSpacing: "-0.4px" }}>New Category</h2>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Organise your expenses better</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Category name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="e.g. Food & Dining" autoFocus
                  style={{ ...inputBase, borderColor: formError && !formData.name.trim() ? "#EF4444" : "#E2E8F0" }}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = formError && !formData.name.trim() ? "#EF4444" : "#E2E8F0"}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Description <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  name="description" value={formData.description}
                  onChange={handleChange} placeholder="What expenses does this cover?" rows={3}
                  style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              {/* Form error */}
              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 8, padding: "10px 14px", color: "#BE123C", fontSize: 13 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#EF4444" strokeWidth="1.4" />
                    <path d="M7 4v3.5M7 10h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "#F1F5F9", margin: "2px 0" }} />

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={closeModal}
                  style={{ flex: 1, padding: "12px", background: "#F8FAFC", color: "#374151", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: "12px", background: submitting ? "#A5B4FC" : "#6366F1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: submitting ? "none" : "0 2px 8px rgba(99,102,241,0.3)" }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#4F46E5"; }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#6366F1"; }}
                  onMouseDown={e => { if (!submitting) e.currentTarget.style.transform = "scale(0.97)"; }}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {submitting ? (
                    <>
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Save Category
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Categories;