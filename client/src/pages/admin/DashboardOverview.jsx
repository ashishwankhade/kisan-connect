import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  Users, Sprout, Store, Clock, Loader2, ArrowRight,
  Wheat, Tractor, Layers, AlertTriangle, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// ── Backend alignment notes ──────────────────────────────────────────
// Routes used:
//   GET /api/admin/stats
//     → { totalFarmers, totalCrops, pendingCrops, totalProcurement,
//          totalLands, totalEquipment, availableLands }
//   GET /api/admin/procurement
//     → crops[] where sellToGovt === true
//
// FIX 1: Was silently swallowing all API errors with no error UI.
//         Added proper error state with a Retry button.
//
// FIX 2: stats.totalLands, stats.totalEquipment, stats.availableLands
//         were fetched by the backend but never displayed. Added two
//         extra stat cards (marketplace health).
//
// FIX 3: Chart tooltip for the Bar view used `ctx.parsed.x` but the
//         axis is `indexAxis: 'y'` so the actual value is in `ctx.raw`.
//         Fixed to use `ctx.raw` for both chart types for consistency.
//
// FIX 4: `groupProcurement` was not defensive against null/undefined
//         in sellingQuantity — summing undefined gives NaN which breaks
//         the chart. Added `|| 0` guard.
// ─────────────────────────────────────────────────────────────────────

const PALETTE = [
  "#EF9F27", // amber  — Wheat
  "#639922", // green  — Rice
  "#84cc16", // lime   — Soybean
  "#378ADD", // blue   — Cotton
  "#D4537E", // pink   — Maize
  "#f97316", // orange — Others
];

function groupProcurement(crops) {
  const map = {};
  for (const c of crops) {
    const key = `${c.cropType}||${c.variety || "Mixed"}`;
    if (!map[key]) {
      map[key] = { cropType: c.cropType, variety: c.variety || "Mixed", totalQtl: 0, count: 0 };
    }
    // FIX: guard against undefined/null sellingQuantity
    map[key].totalQtl += Number(c.sellingQuantity) || 0;
    map[key].count    += 1;
  }
  return Object.values(map)
    .sort((a, b) => b.totalQtl - a.totalQtl)
    .slice(0, 6);
}

