import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import budgetService from "../services/budgetService";
import categoryService from "../services/categoryService";

const MONTHS = [
  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function getMonthIndex(month) {

  if (typeof month === "number") {
    return month - 1;
  }

  return MONTHS.findIndex(
    m => m === String(month).toUpperCase()
  );
}

const inputBase = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0",
  borderRadius: 10, fontSize: 14, color: "#0F172A", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s",
  fontFamily: "'Inter', sans-serif", background: "#fff",
};

// Circular progress ring
function ProgressRing({ percent, size = 48, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(percent, 100);
  const color = pct >= 100 ? "#EF4444" : pct >= 80 ? "#F97316" : "#22C55E";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

export default function Budgets() {
  const [budgets, setBudgets]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusMap, setStatusMap]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [pageError, setPageError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [formData, setFormData]     = useState({
    categoryId: "", amount: "", month: "", year: String(CURRENT_YEAR),
  });

  // Delete confirm
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data.data ?? []);
    } catch (e) { console.error(e); }
  };

  const loadBudgets = async () => {
    setLoading(true); setPageError("");
    try {
      const res = await budgetService.getAllBudgets();
      const list = Array.isArray(res) ? res : res.data ?? [];
      setBudgets(list);
      // load status for each budget
      loadAllStatuses(list);
    } catch (e) {
      console.error(e);
      setPageError("Failed to load budgets.");
    } finally { setLoading(false); }
  };

  const loadAllStatuses = async (list) => {
    const map = {};
    await Promise.allSettled(
      list.map(async (b) => {
        try {
          const res = await budgetService.getBudgetStatus(b.id);
          map[b.id] = res?.data ?? res;
        } catch (e) { /* ignore individual failures */ }
      })
    );
    setStatusMap(map);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) { setFormError("Please select a category."); return; }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) { setFormError("Enter a valid amount."); return; }
    if (!formData.month) { setFormError("Please select a month."); return; }
    setSubmitting(true);
    try {
      await budgetService.createBudget({
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: parseInt(formData.year),
      });
      closeModal();
      setSuccessMsg("Budget created successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      loadBudgets();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Failed to create budget.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await budgetService.deleteBudget(deleteId);
      setDeleteId(null);
      setSuccessMsg("Budget deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadBudgets();
    } catch (e) {
      console.error(e);
      setPageError("Failed to delete budget.");
    } finally { setDeleting(false); }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ categoryId: "", amount: "", month: "", year: String(CURRENT_YEAR) });
    setFormError("");
  };

  const totalBudgeted = budgets.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
  const totalSpent    = Object.values(statusMap).reduce((s, st) => s + (parseFloat(st?.spentAmount ?? st?.spent ?? 0)), 0);
  const overBudget    = budgets.filter(b => {
    const st = statusMap[b.id];
    if (!st) return false;
    const spent = parseFloat(st?.spentAmount ?? st?.spent ?? 0);
    return spent > parseFloat(b.amount);
  }).length;

  return (
    <MainLayout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .bud-row:hover { background: #F8FAFC !important; }
        .bud-row { transition: background 0.15s; }
        .del-btn:hover { background: #FFF1F2 !important; color: #BE123C !important; border-color: #FECDD3 !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: "36px 40px", maxWidth: 1060, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, background: "#F0FDF4", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="3" width="16" height="14" rx="2.5" stroke="#16A34A" strokeWidth="1.7"/>
                  <path d="M6 10h3m3 0h2M6 13h2" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 7h8" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>Budgets</h1>
            </div>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 0 52px" }}>
              {loading ? "Loading…" : `${budgets.length} ${budgets.length === 1 ? "budget" : "budgets"} set`}
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
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Add Budget
          </button>
        </div>

        {/* ── Success Toast ── */}
        {successMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, animation: "fadeIn 0.3s ease", color: "#15803D", fontSize: 14, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5"/>
              <path d="M5 8l2.5 2.5L11 5.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── Error Banner ── */}
        {pageError && (
          <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#BE123C", fontSize: 14 }}>
            {pageError}
          </div>
        )}

        {/* ── Stats Cards ── */}
        {!loading && budgets.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Budgeted", value: `₹${formatAmount(totalBudgeted)}`, icon: "🎯", bg: "#EEF2FF", color: "#4338CA" },
              { label: "Total Spent", value: `₹${formatAmount(totalSpent)}`, icon: "💸", bg: "#FFF7ED", color: "#C2410C" },
              { label: "Over Budget", value: `${overBudget} budget${overBudget !== 1 ? "s" : ""}`, icon: "⚠️", bg: overBudget > 0 ? "#FFF1F2" : "#F0FDF4", color: overBudget > 0 ? "#BE123C" : "#15803D" },
            ].map(card => (
              <div key={card.label} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, background: card.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: card.color, margin: 0, letterSpacing: "-0.3px" }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220, gap: 14 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTop: "3px solid #6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Loading budgets…</p>
          </div>

        ) : budgets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 24px", background: "#F8FAFC", borderRadius: 16, border: "1.5px dashed #CBD5E1" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎯</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>No budgets yet</p>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>Set monthly budgets per category to stay on track.</p>
            <button onClick={() => setShowModal(true)} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Add Budget
            </button>
          </div>

        ) : (
          /* ── Table ── */
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: "12px 20px", background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #E2E8F0" }}>
                  {["#", "Category", "Budget Amount", "Period", "Spent", "Progress", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: i === 2 || i === 4 ? "right" : "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget, index) => {
                  const st = statusMap[budget.id];
                  const spent = parseFloat(st?.spentAmount ?? st?.spent ?? 0);
                  const budgeted = parseFloat(budget.amount) || 0;
                  const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
                  const isOver = pct >= 100;
                  const monthIdx = getMonthIndex(budget.month);
                  const monthLabel = monthIdx >= 0 ? MONTH_SHORT[monthIdx] : budget.month;
                  const barColor = pct >= 100 ? "#EF4444" : pct >= 80 ? "#F97316" : "#22C55E";
                  const barBg    = pct >= 100 ? "#FFF1F2" : pct >= 80 ? "#FFF7ED" : "#F0FDF4";

                  return (
                    <tr key={budget.id} className="bud-row" style={{ borderBottom: index < budgets.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                      <td style={{ padding: "16px", fontSize: 13, color: "#CBD5E1", fontWeight: 600, width: 40 }}>
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ background: "#EEF2FF", color: "#4338CA", borderRadius: 7, padding: "5px 12px", fontSize: 13, fontWeight: 700 }}>
                          {budget.categoryName || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.3px" }}>
                          ₹{formatAmount(budgeted)}
                        </span>
                      </td>
                      <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                          {monthLabel} {budget.year}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isOver ? "#EF4444" : "#374151" }}>
                          {st ? `₹${formatAmount(spent)}` : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>}
                        </span>
                      </td>
                      <td style={{ padding: "16px", minWidth: 160 }}>
                        {st ? (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{pct}%</span>
                              {isOver && <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", background: "#FFF1F2", borderRadius: 4, padding: "1px 6px" }}>OVER</span>}
                            </div>
                            <div style={{ height: 7, background: barBg, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 99, transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#CBD5E1" }}>Loading…</span>
                        )}
                      </td>
                      <td style={{ padding: "16px", width: 48 }}>
                        <button
                          className="del-btn"
                          onClick={() => setDeleteId(budget.id)}
                          style={{ background: "#F8FAFC", color: "#94A3B8", border: "1.5px solid #E2E8F0", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                          title="Delete budget"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8h3l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Budget Modal ── */}
      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: "32px", width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "slideIn 0.25s ease", fontFamily: "'Inter', sans-serif" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, background: "#F0FDF4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0F172A", margin: "0 0 2px", letterSpacing: "-0.4px" }}>New Budget</h2>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Set a monthly spending limit</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Category <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <select name="categoryId" value={formData.categoryId} onChange={handleFormChange}
                  style={{ ...inputBase, padding: "10px 12px" }}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Budget Amount (₹) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input type="number" name="amount" value={formData.amount} onChange={handleFormChange}
                  placeholder="e.g. 5000" min="0" step="0.01" style={inputBase}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              {/* Month + Year */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Month <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <select name="month" value={formData.month} onChange={handleFormChange}
                    style={{ ...inputBase, padding: "10px 12px" }}
                    onFocus={e => e.target.style.borderColor = "#6366F1"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((m, index) => (
  <option
    key={m}
    value={index + 1}
  >
    {m.charAt(0) + m.slice(1).toLowerCase()}
  </option>
))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Year</label>
                  <select name="year" value={formData.year} onChange={handleFormChange}
                    style={{ ...inputBase, padding: "10px 12px" }}
                    onFocus={e => e.target.style.borderColor = "#6366F1"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Form error */}
              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 8, padding: "10px 14px", color: "#BE123C", fontSize: 13 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#EF4444" strokeWidth="1.4"/>
                    <path d="M7 4v3.5M7 10h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {formError}
                </div>
              )}

              <div style={{ height: 1, background: "#F1F5F9" }} />

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={closeModal}
                  style={{ flex: 1, padding: "12px", background: "#F8FAFC", color: "#374151", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                >Cancel</button>
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
                        <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Save Budget
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 380, boxShadow: "0 20px 56px rgba(0,0,0,0.18)", animation: "slideIn 0.2s ease", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: 48, height: 48, background: "#FFF1F2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>🗑️</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: "0 0 8px", textAlign: "center" }}>Delete Budget?</h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", textAlign: "center", lineHeight: 1.6 }}>
              This action cannot be undone. The budget will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "11px", background: "#F8FAFC", color: "#374151", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: "11px", background: deleting ? "#FCA5A5" : "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = "#DC2626"; }}
                onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = "#EF4444"; }}
              >
                {deleting ? (
                  <>
                    <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Deleting…
                  </>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}