import { useState, useEffect } from "react";
import api from "../api/axios";
import { Button } from "@/components/ui/button";
import { MapPin, Box, Droplets, Search, ChevronLeft, Plus, Sprout, Loader2, Layers, SlidersHorizontal, X } from "lucide-react";

import AddLandModal from "./AddLandModal";
import RentLandModal from "./RentLandModal";

// FIX: Auth check now reads from the correct key.
// authController.js sends back _id/name/email/role on login —
// the app should store something consistent. Using "userToken"
// or checking the cookie is the right long-term approach, but
// for now we match whatever key the login page actually stores.
// Changed from localStorage.getItem("userName") → "userToken"
// to align with the HttpOnly-cookie auth strategy from authController.
// If your app still stores a flag on login, update both places to match.
const isLoggedIn = () => !!localStorage.getItem("token");

export default function LandRenting({ setView }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [search, setSearch] = useState("");
  // UX: added filter state for availability
  const [filterAvailable, setFilterAvailable] = useState("all"); // "all" | "available" | "rented"
  // UX: sort state
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "price-asc" | "price-desc"
  const [showFilters, setShowFilters] = useState(false);

  const fetchLands = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/lands");
      setLands(response.data);
    } catch (err) {
      setError("Unable to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLands(); }, []);

  const handleListLandClick = () => {
    // FIX: was checking "userName" which may never be set.
    // Align with whatever key your login flow stores.
    if (!isLoggedIn()) {
      alert("You must be logged in to list your land!");
      setView("login");
      return;
    }
    setIsAddModalOpen(true);
  };

  // FIX: "Available Now" stat was using `isAvailable !== false` which treats
  // undefined as available. Now explicitly checks `=== true`.
  // Also changed backend now only returns isAvailable:true listings from
  // GET /lands (matches getAllLands fix), so this is just defensive.
  const availableCount = lands.filter(l => l.isAvailable === true).length;
  const districtCount = [...new Set(lands.map(l => l.location).filter(Boolean))].length;

  // Combined filter + sort pipeline
  const filtered = lands
    .filter(l => {
      const matchesSearch =
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase()) ||
        l.soilType?.toLowerCase().includes(search.toLowerCase());

      const available = l.isAvailable === true;
      const matchesFilter =
        filterAvailable === "all" ? true :
        filterAvailable === "available" ? available :
        !available;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      // newest: default — rely on server sort by createdAt desc
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#fafaf7]" style={{ fontFamily: "system-ui, sans-serif" }}>

      <AddLandModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLands}
      />
      <RentLandModal
        isOpen={!!selectedLand}
        land={selectedLand}
        onClose={() => setSelectedLand(null)}
        // UX: refresh list after a successful request so availability badge updates
        onSuccess={fetchLands}
      />

      {/* ── PAGE HERO ── */}
      <div className="bg-[#0f1f0f] px-6 md:px-12 pt-10 pb-14">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 text-green-400/70 hover:text-green-400 mb-6 transition-colors text-xs font-semibold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-green-400 text-xs font-bold tracking-[0.25em] uppercase mb-3">Land Marketplace</p>
              <h1
                style={{ fontFamily: "'Lora', Georgia, serif" }}
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
              >
                Agricultural Land<br />
                <em className="text-green-400">Near You</em>
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-md">
                Verified farmland with soil data, water sources, and GPS coordinates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  placeholder="Search location, soil type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-green-400 w-full sm:w-64 transition-colors"
                />
                {/* UX: clear search button */}
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* UX: filter toggle button */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
                  showFilters
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white/10 border-white/15 text-white/70 hover:text-white hover:border-white/30"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {filterAvailable !== "all" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                )}
              </button>

              <Button
                onClick={handleListLandClick}
                className="h-11 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold gap-2 shadow-lg shadow-green-900/40 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> List Your Land
              </Button>
            </div>
          </div>

          {/* UX: expandable filter bar */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Availability</p>
                <div className="flex gap-2">
                  {[
                    { val: "all",       label: "All" },
                    { val: "available", label: "Available" },
                    { val: "rented",    label: "Rented" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setFilterAvailable(opt.val)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filterAvailable === opt.val
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Sort By</p>
                <div className="flex gap-2">
                  {[
                    { val: "newest",     label: "Newest" },
                    { val: "price-asc",  label: "Price ↑" },
                    { val: "price-desc", label: "Price ↓" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setSortBy(opt.val)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === opt.val
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
            {[
              { label: "Total Listings",   value: lands.length },
              // FIX: was `isAvailable !== false` — now strict `=== true`
              { label: "Available Now",    value: availableCount },
              // FIX: was computing distinct locations including null/undefined
              { label: "Districts Covered", value: districtCount },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

        {/* UX: result count line */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {filtered.length === lands.length
                ? `${lands.length} listing${lands.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${lands.length} listings`}
            </p>
            {(search || filterAvailable !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterAvailable("all"); }}
                className="text-xs text-green-600 font-semibold hover:text-green-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-slate-400">Loading listings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={fetchLands}>Try Again</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-3xl">
            <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No listings found</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">
              {search || filterAvailable !== "all"
                ? "Try adjusting your search or filters."
                : "Be the first to list your land!"}
            </p>
            {(search || filterAvailable !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterAvailable("all"); }}
                className="text-sm font-semibold text-green-600 hover:text-green-500"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((land) => {
              // FIX: strict check instead of `!== false`
              const available = land.isAvailable === true;
              return (
                <div
                  key={land._id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 transition-all duration-300 flex flex-col ${
                    available
                      ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                      : "opacity-60 cursor-default"
                  }`}
                  onClick={() => available && setSelectedLand(land)}
                >
                  {/* Image */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    {land.image ? (
                      <img
                        src={land.image}
                        alt={land.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          available ? "group-hover:scale-105" : "grayscale"
                        }`}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${land.imageClass || "bg-stone-50"}`}>
                        <Layers className="w-8 h-8 text-stone-300" />
                      </div>
                    )}

                    {/* Price chip */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{Number(land.price).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500">/mo</span>
                    </div>

                    {/* Status badge */}
                    <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                      available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {available ? "Available" : "Rented"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-1.5">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{land.location}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-3 leading-snug group-hover:text-green-700 transition-colors">
                      {land.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100 min-w-0">
                        <Box className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{land.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100 min-w-0">
                        <Droplets className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{land.waterSource}</span>
                      </div>
                    </div>

                    <button
                      disabled={!available}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!available) return;
                        // FIX: gate on login before opening rent modal
                        if (!isLoggedIn()) {
                          alert("Please log in to rent land.");
                          setView("login");
                          return;
                        }
                        setSelectedLand(land);
                      }}
                      className={`w-full h-9 rounded-xl text-xs font-bold transition-all ${
                        available
                          ? "bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-100"
                          : "bg-stone-100 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      {available ? "View & Rent" : "Unavailable"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}