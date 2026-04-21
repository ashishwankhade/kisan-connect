import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import {
  CheckCircle, XCircle, Eye, Loader2, MapPin,
  Search, X, AlertTriangle, RefreshCw, Landmark, Building2,
  Info,
} from "lucide-react";

// ── Backend alignment notes ──────────────────────────────────────────
// Route:  GET  /api/crops                       → getAllCrops (admin)
// Route:  PUT  /api/admin/crops/:id/verify      { status: 'Verified'|'Rejected' }
//
// Bank fields (bankAccountName, bankAccountNumber, bankIFSC, bankName)
// live on the Crop document itself — populated by getAllCrops automatically
// since no select:false is set on those schema fields.
//
// "Missing" is shown ONLY when sellToGovt=true AND all 4 bank fields are absent.
// If the farmer didn't opt for govt sale, the bank column shows "—".
// ─────────────────────────────────────────────────────────────────────

const STATUS_TABS = ["All", "Pending", "Verified", "Rejected"];

const STATUS_STYLE = {
  Verified: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Pending:  "bg-orange-100 text-orange-700 border-orange-200",
};

// Helper: returns true only when ALL four bank fields are genuinely missing/empty
const hasBankDetails = (crop) =>
  !!(
    crop.bankAccountName?.trim() ||
    crop.bankAccountNumber?.trim() ||
    crop.bankIFSC?.trim() ||
    crop.bankName?.trim()
  );

