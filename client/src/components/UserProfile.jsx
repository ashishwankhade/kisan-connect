import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  MapPin, Tractor, Edit, Trash2, Sprout, LogOut, Loader2,
  Plus, Fuel, Calendar, Gauge, Mail, Phone, ShieldCheck,
  Home, Box, Droplets, Bell,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EditLandModal      from "./EditLandModal";
import EditProfileModal   from "./EditProfileModal";
import EditEquipmentModal from "./EditEquipmentModal";
import RequestsPanel      from "./RequestsPanel";   // ← separate component

export default function UserProfile({ setView }) {
  const [user, setUser]                         = useState(null);
  const [myLands, setMyLands]                   = useState([]);
  const [myEquipments, setMyEquipments]         = useState([]);
  const [pendingCount, setPendingCount]         = useState(0); // drives tab badge only
  const [loading, setLoading]                   = useState(true);
  const [editingLand, setEditingLand]           = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  /* ── fetch profile + listings ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, landRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/lands/user"),
      ]);
      setUser(userRes.data);
      setMyLands(landRes.data);
      try {
        const r = await api.get("/equipment/user");
        setMyEquipments(r.data);
      } catch {
        setMyEquipments([]);
      }
    } catch {
      setView("login");
    } finally {
      setLoading(false);
    }
  }, [setView]);

  /* ── lightweight fetch just for the pending badge count ── */
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get("/requests/incoming");
      setPendingCount((res.data || []).filter(r => r.status === "Pending").length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchPendingCount();
  }, [fetchData, fetchPendingCount]);

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Remove this ${type}?`)) return;
    try {
      await api.delete(type === "land" ? `/lands/${id}` : `/equipment/${id}`);
      if (type === "land") setMyLands(p => p.filter(i => i._id !== id));
      else setMyEquipments(p => p.filter(i => i._id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    finally { localStorage.clear(); setView("landing"); window.scrollTo(0, 0); }
  };

  /*
   * Passed to RequestsPanel as `onRefreshListings`.
   * Called after approve / reject so land & equipment
   * availability badges refresh immediately.
   */
  const handleRequestsRefresh = useCallback(() => {
    fetchData();
    fetchPendingCount();
  }, [fetchData, fetchPendingCount]);

  /* ── loading ── */
  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-green-600" />
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* ── Modals ── */}
      <EditLandModal
        isOpen={!!editingLand}
        land={editingLand}
        onClose={() => setEditingLand(null)}
        onSuccess={fetchData}
      />
      <EditEquipmentModal
        isOpen={!!editingEquipment}
        equipment={editingEquipment}
        onClose={() => setEditingEquipment(null)}
        onSuccess={fetchData}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        user={user}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={fetchData}
      />

      {/* ══ PROFILE HEADER ══ */}
      <div className="bg-[#0f1f0f]">
        <div className="max-w-5xl mx-auto px-5 md:px-10 pt-7 pb-14">

          {/* Back */}
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 mb-8 text-xs font-medium uppercase tracking-widest transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </button>

          {/* Profile row */}
          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="relative shrink-0 self-center sm:self-start">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shadow-lg shadow-green-900/40">
                <span className="text-3xl font-bold text-white select-none">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0f1f0f]">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Name + contact */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                {user.role} · AgriSmart Member
              </p>
              <h1 className="text-2xl font-bold text-white mb-3 truncate">{user.name}</h1>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {[
                  { icon: Mail,   val: user.email,                    col: "text-orange-400" },
                  { icon: Phone,  val: user.phone     || "No phone",  col: "text-blue-400"   },
                  { icon: MapPin, val: user.district  || "No location", col: "text-red-400"  },
                ].map(({ icon: Icon, val, col }) => (
                  <div key={val} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
                    <Icon className={`w-3 h-3 shrink-0 ${col}`} />
                    <span className="truncate max-w-[150px]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 self-center sm:self-start shrink-0">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-slate-800 hover:bg-green-50 border border-white text-sm font-semibold shadow transition-colors whitespace-nowrap"
              >
                <Edit className="w-3.5 h-3.5 text-green-600" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/10 border border-white/15 text-white/75 hover:bg-red-900/50 hover:text-red-300 hover:border-red-500/40 text-sm font-medium transition-all whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </div>

          {/* Stats strip — 3 columns now */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white">{myLands.length}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Lands Listed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{myEquipments.length}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Equipment Listed</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Pending Requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="max-w-5xl mx-auto px-5 md:px-10 -mt-5 pb-20">
        <Tabs defaultValue="lands">

          <TabsList className="w-full bg-white border border-stone-200 shadow-lg rounded-2xl p-1.5 mb-7 h-auto flex gap-1">

            {/* My Lands */}
            <TabsTrigger
              value="lands"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500 transition-all
                data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow"
            >
              🌱 My Lands
              {myLands.length > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">({myLands.length})</span>
              )}
            </TabsTrigger>

            {/* Equipment */}
            <TabsTrigger
              value="equipments"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500 transition-all
                data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow"
            >
              🚜 Equipment
              {myEquipments.length > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">({myEquipments.length})</span>
              )}
            </TabsTrigger>

            {/* Requests — orange with live pending badge */}
            <TabsTrigger
              value="requests"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-500 transition-all
                data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow"
            >
              <Bell className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              Requests
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full
                  bg-orange-500 text-white text-[10px] font-bold
                  data-[state=active]:bg-white data-[state=active]:text-orange-500">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>

          </TabsList>

          {/* ── Lands ── */}
          <TabsContent value="lands">
            {myLands.length === 0 ? (
              <EmptyState
                emoji="🌾"
                title="No Land Listed Yet"
                desc="List your unused agricultural land and start earning from it."
                cta="Add Land Listing"
                onClick={() => setView("land-renting")}
                btnClass="bg-green-600 hover:bg-green-500 shadow-green-100"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myLands.map(land => (
                  <LandCard
                    key={land._id}
                    land={land}
                    onEdit={() => setEditingLand(land)}
                    onDelete={() => handleDelete(land._id, "land")}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Equipment ── */}
          <TabsContent value="equipments">
            {myEquipments.length === 0 ? (
              <EmptyState
                emoji="🔧"
                title="No Equipment Listed Yet"
                desc="Share your idle machinery and earn extra income from local farmers."
                cta="Add Equipment"
                onClick={() => setView("equipment")}
                btnClass="bg-blue-600 hover:bg-blue-500 shadow-blue-100"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myEquipments.map(item => (
                  <EquipmentCard
                    key={item._id}
                    item={item}
                    onEdit={() => setEditingEquipment(item)}
                    onDelete={() => handleDelete(item._id, "equipment")}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Requests — delegated entirely to RequestsPanel ── */}
          <TabsContent value="requests">
            <RequestsPanel onRefreshListings={handleRequestsRefresh} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LAND CARD
───────────────────────────────────────── */
function LandCard({ land, onEdit, onDelete }) {
  const available = land.isAvailable !== false;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-stone-100 overflow-hidden">
        {land.image ? (
          <img src={land.image} alt={land.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-stone-100">
            <Sprout className="w-10 h-10 text-green-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="text-lg font-extrabold text-white">₹{Number(land.price).toLocaleString()}</span>
          <span className="text-xs text-white/55">/mo</span>
        </div>
        <span className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {available ? "Available" : "Rented"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
          <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {land.location}
        </div>
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-3 group-hover:text-green-700 transition-colors flex-1">
          {land.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {land.area && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg">
              <Box className="w-3 h-3 text-stone-400" /> {land.area}
            </span>
          )}
          {land.waterSource && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg">
              <Droplets className="w-3 h-3 text-blue-400" /> {land.waterSource}
            </span>
          )}
          {land.soilType && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg">
              🪨 {land.soilType}
            </span>
          )}
        </div>
        <div className="flex gap-2 pt-3 border-t border-stone-100">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200 hover:border-transparent text-xs font-bold transition-all">
            <Edit className="w-3.5 h-3.5" /> Edit Listing
          </button>
          <button onClick={onDelete} className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-100 hover:border-transparent flex items-center justify-center transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EQUIPMENT CARD
───────────────────────────────────────── */
function EquipmentCard({ item, onEdit, onDelete }) {
  const available = item.isAvailable !== false;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-stone-100 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-wide">{item.category}</span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {available ? "Available" : "Rented"}
        </span>
        <div className="absolute bottom-3 left-3">
          <span className="text-lg font-extrabold text-white">₹{Number(item.price).toLocaleString()}</span>
          <span className="text-xs text-white/55">/day</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-700 transition-colors">{item.name}</h3>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
          <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {item.location}
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-4 mt-auto">
          {[
            { Icon: Gauge,    label: "Power", val: item.power },
            { Icon: Fuel,     label: "Fuel",  val: item.fuel  },
            { Icon: Calendar, label: "Year",  val: item.year  },
          ].map(({ Icon, label, val }) => (
            <div key={label} className="bg-stone-50 rounded-xl p-2 text-center border border-stone-100">
              <Icon className="w-3.5 h-3.5 text-stone-400 mx-auto mb-0.5" />
              <p className="text-[9px] text-stone-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
              <p className="text-[10px] font-bold text-slate-700 truncate">{val}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t border-stone-100">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-transparent text-xs font-bold transition-all">
            <Edit className="w-3.5 h-3.5" /> Edit Listing
          </button>
          <button onClick={onDelete} className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border border-red-100 hover:border-transparent flex items-center justify-center transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
function EmptyState({ emoji, title, desc, cta, onClick, btnClass }) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-7">{desc}</p>
      {cta && (
        <button onClick={onClick} className={`inline-flex items-center gap-2 h-11 px-7 rounded-xl font-bold text-white text-sm shadow-lg transition-colors ${btnClass}`}>
          <Plus className="w-4 h-4" /> {cta}
        </button>
      )}
    </div>
  );
}
