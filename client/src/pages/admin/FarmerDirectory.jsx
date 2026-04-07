import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import {
  Users, Loader2, Phone, Mail, MapPin,
  Calendar as CalIcon, Search, X, AlertTriangle,
  RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Backend alignment notes ─────────────────────────────────────────
// Route: GET /api/admin/farmers?page=1&limit=20
//
// FIX 1: Backend now returns paginated data:
//         { farmers: [...], pagination: { total, page, limit, totalPages } }
//         The old code read `res.data` directly as an array — this broke
//         silently. Now reads `res.data.farmers` and drives pagination UI.
//
// FIX 2: "Total Registered Users: {farmers.length}" was showing the
//         count of the CURRENT PAGE, not all farmers. Now shows
//         pagination.total from the server response.
//
// FIX 3: No search, no error state, no empty state — all added.
//
// FIX 4: Added district column — was in the data but not displayed.
// ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const hue = name
    ? name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    : 200;
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 55%, 45%)` }}
    >
      {initials}
    </div>
  );
}

export default function FarmerDirectory() {
  const [farmers, setFarmers]       = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const fetchFarmers = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/admin/farmers?page=${p}&limit=${PAGE_SIZE}`);

      // FIX: handle both paginated ({ farmers, pagination }) and legacy array response
      if (Array.isArray(res.data)) {
        setFarmers(res.data);
        setPagination({ total: res.data.length, page: 1, limit: res.data.length, totalPages: 1 });
      } else {
        setFarmers(res.data.farmers || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
      }
    } catch {
      setError("Failed to load farmers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers(page);
  }, [page, fetchFarmers]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side search within the current page
  const filtered = search
    ? farmers.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search) ||
        u.district?.toLowerCase().includes(search.toLowerCase())
      )
    : farmers;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── Header card ── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3.5 rounded-xl text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Farmer Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading
                ? "Loading..."
                // FIX: show total from server, not current page length
                : `${pagination.total} registered farmer${pagination.total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Search + refresh */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, phone, district..."
              className="h-9 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 w-full sm:w-56 transition-colors"
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
            onClick={() => fetchFarmers(page)}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          <p className="text-sm text-slate-400">Loading farmers...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col h-64 items-center justify-center gap-4 bg-white rounded-2xl border border-slate-100">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => fetchFarmers(page)}
            className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3 bg-white rounded-2xl border border-dashed border-slate-200">
          <Users className="w-8 h-8 text-slate-200" />
          <p className="text-sm text-slate-400 font-medium">
            {search ? `No farmers matching "${search}"` : "No farmers registered yet."}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-blue-600 font-semibold hover:text-blue-500">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Farmer</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">District</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {filtered.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">

                      {/* Name + avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px]">{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        {user.phone ? (
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">No phone</span>
                        )}
                      </td>

                      {/* District — FIX: was missing from table */}
                      <td className="px-5 py-3.5">
                        {user.district ? (
                          <span className="flex items-center gap-1.5 text-slate-600 text-xs">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                            {user.district}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border border-blue-100">
                          {user.role || "Farmer"}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <CalIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          {!search && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ·{" "}
                {pagination.total} farmers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number pills */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span key={`ellipsis-${i}`} className="text-xs text-slate-400 px-1">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-colors ${
                          item === page
                            ? "bg-slate-900 text-white"
                            : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}