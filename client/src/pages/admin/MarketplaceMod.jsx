import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import {
  Tractor, MapPin, Trash2, Loader2, AlertTriangle,
  Layers, RefreshCw, X, CheckCircle, Search,
  Sprout, Phone,
} from "lucide-react";

// ── Backend alignment notes ─────────────────────────────────────────
// Route: GET    /api/admin/marketplace
//        DELETE /api/admin/marketplace/:type/:id
//
// FIX 1: window.confirm + alert() → replaced with inline confirm dialog
//         and toast banner (same pattern used across all admin pages).
//
// FIX 2: After successful delete, the fixed backend now also cancels
//         all pending Requests for that item. The UI should reflect this
//         immediately — we do that via optimistic state removal.
//
// FIX 3: Price display was `₹{item.price}` (raw number, no formatting).
//         Changed to `toLocaleString()` for proper Indian number format.
//
// FIX 4: Owner info (name + phone) was available in the data from the
//         populate('owner', 'name phone') call but never shown in the card.
//         Added owner info row to each card.
//
// FIX 5: No search, no error state, no empty state improvements — added.
//
// FIX 6: Land listings show `land` as type but backend expects exactly
//         'land' or 'equipment' — verified and consistent.
// ────────────────────────────────────────────────────────────────────

export default function MarketplaceMod() {
  const [data, setData]         = useState({ lands: [], equipment: [] });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState("land");
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);   // item id being deleted
  const [confirm, setConfirm]   = useState(null);   // { type, id, title }
  const [toast, setToast]       = useState(null);
  const toastTimer              = useRef(null);

  const showToast = (text, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ text, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/marketplace");
      setData(res.data);
    } catch {
      setError("Failed to load marketplace data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => clearTimeout(toastTimer.current);
  }, []);

  const handleDeleteConfirmed = async () => {
    if (!confirm) return;
    const { type, id, title } = confirm;
    setConfirm(null);
    setDeleting(id);
    try {
      await api.delete(`/admin/marketplace/${type}/${id}`);
      // FIX: optimistic removal — no full refetch
      setData(prev => ({
        ...prev,
        lands:     type === "land"      ? prev.lands.filter(i => i._id !== id)      : prev.lands,
        equipment: type === "equipment" ? prev.equipment.filter(i => i._id !== id)  : prev.equipment,
      }));
      showToast(`"${title}" removed. Any pending requests were cancelled.`, "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete listing.",
        "error"
      );
    } finally {
      setDeleting(null);
    }
  };

  // Filtered list for current tab
  const currentList = (tab === "land" ? data.lands : data.equipment).filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.owner?.name?.toLowerCase().includes(q) ||
      item.user?.name?.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: "land",      label: "Land Listings",      count: data.lands.length      },
    { key: "equipment", label: "Equipment Listings",  count: data.equipment.length  },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── Toast ── */}
      {toast && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.text}
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Confirm dialog ── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove this listing?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">"{confirm.title}"</span> will be permanently deleted.
                  All pending rental requests for it will also be cancelled and requesters notified.
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
                onClick={handleDeleteConfirmed}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
              >
                Remove Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab + search bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                tab === t.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.key === "land" ? <Layers className="w-3.5 h-3.5" /> : <Tractor className="w-3.5 h-3.5" />}
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                tab === t.key ? "bg-white/20" : "bg-slate-200 text-slate-500"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + refresh */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab} listings...`}
              className="h-9 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-red-400 w-full sm:w-56 shadow-sm transition-colors"
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
            onClick={fetchData}
            className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Result count ── */}
      {!loading && !error && (
        <p className="text-xs text-slate-400 px-1">
          {currentList.length === (tab === "land" ? data.lands : data.equipment).length
            ? `${currentList.length} listing${currentList.length !== 1 ? "s" : ""}`
            : `${currentList.length} of ${(tab === "land" ? data.lands : data.equipment).length} listings`}
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-green-600" />
          <p className="text-sm text-slate-400">Loading marketplace...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchData}
            className="h-9 px-5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 gap-3">
          {tab === "land"
            ? <Layers className="w-9 h-9 text-slate-200" />
            : <Tractor className="w-9 h-9 text-slate-200" />}
          <p className="text-sm text-slate-400 font-medium">
            {search
              ? `No ${tab} listings matching "${search}"`
              : `No ${tab} listings yet.`}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-red-600 font-semibold hover:text-red-500">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentList.map((item) => {
            const itemDeleting = deleting === item._id;
            // FIX: owner ref is `owner` on Land, `user` on Equipment
            const owner = item.owner || item.user;
            const title = item.title || item.name || "Untitled";
            const isAvailable = item.isAvailable === true;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col transition-opacity ${
                  itemDeleting ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {tab === "land"
                        ? <Sprout className="w-9 h-9 text-slate-200" />
                        : <Tractor className="w-9 h-9 text-slate-200" />}
                    </div>
                  )}

                  {/* Price chip — FIX: formatted with toLocaleString */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-slate-900">
                      ₹{Number(item.price).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-0.5">
                      {tab === "equipment" ? "/day" : "/mo"}
                    </span>
                  </div>

                  {/* Availability badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                    isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    {isAvailable ? "Available" : "Rented"}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h3 className="font-bold text-slate-900 line-clamp-1 text-sm">{title}</h3>

                  {/* Location */}
                  <p className="text-[11px] flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{item.location || "—"}</span>
                  </p>

                  {/* FIX: Owner info — was in the data but never displayed */}
                  {owner && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                        {owner.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-700 truncate">{owner.name}</p>
                        {owner.phone && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> {owner.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => setConfirm({ type: tab, id: item._id, title })}
                    disabled={itemDeleting}
                    className="mt-auto w-full h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {itemDeleting
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing...</>
                      : <><Trash2 className="w-3.5 h-3.5" /> Remove Listing</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}