export default function DashboardOverview({ setActiveTab }) {
  const [stats, setStats]             = useState(null);
  const [procurement, setProcurement] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [chartType, setChartType]     = useState("donut");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, procRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/procurement"),
      ]);
      setStats(statsRes.data);
      setProcurement(procRes.data || []);
    } catch {
      // FIX: surface the error instead of swallowing it
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  // FIX: proper error UI with retry
  if (error) {
    return (
      <div className="flex flex-col h-64 items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchAll}
          className="h-9 px-5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    );
  }

  const grouped      = groupProcurement(procurement);
  const totalProcQtl = stats?.totalProcurement || 0;

  const chartLabels = grouped.map(g => `${g.cropType} · ${g.variety}`);
  const chartData   = grouped.map(g => g.totalQtl);
  const chartColors = grouped.map((_, i) => PALETTE[i % PALETTE.length]);

  /* ── Donut config ── */
  const donutData = {
    labels: chartLabels,
    datasets: [{
      data: chartData,
      backgroundColor: chartColors,
      borderWidth: 2,
      borderColor: "#ffffff",
      hoverOffset: 6,
    }],
  };
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // FIX: use ctx.raw (the actual data value) instead of ctx.parsed
          label: (ctx) => {
            const val = ctx.raw;
            const pct = totalProcQtl > 0 ? Math.round((val / totalProcQtl) * 100) : 0;
            return ` ${val.toLocaleString()} Qtl (${pct}%)`;
          },
        },
      },
    },
  };

  /* ── Bar config ── */
  const barData = {
    labels: chartLabels,
    datasets: [{
      label: "Quintals",
      data: chartData,
      backgroundColor: chartColors,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // FIX: indexAxis='y' means the value is in ctx.raw, not ctx.parsed.x
          label: (ctx) => {
            const val = ctx.raw;
            const pct = totalProcQtl > 0 ? Math.round((val / totalProcQtl) * 100) : 0;
            return ` ${val.toLocaleString()} Qtl (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { color: "#888", font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#555", font: { size: 11 } },
      },
    },
  };

  const barHeight = Math.max(220, grouped.length * 48 + 60);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ══ STAT CARDS — row 1: farmer + crop metrics ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Farmers</p>
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                {(stats?.totalFarmers || 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-green-100 p-3.5 rounded-2xl text-green-600 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Crops Registered</p>
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                {(stats?.totalCrops || 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm relative overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4 relative z-10">
            <div className="bg-orange-100 p-3.5 rounded-2xl text-orange-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Approvals</p>
              <h3 className="text-3xl font-extrabold text-orange-600 leading-none mt-1">
                {stats?.pendingCrops || 0}
              </h3>
            </div>
            {stats?.pendingCrops > 0 && (
              <button
                onClick={() => setActiveTab("crops")}
                className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors"
              >
                Review <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-white/15 p-3.5 rounded-2xl text-green-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Govt Procurement</p>
              <h3 className="text-3xl font-extrabold leading-none mt-1">
                {totalProcQtl.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">Qtl</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {procurement.length} listing{procurement.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ STAT CARDS — row 2: marketplace health ══
           FIX: these three values were returned by the backend
           (totalLands, totalEquipment, availableLands) but never shown. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Land Listings</p>
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                {stats?.totalLands || 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {stats?.availableLands || 0} available
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600 shrink-0">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Equipment Listings</p>
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                {stats?.totalEquipment || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-purple-100 p-3.5 rounded-2xl text-purple-600 shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Land Utilisation</p>
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none mt-1">
                {stats?.totalLands
                  ? `${Math.round(((stats.totalLands - (stats.availableLands || 0)) / stats.totalLands) * 100)}%`
                  : "—"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">rented out</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ PROCUREMENT CHART CARD ══ */}
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardContent className="p-6">

          {/* Card header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Wheat className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Procurement by Crop Type &amp; Variety
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {grouped.length} crop group{grouped.length !== 1 ? "s" : ""} · {totalProcQtl.toLocaleString()} Qtl total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={fetchAll}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Chart type toggle */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {["donut", "bar"].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                      chartType === type
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No procurement listings yet</p>
              <p className="text-xs text-slate-300">
                Crops with "Sell to Government" enabled will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
                {grouped.map((g, i) => {
                  const pct = totalProcQtl > 0 ? Math.round((g.totalQtl / totalProcQtl) * 100) : 0;
                  return (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="font-medium text-slate-700">{g.cropType}</span>
                      <span className="text-slate-400">{g.variety}</span>
                      <span className="font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>
                        {pct}%
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* ── Donut ── */}
              {chartType === "donut" && (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
                    <Doughnut data={donutData} options={donutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-extrabold text-slate-900 leading-none">
                        {totalProcQtl.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">quintals</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full divide-y divide-slate-50">
                    {grouped.map((g, i) => {
                      const pct = totalProcQtl > 0 ? Math.round((g.totalQtl / totalProcQtl) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3 py-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {g.cropType}
                              <span className="font-normal text-slate-400 ml-1">· {g.variety}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: PALETTE[i % PALETTE.length],
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 w-6 text-right">{pct}%</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-slate-800">
                              {g.totalQtl.toLocaleString()}
                              <span className="text-[10px] font-normal text-slate-400 ml-0.5">Qtl</span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {g.count} farmer{g.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Bar ── */}
              {chartType === "bar" && (
                <div style={{ position: "relative", width: "100%", height: barHeight }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ══ QUICK ACTIONS BANNER ══ */}
      <div className="bg-green-600 rounded-2xl p-7 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Welcome to AgriSmart Admin</h2>
          <p className="text-green-100 text-sm">
            Review pending crop registrations to ensure marketplace and procurement integrity.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("crops")}
          className="relative z-10 flex items-center gap-2 bg-white text-green-700 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-green-50 transition-colors whitespace-nowrap text-sm"
        >
          Start Verifying Crops
          {stats?.pendingCrops > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              {stats.pendingCrops > 9 ? "9+" : stats.pendingCrops}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}