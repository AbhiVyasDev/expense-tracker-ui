import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import MainLayout from "../layouts/MainLayout";
import {
  getDashboardSummary,
  getCategoryWiseReport,
  getMonthlyReport,
  getBudgetOverview,
  getMonthComparison,
} from "../services/dashboardService";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler
);

// ── palette ────────────────────────────────────────────────────────────────
const COLORS = ["#185fa5", "#0f6e56", "#854f0b", "#993556", "#533ab7", "#5f5e5a"];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n != null ? "₹" + Number(n).toLocaleString("en-IN") : "—";

function PctBadge({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
      up ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
    }`}>
      {up ? "+" : ""}{Math.round(value)}%
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
      Loading…
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      {children}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, pct, accentColor }) {
  return (
    <Card className="flex flex-col gap-1" style={{ borderLeft: `3px solid ${accentColor}` }}>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{label}</span>
        <PctBadge value={pct} />
      </div>
      <p className="text-2xl font-medium text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </Card>
  );
}

function Insight({ icon, color, text }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-base mt-0.5" style={{ color }}>{icon}</span>
      <p className="text-sm text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

// ── chart builders ─────────────────────────────────────────────────────────
function buildDoughnut(categoryData) {
  // shape: [{ categoryName, totalAmount }]
  return {
    data: {
      labels: categoryData.map((c) => c.categoryName),
      datasets: [{
        data: categoryData.map((c) => c.totalAmount),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: { legend: { display: false } },
    },
  };
}

function buildTrend(monthlyData) {
  // shape: [{ month: 5, amount: 2950 }, { month: 6, amount: 9649 }]
  return {
    data: {
      labels: monthlyData.map((m) => MONTH_NAMES[(m.month - 1) % 12]),
      datasets: [{
        label: "Expense",
        data: monthlyData.map((m) => m.amount),
        borderColor: "#185fa5",
        backgroundColor: "rgba(24,95,165,0.08)",
        pointBackgroundColor: "#185fa5",
        pointRadius: 4,
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: { callback: (v) => "₹" + Math.round(v / 1000) + "k", font: { size: 11 } },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  };
}

// ── derive insights ────────────────────────────────────────────────────────
function deriveInsights(summary, compData, categoryData) {
  const insights = [];

  // month-over-month from comparison endpoint
  if (compData?.percentageChange != null) {
    const pct = Math.abs(Math.round(compData.percentageChange));
    const up = compData.percentageChange >= 0;
    insights.push({
      icon: up ? "📈" : "✅",
      color: up ? "#a32d2d" : "#0f6e56",
      text: up
        ? `Spending is <strong>up ${pct}%</strong> vs last month (${fmt(compData.difference)} more).`
        : `Spending is <strong>down ${pct}%</strong> vs last month — great job!`,
    });
  }

  // top category
  if (categoryData?.length) {
    const top = [...categoryData].sort((a, b) => b.totalAmount - a.totalAmount)[0];
    insights.push({
      icon: "🏆",
      color: "#185fa5",
      text: `<strong>${top.categoryName}</strong> is your biggest spend category this month at ${fmt(top.totalAmount)}.`,
    });
  }

  // total categories tracked
  if (summary?.totalCategories) {
    insights.push({
      icon: "📊",
      color: "#533ab7",
      text: `You're tracking expenses across <strong>${summary.totalCategories} categories</strong>.`,
    });
  }

  // today spend
  if (summary?.todayExpense === 0) {
    insights.push({
      icon: "💚",
      color: "#0f6e56",
      text: "No expenses recorded today — great start!",
    });
  }

  if (insights.length < 2) {
    insights.push({
      icon: "💡",
      color: "#533ab7",
      text: "Add more expenses to unlock personalised insights.",
    });
  }

  return insights;
}

