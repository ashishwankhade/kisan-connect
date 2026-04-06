import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import {
  Users, Sprout, Store, Clock, Loader2, ArrowRight, Wheat,
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

/* ── Crop accent palette ── */
const PALETTE = [
  "#EF9F27", // amber  — Wheat
  "#639922", // green  — Rice
  "#84cc16", // lime   — Soybean
  "#378ADD", // blue   — Cotton
  "#D4537E", // pink   — Maize
  "#f97316", // orange — Sugarcane / Others
];

/* ── Group crops by type+variety, sum quintals, top 6 ── */
function groupProcurement(crops) {
  const map = {};
  for (const c of crops) {
    const key = `${c.cropType}||${c.variety || "Mixed"}`;
    if (!map[key]) {
      map[key] = { cropType: c.cropType, variety: c.variety || "Mixed", totalQtl: 0, count: 0 };
    }
    map[key].totalQtl += c.sellingQuantity || 0;
    map[key].count    += 1;
  }
  return Object.values(map)
    .sort((a, b) => b.totalQtl - a.totalQtl)
    .slice(0, 6);
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function DashboardOverview({ setActiveTab }) {
  const [stats, setStats]             = useState(null);
  const [procurement, setProcurement] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [chartType, setChartType]     = useState("donut"); // "donut" | "bar"

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, procRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/procurement"),
        ]);
        setStats(statsRes.data);
        setProcurement(procRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
          label: (ctx) => {
            const pct = totalProcQtl > 0
              ? Math.round((ctx.parsed / totalProcQtl) * 100)
              : 0;
            return ` ${ctx.parsed.toLocaleString()} Qtl (${pct}%)`;
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
          label: (ctx) => {
            const pct = totalProcQtl > 0
              ? Math.round((ctx.parsed.x / totalProcQtl) * 100)
              : 0;
            return ` ${ctx.parsed.x.toLocaleString()} Qtl (${pct}%)`;
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

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Total Farmers</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats?.totalFarmers || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Crops Registered</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats?.totalCrops || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm relative overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Pending Approvals</p>
              <h3 className="text-3xl font-extrabold text-orange-600">{stats?.pendingCrops || 0}</h3>
            </div>
            {stats?.pendingCrops > 0 && (
              <button
                onClick={() => setActiveTab("crops")}
                className="absolute bottom-4 right-4 text-xs font-bold text-orange-600 hover:underline flex items-center"
              >
                Review <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl text-green-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Govt Procurement</p>
              <h3 className="text-3xl font-extrabold">
                {totalProcQtl.toLocaleString()}
                <span className="text-sm font-normal text-slate-400 ml-1">Qtl</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {procurement.length} listing{procurement.length !== 1 ? "s" : ""}
              </p>
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
                <h3 className="text-sm font-bold text-slate-900">Procurement by Crop Type &amp; Variety</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {grouped.length} crop group{grouped.length !== 1 ? "s" : ""} · {totalProcQtl.toLocaleString()} Qtl total
                </p>
              </div>
            </div>

            {/* Chart type toggle */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setChartType("donut")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === "donut"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Donut
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === "bar"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-stone-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No procurement listings yet</p>
            </div>
          ) : (
            <>
              {/* Legend — always visible */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
                {grouped.map((g, i) => {
                  const pct = Math.round((g.totalQtl / totalProcQtl) * 100);
                  return (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="font-medium text-slate-700">{g.cropType}</span>
                      <span className="text-slate-400">{g.variety}</span>
                      <span className="font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>{pct}%</span>
                    </span>
                  );
                })}
              </div>

              {/* ── DONUT ── */}
              {chartType === "donut" && (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Chart */}
                  <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
                    <Doughnut data={donutData} options={donutOptions} />
                    {/* Centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-extrabold text-slate-900 leading-none">
                        {totalProcQtl.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">quintals</p>
                    </div>
                  </div>

                  {/* Per-group detail list */}
                  <div className="flex-1 w-full divide-y divide-slate-50">
                    {grouped.map((g, i) => {
                      const pct = Math.round((g.totalQtl / totalProcQtl) * 100);
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
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
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
                            <p className="text-[10px] text-slate-400">{g.count} farmer{g.count !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── BAR ── */}
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
      <div className="bg-green-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Welcome to AgriSmart Admin</h2>
          <p className="text-green-100">
            Review pending crop registrations to ensure marketplace and procurement integrity.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("crops")}
          className="relative z-10 bg-white text-green-700 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-green-50 transition-colors whitespace-nowrap"
        >
          Start Verifying Crops
        </button>
      </div>

    </div>
  );
}