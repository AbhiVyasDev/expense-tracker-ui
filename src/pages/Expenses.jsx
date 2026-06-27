import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getExpenses,
  createExpense,
  filterExpenses,
} from "../services/expenseService";
import categoryService from "../services/categoryService";
import { downloadExcelReport } from "../services/reportService";

const PAYMENT_METHODS = [
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "NET_BANKING",
  "OTHER",
];

const METHOD_STYLES = {
  CASH: { bg: "#F0FDF4", text: "#15803D", label: "💵 Cash" },
  CREDIT_CARD: { bg: "#EEF2FF", text: "#4338CA", label: "💳 Credit Card" },
  DEBIT_CARD: { bg: "#F0F9FF", text: "#0369A1", label: "🏧 Debit Card" },
  UPI: { bg: "#FDF4FF", text: "#9333EA", label: "📱 UPI" },
  NET_BANKING: { bg: "#FFF7ED", text: "#C2410C", label: "🏦 Net Banking" },
  OTHER: { bg: "#F8FAFC", text: "#475569", label: "💰 Other" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const inputBase = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 14,
  color: "#0F172A",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "'Inter', sans-serif",
  background: "#fff",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter panel
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "",
    startDate: "",
    endDate: "",
    paymentMethod: "",
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [isFiltered, setIsFiltered] = useState(false);

  // Add modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expenseDate: "",
    categoryId: "",
    paymentMethod: "",
    notes: "",
  });

  // Export report
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, [page]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : (data.data ?? []));
    } catch (e) {
      console.error(e);
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    setPageError("");
    try {
      const res = await getExpenses(page, size);
      const content = res?.data?.content ?? res?.content ?? [];
      setExpenses(content);
      setTotalPages(res?.data?.totalPages ?? res?.totalPages ?? 0);
      setTotalElements(res?.data?.totalElements ?? res?.totalElements ?? 0);
      setIsFiltered(false);
    } catch (e) {
      console.error(e);
      setPageError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    setLoading(true);
    setPageError("");
    try {
      const params = {};
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      const res = await filterExpenses(params);
      const data = res?.data ?? res ?? [];
      setExpenses(Array.isArray(data) ? data : []);
      setTotalPages(0);
      setTotalElements(Array.isArray(data) ? data.length : 0);
      setActiveFilters({ ...filters });
      setIsFiltered(true);
      setShowFilter(false);
    } catch (e) {
      console.error(e);
      setPageError("Failed to filter expenses.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      categoryId: "",
      startDate: "",
      endDate: "",
      paymentMethod: "",
    });
    setActiveFilters({});
    setIsFiltered(false);
    setPage(0);
    loadExpenses();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formData.amount || isNaN(formData.amount)) {
      setFormError("Valid amount is required.");
      return;
    }
    if (!formData.expenseDate) {
      setFormError("Date is required.");
      return;
    }
    setSubmitting(true);
    try {
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      });
      closeModal();
      setSuccessMsg("Expense added successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      setPage(0);
      loadExpenses();
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Failed to create expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: "",
      amount: "",
      expenseDate: "",
      categoryId: "",
      paymentMethod: "",
      notes: "",
    });
    setFormError("");
  };

  const handleExport = async () => {
    setExporting(true);
    setPageError("");
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await downloadExcelReport(`expenses-${stamp}.xlsx`);
    } catch (e) {
      console.error(e);
      setPageError("Failed to export report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const totalAmount = expenses.reduce(
    (s, e) => s + (parseFloat(e.amount) || 0),
    0,
  );
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <MainLayout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .exp-row:hover { background: #F8FAFC !important; }
        .exp-row { transition: background 0.15s; cursor: default; }
        .page-btn:hover:not(:disabled) { background: #EEF2FF !important; color: #4338CA !important; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .export-btn:hover:not(:disabled) { background: #F1F5F9 !important; }
        .export-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "36px 40px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#EEF2FF",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 5h14M3 10h14M3 15h8"
                    stroke="#6366F1"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="16"
                    cy="15"
                    r="3"
                    stroke="#6366F1"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                Expenses
              </h1>
            </div>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 0 52px" }}>
              {loading
                ? "Loading…"
                : `${totalElements || expenses.length} total expenses`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Export Report button */}
            <button
              className="export-btn"
              onClick={handleExport}
              disabled={exporting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#F8FAFC",
                color: "#374151",
                border: "1.5px solid #E2E8F0",
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: exporting ? "not-allowed" : "pointer",
              }}
            >
              {exporting ? (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid #CBD5E1",
                    borderTop: "2px solid #6366F1",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2v8m0 0L5 7m3 3l3-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 11v2.5A1.5 1.5 0 0 0 4.5 15h7A1.5 1.5 0 0 0 13 13.5V11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {exporting ? "Exporting…" : "Export Report"}
            </button>

            {/* Filter button */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: activeFilterCount > 0 ? "#EEF2FF" : "#F8FAFC",
                color: activeFilterCount > 0 ? "#4338CA" : "#374151",
                border: `1.5px solid ${activeFilterCount > 0 ? "#C7D2FE" : "#E2E8F0"}`,
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4h12M4 8h8M6 12h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: "#6366F1",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add Expense button */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#4F46E5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#6366F1")
              }
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              Add Expense
            </button>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        {showFilter && (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E2E8F0",
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 20,
              animation: "fadeIn 0.2s ease",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 14,
                marginBottom: 16,
              }}
            >
              {/* Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryId: e.target.value })
                  }
                  style={{ ...inputBase, padding: "10px 12px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Payment Method */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentMethod: e.target.value })
                  }
                  style={{ ...inputBase, padding: "10px 12px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              {/* Start Date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  style={{ ...inputBase, padding: "10px 12px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
              {/* End Date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748B",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  style={{ ...inputBase, padding: "10px 12px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={clearFilters}
                style={{
                  padding: "9px 18px",
                  background: "#F8FAFC",
                  color: "#374151",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={applyFilter}
                style={{
                  padding: "9px 18px",
                  background: "#6366F1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* ── Success Toast ── */}
        {successMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#F0FDF4",
              border: "1.5px solid #BBF7D0",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              animation: "fadeIn 0.3s ease",
              color: "#15803D",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5" />
              <path
                d="M5 8l2.5 2.5L11 5.5"
                stroke="#22C55E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {successMsg}
          </div>
        )}

        {/* ── Error Banner ── */}
        {pageError && (
          <div
            style={{
              background: "#FFF1F2",
              border: "1px solid #FECDD3",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#BE123C",
              fontSize: 14,
            }}
          >
            {pageError}
          </div>
        )}

        {/* ── Stats Cards ── */}
        {!loading && expenses.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total Expenses",
                value: `₹${formatAmount(totalAmount)}`,
                icon: "💸",
                bg: "#EEF2FF",
                color: "#4338CA",
              },
              {
                label: "No. of Records",
                value: expenses.length,
                icon: "📋",
                bg: "#F0FDF4",
                color: "#15803D",
              },
              {
                label: "Avg. per Expense",
                value: expenses.length
                  ? `₹${formatAmount(totalAmount / expenses.length)}`
                  : "—",
                icon: "📊",
                bg: "#FFF7ED",
                color: "#C2410C",
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "#fff",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: card.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#94A3B8",
                      margin: "0 0 2px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.label}
                  </p>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: card.color,
                      margin: 0,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 220,
              gap: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #E2E8F0",
                borderTop: "3px solid #6366F1",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
              Loading expenses…
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 24px",
              background: "#F8FAFC",
              borderRadius: 16,
              border: "1.5px dashed #CBD5E1",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>💸</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0F172A",
                margin: "0 0 6px",
              }}
            >
              {isFiltered ? "No matching expenses" : "No expenses yet"}
            </p>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 20px" }}>
              {isFiltered
                ? "Try adjusting your filters."
                : "Start tracking by adding your first expense."}
            </p>
            {!isFiltered && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: "#6366F1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add Expense
              </button>
            )}
            {isFiltered && (
              <button
                onClick={clearFilters}
                style={{
                  background: "#F1F5F9",
                  color: "#374151",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 9,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Table ── */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1.5px solid #E2E8F0",
                overflow: "hidden",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "#F8FAFC",
                  borderBottom: "1.5px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#94A3B8",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                  }}
                >
                  {isFiltered
                    ? `${expenses.length} filtered results`
                    : `Page ${page + 1} of ${totalPages || 1}`}
                </span>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    style={{
                      fontSize: 12,
                      color: "#6366F1",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✕ Clear filters
                  </button>
                )}
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E2E8F0" }}>
                    {[
                      "#",
                      "Title",
                      "Amount",
                      "Category",
                      "Payment",
                      "Date",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: i === 2 ? "right" : "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#94A3B8",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => {
                    const method =
                      METHOD_STYLES[expense.paymentMethod] ||
                      METHOD_STYLES.OTHER;
                    return (
                      <tr
                        key={expense.id}
                        className="exp-row"
                        style={{
                          borderBottom:
                            index < expenses.length - 1
                              ? "1px solid #F1F5F9"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 13,
                            color: "#CBD5E1",
                            fontWeight: 600,
                          }}
                        >
                          {String(page * size + index + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#0F172A",
                              margin: "0 0 2px",
                            }}
                          >
                            {expense.title}
                          </p>
                          {expense.notes && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "#94A3B8",
                                margin: 0,
                              }}
                            >
                              {expense.notes}
                            </p>
                          )}
                        </td>
                        <td
                          style={{ padding: "14px 16px", textAlign: "right" }}
                        >
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "#0F172A",
                              letterSpacing: "-0.3px",
                            }}
                          >
                            ₹{formatAmount(expense.amount)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {expense.categoryName ||
                          expense.category?.name ||
                          expense.category ? (
                            <span
                              style={{
                                background: "#EEF2FF",
                                color: "#4338CA",
                                borderRadius: 7,
                                padding: "4px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                textTransform: "capitalize", // Optional: makes "FOOD" look like "Food"
                              }}
                            >
                              {expense.categoryName ||
                                expense.category?.name ||
                                expense.category}
                            </span>
                          ) : (
                            <span style={{ color: "#CBD5E1", fontSize: 13 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {expense.paymentMethod ? (
                            <span
                              style={{
                                background: method.bg,
                                color: method.text,
                                borderRadius: 7,
                                padding: "4px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {method.label}
                            </span>
                          ) : (
                            <span style={{ color: "#CBD5E1", fontSize: 13 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 13,
                            color: "#64748B",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(expense.expenseDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!isFiltered && totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 24,
                }}
              >
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  style={{
                    padding: "8px 14px",
                    background: "#F8FAFC",
                    color: "#374151",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className="page-btn"
                    onClick={() => setPage(i)}
                    style={{
                      width: 36,
                      height: 36,
                      background: i === page ? "#6366F1" : "#F8FAFC",
                      color: i === page ? "#fff" : "#374151",
                      border: `1.5px solid ${i === page ? "#6366F1" : "#E2E8F0"}`,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: "8px 14px",
                    background: "#F8FAFC",
                    color: "#374151",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Expense Modal ── */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "32px",
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              animation: "slideIn 0.25s ease",
              fontFamily: "'Inter', sans-serif",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 28,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "#EEF2FF",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  💸
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: "0 0 2px",
                      letterSpacing: "-0.4px",
                    }}
                  >
                    New Expense
                  </h2>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                    Record a new expense entry
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Title */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Title <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Grocery shopping"
                  autoFocus
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>

              {/* Amount + Date */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Amount (₹) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={inputBase}
                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Date <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleFormChange}
                    style={inputBase}
                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>
              </div>

              {/* Category + Payment */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    style={{ ...inputBase, padding: "10px 12px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleFormChange}
                    style={{ ...inputBase, padding: "10px 12px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  >
                    <option value="">Select method</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Notes{" "}
                  <span
                    style={{ fontSize: 12, color: "#94A3B8", fontWeight: 400 }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Any additional details…"
                  rows={2}
                  style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>

              {/* Form Error */}
              {formError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#FFF1F2",
                    border: "1px solid #FECDD3",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#BE123C",
                    fontSize: 13,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="#EF4444"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M7 4v3.5M7 10h.01"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {formError}
                </div>
              )}

              <div style={{ height: 1, background: "#F1F5F9" }} />

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#F8FAFC",
                    color: "#374151",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F1F5F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#F8FAFC")
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: submitting ? "#A5B4FC" : "#6366F1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: submitting
                      ? "none"
                      : "0 2px 8px rgba(99,102,241,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting)
                      e.currentTarget.style.background = "#4F46E5";
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting)
                      e.currentTarget.style.background = "#6366F1";
                  }}
                  onMouseDown={(e) => {
                    if (!submitting)
                      e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.35)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M7 2v10M2 7h10"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Save Expense
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