// ══════════════════════════════════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const [summary, setSummary]       = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [monthlyData, setMonthlyData]   = useState(null);
  const [budgetData, setBudgetData]     = useState(null);
  const [compData, setCompData]         = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, catRes, monthlyRes, budgetRes, compRes] =
        await Promise.allSettled([
          getDashboardSummary(),
          getCategoryWiseReport(),
          getMonthlyReport(),
          getBudgetOverview(),
          getMonthComparison(),
        ]);

      // summary → direct object { totalExpense, currentMonthExpense, todayExpense, totalCategories }
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);

      // category-wise → array [{ categoryName, totalAmount }]
      if (catRes.status === "fulfilled") setCategoryData(catRes.value);

      // monthly → array [{ month, amount }]
      if (monthlyRes.status === "fulfilled") setMonthlyData(monthlyRes.value);

      // budget-overview → ApiResponse { data: [...] }
      if (budgetRes.status === "fulfilled") {
        const raw = budgetRes.value;
        setBudgetData(Array.isArray(raw) ? raw : raw?.data ?? []);
      }

      // month-comparison → ApiResponse { data: { currentMonth, previousMonth, difference, percentageChange } }
      if (compRes.status === "fulfilled") {
        const raw = compRes.value;
        setCompData(raw?.data ?? raw);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const doughnut = categoryData?.length ? buildDoughnut(categoryData) : null;
  const trend    = monthlyData?.length  ? buildTrend(monthlyData)    : null;
  const insights = deriveInsights(summary, compData, categoryData);

  return (
    <MainLayout>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        <button
          onClick={loadAll}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── overview cards ── */}
        <Section label="Overview">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Total expense"
              value={fmt(summary?.totalExpense)}
              sub={`${summary?.totalCategories ?? "—"} categories tracked`}
              accentColor="#185fa5"
            />
            <MetricCard
              label="This month"
              value={fmt(summary?.currentMonthExpense)}
              sub={compData?.previousMonth ? `vs ${fmt(compData.previousMonth)} last month` : undefined}
              pct={compData?.percentageChange != null ? Math.round(compData.percentageChange) : null}
              accentColor="#0f6e56"
            />
            <MetricCard
              label="Today"
              value={fmt(summary?.todayExpense)}
              sub="Expenses recorded today"
              accentColor="#854f0b"
            />
          </div>
        </Section>

        {/* ── category + monthly trend ── */}
        <div className="grid grid-cols-2 gap-4">
          <Section label="Category breakdown">
            <Card>
              {!doughnut ? (
                loading ? <Spinner /> : <p className="text-sm text-gray-400">No category data yet.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                    {categoryData.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                        <span
                          className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {c.categoryName} — {fmt(c.totalAmount)}
                      </span>
                    ))}
                  </div>
                  <div className="h-48">
                    <Doughnut {...doughnut} />
                  </div>
                </>
              )}
            </Card>
          </Section>

          <Section label="Monthly trend">
            <Card>
              {!trend ? (
                loading ? <Spinner /> : <p className="text-sm text-gray-400">No monthly data yet.</p>
              ) : (
                <div className="h-56">
                  <Line {...trend} />
                </div>
              )}
            </Card>
          </Section>
        </div>

        {/* ── month comparison + budget ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* month comparison — stat cards since API returns two scalars */}
          <Section label="Month comparison">
            <Card>
              {!compData ? (
                loading ? <Spinner /> : <p className="text-sm text-gray-400">No comparison data.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Last month</p>
                      <p className="text-xl font-medium text-gray-700">{fmt(compData.previousMonth)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">This month</p>
                      <p className="text-xl font-medium text-blue-700">{fmt(compData.currentMonth)}</p>
                    </div>
                  </div>
                  <div className={`rounded-lg p-4 ${compData.difference >= 0 ? "bg-red-50" : "bg-green-50"}`}>
                    <p className="text-xs text-gray-400 mb-1">Difference</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-xl font-medium ${compData.difference >= 0 ? "text-red-700" : "text-green-700"}`}>
                        {compData.difference >= 0 ? "+" : ""}{fmt(compData.difference)}
                      </p>
                      <PctBadge value={compData.percentageChange != null ? Math.round(compData.percentageChange) : null} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {compData.difference >= 0 ? "Spent more than last month" : "Spent less than last month"}
                    </p>
                  </div>

                  {/* visual bar comparison */}
                  {compData.previousMonth > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Last month</span>
                        <span>This month</span>
                      </div>
                      <div className="flex gap-2 items-end h-16">
                        {(() => {
                          const max = Math.max(compData.previousMonth, compData.currentMonth);
                          const prevH = Math.round((compData.previousMonth / max) * 100);
                          const currH = Math.round((compData.currentMonth / max) * 100);
                          return (
                            <>
                              <div className="flex-1 flex flex-col justify-end">
                                <div className="bg-gray-300 rounded-t-md w-full transition-all" style={{ height: `${prevH}%` }} />
                              </div>
                              <div className="flex-1 flex flex-col justify-end">
                                <div className="bg-blue-500 rounded-t-md w-full transition-all" style={{ height: `${currH}%` }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Section>

          {/* budget overview */}
          <Section label="Budget overview">
            <Card>
              {!budgetData ? (
                loading ? <Spinner /> : <p className="text-sm text-gray-400">No budget data.</p>
              ) : budgetData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <p className="text-sm text-gray-400">No budgets set yet.</p>
                  <p className="text-xs text-gray-300">Go to Budgets to create one.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-gray-400 mb-3">
                    <span>Category</span><span>Spent / Limit</span>
                  </div>
                  {budgetData.map((b, i) => {
                    const name  = b.categoryName || b.category || b.name;
                    const spent = b.spentAmount  || b.spent    || 0;
                    const limit = b.budgetAmount  || b.limit   || 1;
                    const pct   = Math.min(100, Math.round((spent / limit) * 100));
                    const over  = spent > limit;
                    return (
                      <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                        <span className="text-xs text-gray-700 w-20 truncate flex-shrink-0">{name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: over ? "#a32d2d" : COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: over ? "#a32d2d" : "#6b7280" }}>
                          {pct}%
                        </span>
                        <span className="text-xs text-gray-400 w-28 text-right flex-shrink-0">
                          {fmt(spent)} / {fmt(limit)}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </Card>
          </Section>
        </div>

        {/* ── insights ── */}
        <Section label="Insights">
          <Card>
            <div className="grid grid-cols-2 gap-x-8">
              {insights.map((ins, i) => (
                <Insight key={i} {...ins} />
              ))}
            </div>
          </Card>
        </Section>

      </div>
    </MainLayout>
  );
}

export default Dashboard;