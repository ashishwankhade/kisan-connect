import { useState, useEffect } from "react";
import api from "../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tractor, Search, ChevronLeft, Wrench, Fuel, Gauge,
  Calendar, MapPin, Plus, X, Upload, Loader2, SlidersHorizontal,
} from "lucide-react";

import BookEquipmentModal from "./BookEquipmentModal";

// FIX: consistent auth check — align the key with whatever your login
// flow stores. See note in LandRenting.jsx.
const isLoggedIn = () => !!localStorage.getItem("token");

const EMPTY_FORM = {
  name: "", category: "", power: "", fuel: "Diesel",
  year: "", price: "", location: "", image: null,
};

export default function EquipmentRental({ setView }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingItem, setBookingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  // UX: filter + sort
  const [filterAvailable, setFilterAvailable] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await api.get("/equipment");
      setEquipmentList(r.data);
    } catch (e) {
      setError("Unable to load equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEquipment(); }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleFileChange = (e) =>
    setFormData({ ...formData, image: e.target.files[0] || null });

  const handleOpenUpload = () => {
    if (!isLoggedIn()) {
      alert("Please log in to list your equipment.");
      setView("login");
      return;
    }
    setFormError("");
    setIsUploadOpen(true);
  };

  const handleBookClick = (item) => {
    // FIX: was checking isAvailable === false but not gating on login first.
    // Now we check login before opening the modal.
    if (item.isAvailable === false) return;
    if (!isLoggedIn()) {
      alert("Please log in to book equipment.");
      setView("login");
      return;
    }
    setBookingItem(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.image) {
      setFormError("Please upload an equipment photo.");
      return;
    }

    // FIX: validate year is a sensible number before sending
    const yearNum = Number(formData.year);
    if (!yearNum || yearNum < 1950 || yearNum > new Date().getFullYear() + 1) {
      setFormError("Please enter a valid year.");
      return;
    }

    // FIX: validate price is a positive number
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      setSubmitting(true);
      const res = await api.post("/equipment", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // FIX: optimistic update — prepend new item and refresh from server
      // to get the isAvailable flag and server-generated fields correctly
      setEquipmentList((prev) => [res.data, ...prev]);
      setIsUploadOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to list equipment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Derive unique categories for the filter
  const categories = ["all", ...new Set(equipmentList.map(i => i.category).filter(Boolean))];

  // Combined filter + sort
  const filtered = equipmentList
    .filter((i) => {
      const matchesSearch =
        i.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.toLowerCase().includes(search.toLowerCase()) ||
        i.location?.toLowerCase().includes(search.toLowerCase());

      // FIX: strict check instead of `!== false`
      const available = i.isAvailable === true;
      const matchesAvail =
        filterAvailable === "all" ? true :
        filterAvailable === "available" ? available : !available;

      const matchesCat =
        filterCategory === "all" ? true : i.category === filterCategory;

      return matchesSearch && matchesAvail && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      return 0;
    });

  const availableCount = equipmentList.filter(i => i.isAvailable === true).length;
  const categoryCount  = new Set(equipmentList.map(i => i.category).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-[#fafaf7]" style={{ fontFamily: "system-ui, sans-serif" }}>

      <BookEquipmentModal
        isOpen={!!bookingItem}
        equipment={bookingItem}
        onClose={() => setBookingItem(null)}
        // UX: refresh list after booking so availability updates
        onSuccess={fetchEquipment}
      />

      {/* ── ADD EQUIPMENT MODAL ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">List Your Machinery</h2>
                <p className="text-xs text-slate-500 mt-0.5">Reach farmers across your district</p>
              </div>
              <button
                onClick={() => { setIsUploadOpen(false); setFormError(""); }}
                className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-7">
              {/* FIX: inline form error instead of alert() */}
              {formError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {formError}
                </div>
              )}

              <form id="equip-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Machine Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g. Swaraj 855"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Category
                    </label>
                    <Input
                      id="category"
                      placeholder="Tractor / Harvester"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Power
                    </label>
                    <Input
                      id="power"
                      placeholder="50 HP"
                      value={formData.power}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Fuel Type
                    </label>
                    <select
                      id="fuel"
                      value={formData.fuel}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Diesel</option>
                      <option>Petrol</option>
                      <option>Electric</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Year
                    </label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      min="1950"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      ₹/Day
                    </label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="2000"
                      min="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Location
                    </label>
                    <Input
                      id="location"
                      placeholder="Nagpur"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl bg-stone-50 border-stone-200"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {formData.image ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{formData.image.name}</p>
                        <p className="text-xs text-green-600 font-medium">Image selected ✓</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">Upload Equipment Photo</p>
                      <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP · Max 5 MB</p>
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="px-7 py-5 border-t border-stone-100 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl border-stone-200 font-semibold"
                onClick={() => { setIsUploadOpen(false); setFormError(""); }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="equip-form"
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Listing...</>
                ) : (
                  "List Equipment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HERO ── */}
      <div className="bg-[#0a1628] px-6 md:px-12 pt-10 pb-14">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 text-blue-400/70 hover:text-blue-400 mb-6 transition-colors text-xs font-semibold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-blue-400 text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Equipment Marketplace
              </p>
              <h1
                style={{ fontFamily: "'Lora', Georgia, serif" }}
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
              >
                Machinery<br /><em className="text-blue-400">On Demand</em>
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-md">
                Rent verified farm equipment directly from local owners. No broker fees.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  placeholder="Search equipment, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-10 pr-9 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-blue-400 w-64 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* UX: filter toggle */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
                  showFilters
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white/10 border-white/15 text-white/70 hover:text-white hover:border-white/30"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(filterAvailable !== "all" || filterCategory !== "all") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                )}
              </button>

              <Button
                onClick={handleOpenUpload}
                className="h-11 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold gap-2 shadow-lg shadow-blue-900/50"
              >
                <Plus className="w-4 h-4" /> List Equipment
              </Button>
            </div>
          </div>

          {/* UX: expandable filter bar */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap gap-6 items-start">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Availability</p>
                <div className="flex gap-2">
                  {["all", "available", "rented"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilterAvailable(opt)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                        filterAvailable === opt
                          ? "bg-blue-500 text-white"
                          : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                      }`}
                    >
                      {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* UX: category filter — dynamically built from real data */}
              {categories.length > 1 && (
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterCategory === cat
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                        }`}
                      >
                        {cat === "all" ? "All Categories" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                          ? "bg-blue-500 text-white"
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

          {/* Stats */}
          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
            {[
              { label: "Total Equipment", value: equipmentList.length },
              // FIX: strict `=== true` check
              { label: "Available Now",   value: availableCount },
              // FIX: deduplicate properly, filter null
              { label: "Categories",      value: categoryCount },
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
              {filtered.length === equipmentList.length
                ? `${equipmentList.length} item${equipmentList.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${equipmentList.length} items`}
            </p>
            {(search || filterAvailable !== "all" || filterCategory !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterAvailable("all"); setFilterCategory("all"); }}
                className="text-xs text-blue-600 font-semibold hover:text-blue-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-400">Loading equipment...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={fetchEquipment}>Try Again</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-3xl">
            <Tractor className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No equipment found</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">
              {search || filterAvailable !== "all" || filterCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Be the first to list your machinery!"}
            </p>
            {(search || filterAvailable !== "all" || filterCategory !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterAvailable("all"); setFilterCategory("all"); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => {
              // FIX: strict check
              const available = item.isAvailable === true;
              return (
                <div
                  key={item._id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 transition-all duration-300 flex flex-col ${
                    available ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : "opacity-60"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          available ? "group-hover:scale-105" : "grayscale"
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="w-10 h-10 text-stone-200" />
                      </div>
                    )}

                    {/* Price */}
                    <div className="absolute top-3 left-3 bg-blue-600 px-2.5 py-1 rounded-lg">
                      <span className="text-sm font-bold text-white">
                        ₹{Number(item.price).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-blue-200">/day</span>
                    </div>

                    {/* Status */}
                    <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                      available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {available ? "Available" : "Rented"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                      {item.category}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-700 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1.5 mb-4 mt-auto">
                      {[
                        { icon: Gauge,    val: item.power, label: "Power" },
                        { icon: Fuel,     val: item.fuel,  label: "Fuel"  },
                        { icon: Calendar, val: item.year,  label: "Year"  },
                      ].map(({ icon: Icon, val, label }) => (
                        <div key={label} className="bg-stone-50 rounded-lg p-2 text-center border border-stone-100">
                          <Icon className="w-3.5 h-3.5 text-stone-400 mx-auto mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-700 truncate">{val || "—"}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={!available}
                      onClick={() => handleBookClick(item)}
                      className={`w-full h-9 rounded-xl text-xs font-bold transition-all ${
                        available
                          ? "bg-slate-900 hover:bg-blue-600 text-white"
                          : "bg-stone-100 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      {available ? "Book Now" : "Unavailable"}
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