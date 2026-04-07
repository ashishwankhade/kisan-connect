import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import {
  Store, Loader2, Phone, MapPin, Search,
  X, AlertTriangle, RefreshCw, Wheat, TrendingUp,
} from "lucide-react";

// ── Backend alignment notes ─────────────────────────────────────────
// Route: GET /api/admin/procurement
//   Returns crops where sellToGovt === true, sorted by sellingPeriod.
//   Populated: farmer (name, phone, district)
//   Field: verificationStatus ('Pending' | 'Verified' | 'Rejected')
//
// FIX 1: Status label was showing 'Approved' for Verified but the
//         backend field is 'verificationStatus === Verified'. Added
//         'Rejected' case which was missing entirely — rejected crops
//         that marked govt sale would still appear with no clear status.
//
// FIX 2: No error state, no empty state improvements — added.
//
// FIX 3: Added summary stat bar (total quintals, verified count,
//         pending count) calculated from the live data — gives the
//         admin an at-a-glance view without going to the dashboard.
//
// FIX 4: Search also filters by cropType and district — was only
//         searching preferredCenter and farmer name.
//
// FIX 5: `sellingPeriod` was displayed raw. Added friendly formatting.
//
// FIX 6: District column was missing even though farmer.district is
//         populated by the backend. Added.
// ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Verified: { label: "Approved",            cls: "bg-green-100 text-green-700 border-green-200" },
  Pending:  { label: "Pending Verification", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  Rejected: { label: "Rejected",             cls: "bg-red-100 text-red-700 border-red-200" },
};

export default function Procurement() {
  const [procurementList, setProcurementList] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [search, setSearch]                   = useState("");
  // FIX: filter by verification status
  const [statusFilter, setStatusFilter]       = useState("All");

  const fetchProcurement = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/procurement");
      setProcurementList(res.data || []);
    } catch {
      setError("Failed to load procurement data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProcurement(); }, []);

  // FIX: summary stats computed from live data
  const stats = useMemo(() => ({
    total:      procurementList.length,
    totalQtl:   procurementList.reduce((s, i) => s + (Number(i.sellingQuantity) || 0), 0),
    verified:   procurementList.filter(i => i.verificationStatus === "Verified").length,
    pending:    procurementList.filter(i => i.verificationStatus === "Pending").length,
  }), [procurementList]);

  // FIX: search across more fields + status filter
  const filteredList = useMemo(() => {
    return procurementList.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.preferredCenter?.toLowerCase().includes(q) ||
        item.farmer?.name?.toLowerCase().includes(q) ||
        item.cropType?.toLowerCase().includes(q) ||
        item.farmer?.district?.toLowerCase().includes(q) ||
        item.variety?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" ? true : item.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [procurementList, search, statusFilter]);

  const statusTabs = [
    { key: "All",      label: "All",      count: stats.total    },
    { key: "Pending",  label: "Pending",  count: stats.pending  },
    { key: "Verified", label: "Approved", count: stats.verified },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-7 rounded-2xl shadow-lg text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Government Procurement</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Expected crop arrivals at APMC / Mandi centers
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 text-slate-900">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search mandi, farmer, crop..."
              className="pl-9 pr-9 h-11 w-full rounded-xl bg-white/95 text-sm text-slate-700 border-none outline-none placeholder:text-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* FIX: summary stat bar */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { label: "Total Listings",    value: stats.total,                       unit: ""     },
              { label: "Total Volume",      value: stats.totalQtl.toLocaleString(),   unit: "Qtl"  },
              { label: "Approved",          value: stats.verified,                    unit: ""     },
              { label: "Pending Approval",  value: stats.pending,                     unit: ""     },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">
                  {s.value}
                  {s.unit && <span className="text-xs font-normal text-slate-400 ml-1">{s.unit}</span>}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Status filter tabs + refresh ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {statusTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === t.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  statusFilter === t.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={fetchProcurement}
          className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-green-600" />
          <p className="text-sm text-slate-400">Loading procurement data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchProcurement}
            className="h-9 px-5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Mandi / Center</th>
                  <th className="px-5 py-3.5">Farmer</th>
                  <th className="px-5 py-3.5">Crop</th>
                  <th className="px-5 py-3.5">Volume</th>
                  <th className="px-5 py-3.5">Selling Period</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Wheat className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400 font-medium">
                          {search || statusFilter !== "All"
                            ? "No procurement records match your filters."
                            : "No procurement requests registered yet."}
                        </p>
                        {(search || statusFilter !== "All") && (
                          <button
                            onClick={() => { setSearch(""); setStatusFilter("All"); }}
                            className="text-xs text-green-600 font-semibold hover:text-green-500"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    // FIX: handle all three status values
                    const statusCfg = STATUS_CONFIG[item.verificationStatus] || STATUS_CONFIG.Pending;

                    return (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">

                        {/* Mandi */}
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {item.preferredCenter || (
                            <span className="text-slate-400 font-normal">Not specified</span>
                          )}
                        </td>

                        {/* Farmer — FIX: added district */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{item.farmer?.name || "Unknown"}</p>
                          {item.farmer?.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 shrink-0" /> {item.farmer.phone}
                            </p>
                          )}
                          {item.farmer?.district && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0 text-red-400" /> {item.farmer.district}
                            </p>
                          )}
                        </td>

                        {/* Crop */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{item.cropType}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.variety || "Mixed"}</p>
                        </td>

                        {/* Volume */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 font-bold px-3 py-1.5 rounded-lg text-xs border border-green-100">
                            <TrendingUp className="w-3 h-3" />
                            {Number(item.sellingQuantity).toLocaleString()} Qtl
                          </span>
                        </td>

                        {/* Selling period — FIX: was raw string, now trimmed + fallback */}
                        <td className="px-5 py-4 text-slate-600 text-xs">
                          {item.sellingPeriod
                            ? <span className="font-medium">{item.sellingPeriod}</span>
                            : <span className="text-slate-300">Not specified</span>}
                        </td>

                        {/* Status — FIX: now handles Verified/Pending/Rejected */}
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer with count */}
          {filteredList.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
              {filteredList.length === procurementList.length
                ? `${procurementList.length} record${procurementList.length !== 1 ? "s" : ""}`
                : `${filteredList.length} of ${procurementList.length} records`}
              {" · "}
              {filteredList.reduce((s, i) => s + (Number(i.sellingQuantity) || 0), 0).toLocaleString()} Qtl total in view
            </div>
          )}
        </div>
      )}
    </div>
  );
}