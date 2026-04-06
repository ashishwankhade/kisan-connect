import { useState, useEffect } from "react";
import api from "../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Box, Droplets, Search, ChevronLeft, Plus, Sprout, Loader2, Layers } from "lucide-react";

import AddLandModal from "./AddLandModal";
import RentLandModal from "./RentLandModal";

export default function LandRenting({ setView }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [search, setSearch] = useState("");

  const fetchLands = async () => {
    try {
      setLoading(true);
      const response = await api.get("/lands");
      setLands(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLands(); }, []);

  const handleListLandClick = () => {
    if (!localStorage.getItem("userName")) {
      alert("You must be logged in to list your land!");
      setView("login");
      return;
    }
    setIsAddModalOpen(true);
  };

  const filtered = lands.filter(l =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafaf7]" style={{ fontFamily: "system-ui, sans-serif" }}>

      <AddLandModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchLands} />
      <RentLandModal isOpen={!!selectedLand} land={selectedLand} onClose={() => setSelectedLand(null)} />

      {/* ── PAGE HERO ── */}
      <div className="bg-[#0f1f0f] px-6 md:px-12 pt-10 pb-12">
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
              <h1 style={{ fontFamily: "'Lora', Georgia, serif" }} className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Agricultural Land<br />
                <em className="text-green-400">Near You</em>
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-md">Verified farmland with soil data, water sources, and GPS coordinates.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  placeholder="Search by location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-green-400 w-full sm:w-64 transition-colors"
                />
              </div>
              <Button
                onClick={handleListLandClick}
                className="h-11 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold gap-2 shadow-lg shadow-green-900/40 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> List Your Land
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
            {[
              { label: "Total Listings", value: lands.length },
              { label: "Available Now", value: lands.filter(l => l.isAvailable !== false).length },
              { label: "Districts Covered", value: [...new Set(lands.map(l => l.location))].length },
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
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or be the first to list!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((land) => {
              const available = land.isAvailable !== false;
              return (
                <div
                  key={land._id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 transition-all duration-300 flex flex-col ${available ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : "opacity-70"}`}
                  onClick={() => available && setSelectedLand(land)}
                >
                  {/* Image */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    {land.image ? (
                      <img src={land.image} alt={land.title} className={`w-full h-full object-cover transition-transform duration-500 ${available && "group-hover:scale-105"} ${!available && "grayscale"}`} />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${land.imageClass || "bg-stone-50"}`}>
                        <Layers className="w-8 h-8 text-stone-300" />
                      </div>
                    )}

                    {/* Price chip */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                      <span className="text-sm font-bold text-slate-900">₹{Number(land.price).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">/mo</span>
                    </div>

                    {/* Status */}
                    <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                      {available ? "Available" : "Rented"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-1.5">
                      <MapPin className="w-3 h-3 text-red-400" /> {land.location}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-3 leading-snug group-hover:text-green-700 transition-colors">
                      {land.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                        <Box className="w-3 h-3 text-stone-400" /> {land.area}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                        <Droplets className="w-3 h-3 text-blue-400" /> {land.waterSource}
                      </div>
                    </div>

                    <button
                      disabled={!available}
                      onClick={(e) => { e.stopPropagation(); available && setSelectedLand(land); }}
                      className={`w-full h-9 rounded-xl text-xs font-bold transition-all ${available ? "bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-100" : "bg-stone-100 text-stone-400 cursor-not-allowed"}`}
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