export default function CropVerification() {
  const [crops, setCrops]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("Pending");
  const [search, setSearch]       = useState("");
  const [confirm, setConfirm]     = useState(null); // { cropId, status } | null
  const [verifying, setVerifying] = useState(null); // cropId being verified
  const [toast, setToast]         = useState(null);
  const [expandedBank, setExpandedBank] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (text, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ text, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/crops");
      setCrops(res.data);
    } catch {
      setError("Failed to load crops. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
    return () => clearTimeout(toastTimer.current);
  }, []);

  const handleVerify = async () => {
    if (!confirm) return;
    const { cropId, status } = confirm;
    setConfirm(null);
    setVerifying(cropId);
    try {
      await api.put(`/admin/crops/${cropId}/verify`, { status });
      setCrops(prev =>
        prev.map(c =>
          c._id === cropId ? { ...c, verificationStatus: status } : c
        )
      );
      showToast(
        `Crop marked as ${status} and farmer notified via WhatsApp.`,
        status === "Verified" ? "success" : "error"
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Verification failed. Please try again.",
        "error"
      );
    } finally {
      setVerifying(null);
    }
  };

  const counts = {
    All:      crops.length,
    Pending:  crops.filter(c => c.verificationStatus === "Pending").length,
    Verified: crops.filter(c => c.verificationStatus === "Verified").length,
    Rejected: crops.filter(c => c.verificationStatus === "Rejected").length,
  };

  const filteredCrops = crops.filter(c => {
    const matchesTab    = filter === "All" ? true : c.verificationStatus === filter;
    const q             = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.cropType?.toLowerCase().includes(q) ||
      c.variety?.toLowerCase().includes(q) ||
      c.farmer?.name?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.village?.toLowerCase().includes(q) ||
      c.preferredCenter?.toLowerCase().includes(q) ||
      c.bankName?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── Toast banner ── */}
      {toast && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Inline confirm dialog ── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirm.status === "Verified" ? "bg-green-100" : "bg-red-100"
              }`}>
                {confirm.status === "Verified"
                  ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : <XCircle className="w-5 h-5 text-red-500" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirm.status === "Verified" ? "Approve" : "Reject"} this crop?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The farmer will be notified via WhatsApp.
                  {confirm.status === "Rejected" && " This action marks their registration as rejected."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className={`flex-1 h-10 rounded-xl text-white text-sm font-bold transition-colors ${
                  confirm.status === "Verified"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Yes, {confirm.status === "Verified" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {status}
              {counts[status] > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  filter === status
                    ? "bg-white/20 text-white"
                    : status === "Pending"
                      ? "bg-orange-500 text-white"
                      : "bg-slate-300 text-slate-600"
                }`}>
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crop, farmer, mandi, bank..."
              className="h-9 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-green-400 w-full sm:w-64 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={fetchCrops}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Result count ── */}
      {!loading && !error && (
        <p className="text-xs text-slate-400 px-1">
          {filteredCrops.length === crops.length
            ? `${crops.length} crop${crops.length !== 1 ? "s" : ""} total`
            : `${filteredCrops.length} of ${crops.length} crops`}
          {search && (
            <span className="ml-1">
              matching <strong className="text-slate-600">"{search}"</strong>
            </span>
          )}
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-green-600" />
          <p className="text-sm text-slate-400">Loading crops...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchCrops}
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
                  <th className="px-5 py-3.5">Farmer / Crop</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Yield</th>
                  <th className="px-5 py-3.5">Govt. Sale & Mandi</th>
                  <th className="px-5 py-3.5">Bank Details</th>
                  <th className="px-5 py-3.5">Evidence</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredCrops.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Search className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                          No {filter === "All" ? "" : filter.toLowerCase() + " "}crops
                          {search ? ` matching "${search}"` : " found"}.
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="text-xs text-green-600 font-semibold hover:text-green-500"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCrops.map((crop) => (
                    <tr
                      key={crop._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        verifying === crop._id ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {/* Farmer / Crop */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {crop.cropType}
                          {crop.variety && (
                            <span className="text-xs font-normal text-slate-400 ml-1.5">
                              · {crop.variety}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {crop.farmer?.name || "Unknown Farmer"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                          {crop.season} · {crop.soilType || "—"}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1 text-slate-800 font-medium">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          {crop.village}, {crop.district}
                        </p>
                        {crop.gpsCoordinates && (
                          <p className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[160px]">
                            {crop.gpsCoordinates}
                          </p>
                        )}
                      </td>

                      {/* Yield */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{crop.area} acres</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Est. {crop.expectedYield} Qtl
                        </p>
                      </td>

                      {/* Govt. Sale & Mandi */}
                      <td className="px-5 py-4">
                        {crop.sellToGovt ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                              ✓ Yes · {crop.sellingQuantity} Qtl
                            </span>
                            {crop.preferredCenter && (
                              <p className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
                                {crop.preferredCenter}
                              </p>
                            )}
                            {crop.sellingPeriod && (
                              <p className="text-[10px] text-slate-400">
                                📅 {crop.sellingPeriod}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </td>

                      {/* ── Bank Details column — fixed logic ── */}
                      <td className="px-5 py-4">
                        {/* Case 1: Not selling to govt → show neutral dash */}
                        {!crop.sellToGovt ? (
                          <span className="text-xs text-slate-300">—</span>

                        /* Case 2: Selling to govt AND bank details exist */
                        ) : hasBankDetails(crop) ? (
                          <div>
                            <button
                              onClick={() =>
                                setExpandedBank(
                                  expandedBank === crop._id ? null : crop._id
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              <Landmark className="w-3 h-3" />
                              {expandedBank === crop._id ? "Hide" : "View"} Bank
                            </button>

                            {expandedBank === crop._id && (
                              <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 space-y-1.5 min-w-[220px]">
                                <BankRow label="Name"   val={crop.bankAccountName} />
                                <BankRow label="A/C No" val={crop.bankAccountNumber} mono />
                                <BankRow label="IFSC"   val={crop.bankIFSC} mono />
                                <BankRow label="Bank"   val={crop.bankName} />
                                {/* MSP price policy note for admin */}
                                <div className="mt-2 pt-2 border-t border-indigo-200 flex items-start gap-1.5">
                                  <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-px" />
                                  <p className="text-[10px] text-indigo-500 leading-relaxed">
                                    MSP rates may vary by state government policy. Verify the applicable rate for{" "}
                                    <span className="font-bold">{crop.state || crop.district}</span> before initiating transfer.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                        /* Case 3: Selling to govt BUT bank details missing */
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                              ⚠ Bank Details Missing
                            </span>
                            <p className="text-[10px] text-slate-400 max-w-[160px] whitespace-normal leading-relaxed">
                              Farmer opted for govt. sale but did not provide bank info. Contact them before initiating MSP payment.
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Evidence */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          {crop.cropImage ? (
                            <a
                              href={crop.cropImage}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors w-fit"
                            >
                              <Eye className="w-3 h-3" /> Crop Photo
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">No image</span>
                          )}
                          {crop.landDocument && (
                            <a
                              href={crop.landDocument}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors w-fit"
                            >
                              <Eye className="w-3 h-3" /> 7/12 Doc
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {verifying === crop._id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400 ml-auto" />
                        ) : crop.verificationStatus === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setConfirm({ cropId: crop._id, status: "Verified" })
                              }
                              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() =>
                                setConfirm({ cropId: crop._id, status: "Rejected" })
                              }
                              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-transparent text-xs font-bold transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                              STATUS_STYLE[crop.verificationStatus] || ""
                            }`}
                          >
                            {crop.verificationStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BankRow({ label, val, mono = false }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 w-12 shrink-0 pt-px">
        {label}
      </span>
      <span className={`text-[11px] text-indigo-900 font-semibold break-all ${mono ? "font-mono tracking-wider" : ""}`}>
        {val || "—"}
      </span>
    </div>
  );
}