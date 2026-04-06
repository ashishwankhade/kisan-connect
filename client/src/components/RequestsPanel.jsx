// ============================================================
// RequestsPanel.jsx
// Self-contained requests component — fetches its own data.
// Import into UserProfile and drop in as a tab.
//
// Props:
//   onRefreshListings — callback so UserProfile can re-fetch
//                       lands/equipment after an approve/reject
//                       (availability badges update instantly)
// ============================================================
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  Loader2, ArrowDownLeft, ArrowUpRight, CheckCircle,
  XCircle, Clock, Calendar, MapPin, Mail, Phone,
  Sprout, Tractor, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";

/* ── tiny shared helpers ── */
const STATUS_CFG = {
  Pending:  { bg: "bg-orange-50",  text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-400", Icon: Clock        },
  Approved: { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500",  Icon: CheckCircle  },
  Rejected: { bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-400",    Icon: XCircle      },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function RequestsPanel({ onRefreshListings }) {
  const [incoming, setIncoming]     = useState([]);
  const [outgoing, setOutgoing]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [activeTab, setActiveTab]   = useState("incoming");
  const [updatingId, setUpdatingId] = useState(null);

  /* ── fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inRes, outRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setIncoming(inRes.data  || []);
      setOutgoing(outRes.data || []);
    } catch {
      setError("Could not load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── approve / reject ── */
  const handleAction = async (requestId, status) => {
    setUpdatingId(requestId);
    try {
      await api.put(`/requests/${requestId}/status`, { status });
      // Optimistic update — swap status in local state
      setIncoming(prev =>
        prev.map(r => r._id === requestId ? { ...r, status } : r)
      );
      // Tell UserProfile to re-fetch lands/equipment so availability badges refresh
      if (onRefreshListings) onRefreshListings();
    } catch {
      alert("Failed to update request. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── derived counts ── */
  const pendingCount  = incoming.filter(r => r.status === "Pending").length;
  const outgoingCount = outgoing.length;

  /* ── loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      <p className="text-slate-400 text-sm">Loading requests…</p>
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-red-500 text-sm font-medium">{error}</p>
      <button
        onClick={fetchAll}
        className="flex items-center gap-2 h-9 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  );

  /* ── render ── */
  return (
    <div className="space-y-5">

      {/* ── Sub-tab toggle bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-white border border-stone-200 rounded-2xl p-1.5 shadow-sm">

          {/* Incoming */}
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "incoming"
                ? "bg-orange-500 text-white shadow"
                : "text-slate-500 hover:text-slate-700 hover:bg-stone-50"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Incoming
            {pendingCount > 0 && (
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                activeTab === "incoming" ? "bg-white text-orange-500" : "bg-orange-500 text-white"
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Outgoing */}
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "outgoing"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-500 hover:text-slate-700 hover:bg-stone-50"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Outgoing
            {outgoingCount > 0 && (
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                activeTab === "outgoing" ? "bg-white text-slate-800" : "bg-slate-200 text-slate-600"
              }`}>
                {outgoingCount}
              </span>
            )}
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchAll}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
          title="Refresh requests"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* ── INCOMING LIST ── */}
      {activeTab === "incoming" && (
        incoming.length === 0
          ? <EmptyRequests
              emoji="📭"
              title="No Incoming Requests"
              desc="When someone wants to rent your land or equipment, their request will appear here."
            />
          : (
            <div className="space-y-3">
              {/* Summary line */}
              <p className="text-xs text-slate-400 font-medium px-1">
                {incoming.length} request{incoming.length !== 1 ? "s" : ""} received
                {pendingCount > 0 && ` · `}
                {pendingCount > 0 && (
                  <span className="text-orange-500 font-bold">{pendingCount} awaiting your response</span>
                )}
              </p>
              {incoming.map(req => (
                <IncomingCard
                  key={req._id}
                  req={req}
                  updatingId={updatingId}
                  onAction={handleAction}
                />
              ))}
            </div>
          )
      )}

      {/* ── OUTGOING LIST ── */}
      {activeTab === "outgoing" && (
        outgoing.length === 0
          ? <EmptyRequests
              emoji="📤"
              title="No Outgoing Requests"
              desc="Requests you've sent to rent land or equipment from other farmers will show here."
            />
          : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium px-1">
                {outgoing.length} request{outgoing.length !== 1 ? "s" : ""} sent
              </p>
              {outgoing.map(req => (
                <OutgoingCard key={req._id} req={req} />
              ))}
            </div>
          )
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INCOMING CARD
   Shows: requester info, item name, duration, date
   Expand: contact chips, message, Approve / Reject buttons
══════════════════════════════════════════════════════════ */
function IncomingCard({ req, updatingId, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const isUpdating = updatingId === req._id;
  const cfg = STATUS_CFG[req.status] || STATUS_CFG.Pending;

  const itemName  = req.itemType === "Land" ? req.land?.title     : req.equipment?.name;
  const itemPrice = req.itemType === "Land" ? req.land?.price     : req.equipment?.price;
  const priceUnit = req.itemType === "Land" ? "/mo"               : "/day";
  const isPending = req.status === "Pending";

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${cfg.border}`}>

      {/* ── Collapsed row ── */}
      <div className="p-4 flex items-start gap-3">

        {/* Requester avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-sm font-bold text-white select-none">
            {req.requester?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-slate-900 truncate">{req.requester?.name ?? "Unknown"}</p>
            <StatusBadge status={req.status} />
          </div>

          {/* Item */}
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${req.itemType === "Land" ? "bg-green-500" : "bg-blue-500"}`} />
            Wants to rent
            <span className="font-semibold text-slate-700 truncate max-w-[160px]">
              {itemName ?? `your ${req.itemType}`}
            </span>
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {req.duration && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
                <Calendar className="w-3 h-3 text-slate-400" /> {req.duration} days
              </span>
            )}
            {itemPrice && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
                ₹{Number(itemPrice).toLocaleString()}<span className="text-slate-400">{priceUnit}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
              {formatDate(req.createdAt)}
            </span>
          </div>
        </div>

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded(p => !p)}
          className="shrink-0 w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors mt-0.5"
        >
          {expanded
            ? <ChevronUp   className="w-3.5 h-3.5 text-slate-500" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          }
        </button>
      </div>

      {/* ── Expanded section ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-stone-100 space-y-3">

          {/* Contact chips */}
          <div className="flex flex-wrap gap-2">
            {req.requester?.phone && (
              <a
                href={`tel:${req.requester.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Phone className="w-3 h-3 text-blue-500" /> {req.requester.phone}
              </a>
            )}
            {req.requester?.email && (
              <a
                href={`mailto:${req.requester.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-orange-50 border border-orange-100 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Mail className="w-3 h-3 text-orange-500" /> {req.requester.email}
              </a>
            )}
          </div>

          {/* Message */}
          {req.message && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message from requester</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">"{req.message}"</p>
            </div>
          )}

          {/* Approve / Reject — only when Pending */}
          {isPending && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAction(req._id, "Approved")}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow shadow-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5" />
                }
                Approve Request
              </button>
              <button
                onClick={() => onAction(req._id, "Rejected")}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-white border border-red-200 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <XCircle className="w-3.5 h-3.5" />
                }
                Reject
              </button>
            </div>
          )}

          {/* Post-action contextual note */}
          {req.status === "Approved" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
              Approved — your listing has been marked as unavailable.
            </div>
          )}
          {req.status === "Rejected" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-semibold">
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              Rejected — the requester has been notified.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   OUTGOING CARD
   Shows: item name + type, status, duration, date
   Expand: message you sent + contextual approval note
══════════════════════════════════════════════════════════ */
function OutgoingCard({ req }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CFG[req.status] || STATUS_CFG.Pending;

  const itemName  = req.itemType === "Land" ? req.land?.title     : req.equipment?.name;
  const itemPrice = req.itemType === "Land" ? req.land?.price     : req.equipment?.price;
  const priceUnit = req.itemType === "Land" ? "/mo"               : "/day";

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${cfg.border}`}>

      {/* ── Collapsed row ── */}
      <div className="p-4 flex items-start gap-3">

        {/* Item type icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          req.itemType === "Land" ? "bg-green-100" : "bg-blue-100"
        }`}>
          {req.itemType === "Land"
            ? <Sprout  className="w-5 h-5 text-green-600" />
            : <Tractor className="w-5 h-5 text-blue-600" />
          }
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-slate-900 truncate">
              {itemName ?? `${req.itemType} listing`}
            </p>
            <StatusBadge status={req.status} />
          </div>

          <p className="text-xs text-slate-400 mb-2">
            {req.itemType} rental — sent by you
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {req.duration && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
                <Calendar className="w-3 h-3 text-slate-400" /> {req.duration} days
              </span>
            )}
            {itemPrice && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
                ₹{Number(itemPrice).toLocaleString()}<span className="text-slate-400">{priceUnit}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-stone-50 border border-stone-100 px-2 py-1 rounded-lg">
              {formatDate(req.createdAt)}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        {req.message && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="shrink-0 w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors mt-0.5"
          >
            {expanded
              ? <ChevronUp   className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            }
          </button>
        )}
      </div>

      {/* ── Expanded section ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-stone-100 space-y-3">

          {req.message && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your message</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">"{req.message}"</p>
            </div>
          )}

          {req.status === "Approved" && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
              <span>
                Approved! Contact the owner to finalise the rental agreement and arrange payment.
              </span>
            </div>
          )}
          {req.status === "Rejected" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-semibold">
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              This request was declined by the owner.
            </div>
          )}
          {req.status === "Pending" && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-xs text-orange-600 font-semibold">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Waiting for the owner's response.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Empty state ── */
function EmptyRequests({ emoji, title, desc }) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-stone-200">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{desc}</p>
    </div>
  );
}
