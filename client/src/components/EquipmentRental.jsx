import { useState, useEffect } from "react";
import api from "../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor, Search, ChevronLeft, Wrench, Fuel, Gauge, Calendar, MapPin, Plus, X, Upload, Loader2 } from "lucide-react";

import BookEquipmentModal from "./BookEquipmentModal";

export default function EquipmentRental({ setView }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingItem, setBookingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", category: "", power: "", fuel: "Diesel", year: "", price: "", location: "", image: null });

  useEffect(() => {
    api.get("/equipment").then(r => setEquipmentList(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, image: e.target.files[0] });

  const handleOpenUpload = () => {
    if (!localStorage.getItem("userName")) { alert("Please log in to list your equipment."); setView("login"); return; }
    setIsUploadOpen(true);
  };

  const handleBookClick = (item) => {
    if (item.isAvailable === false) return;
    if (!localStorage.getItem("userName")) { alert("Please log in to book equipment."); setView("login"); return; }
    setBookingItem(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload an image!");
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    try {
      const res = await api.post("/equipment", data, { headers: { "Content-Type": "multipart/form-data" } });
      setEquipmentList([res.data, ...equipmentList]);
      setIsUploadOpen(false);
      setFormData({ name: "", category: "", power: "", fuel: "Diesel", year: "", price: "", location: "", image: null });
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const filtered = equipmentList.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafaf7]" style={{ fontFamily: "system-ui, sans-serif" }}>

      <BookEquipmentModal isOpen={!!bookingItem} equipment={bookingItem} onClose={() => setBookingItem(null)} />

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
              <button onClick={() => setIsUploadOpen(false)} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-7">
              <form id="equip-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Machine Name</label>
                    <Input id="name" placeholder="e.g. Swaraj 855" value={formData.name} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                    <Input id="category" placeholder="Tractor / Harvester" value={formData.category} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Power</label>
                    <Input id="power" placeholder="50 HP" value={formData.power} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fuel Type</label>
                    <select id="fuel" value={formData.fuel} onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Diesel</option><option>Petrol</option><option>Electric</option><option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Year</label>
                    <Input id="year" placeholder="2024" value={formData.year} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">₹/Day</label>
                    <Input id="price" type="number" placeholder="2000" value={formData.price} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Location</label>
                    <Input id="location" placeholder="Nagpur" value={formData.location} onChange={handleInputChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" required />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                  {formData.image ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800">{formData.image.name}</p>
                        <p className="text-xs text-slate-400">Image selected ✓</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">Upload Equipment Photo</p>
                      <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP • Max 5MB</p>
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="px-7 py-5 border-t border-stone-100 flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl border-stone-200 font-semibold" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button type="submit" form="equip-form" className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">List Equipment</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HERO ── */}
      <div className="bg-[#0a1628] px-6 md:px-12 pt-10 pb-12">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => setView("landing")} className="flex items-center gap-2 text-blue-400/70 hover:text-blue-400 mb-6 transition-colors text-xs font-semibold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-blue-400 text-xs font-bold tracking-[0.25em] uppercase mb-3">Equipment Marketplace</p>
              <h1 style={{ fontFamily: "'Lora', Georgia, serif" }} className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Machinery<br /><em className="text-blue-400">On Demand</em>
              </h1>
              <p className="text-white/50 mt-3 text-sm max-w-md">Rent verified farm equipment directly from local owners. No broker fees.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-blue-400 w-64 transition-colors"
                />
              </div>
              <Button onClick={handleOpenUpload} className="h-11 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold gap-2 shadow-lg shadow-blue-900/50">
                <Plus className="w-4 h-4" /> List Equipment
              </Button>
            </div>
          </div>

          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
            {[
              { label: "Total Equipment", value: equipmentList.length },
              { label: "Available Now", value: equipmentList.filter(i => i.isAvailable !== false).length },
              { label: "Categories", value: [...new Set(equipmentList.map(i => i.category))].length },
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-3xl">
            <Tractor className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No equipment found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => {
              const available = item.isAvailable !== false;
              return (
                <div key={item._id} className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 transition-all duration-300 flex flex-col ${available ? "hover:shadow-xl hover:-translate-y-1" : "opacity-70"}`}>
                  
                  {/* Image */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    <img src={item.image} alt={item.name} className={`w-full h-full object-cover transition-transform duration-500 ${available && "group-hover:scale-105"} ${!available && "grayscale"}`} />
                    
                    {/* Price */}
                    <div className="absolute top-3 left-3 bg-blue-600 px-2.5 py-1 rounded-lg">
                      <span className="text-sm font-bold text-white">₹{item.price}</span>
                      <span className="text-[10px] text-blue-200">/day</span>
                    </div>

                    {/* Status */}
                    <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                      {available ? "Available" : "Rented"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{item.category}</p>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                      <MapPin className="w-3 h-3 text-red-400" /> {item.location}
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1.5 mb-4 mt-auto">
                      {[
                        { icon: Gauge, val: item.power },
                        { icon: Fuel, val: item.fuel },
                        { icon: Calendar, val: item.year },
                      ].map(({ icon: Icon, val }) => (
                        <div key={val} className="bg-stone-50 rounded-lg p-2 text-center border border-stone-100">
                          <Icon className="w-3.5 h-3.5 text-stone-400 mx-auto mb-0.5" />
                          <p className="text-[10px] font-bold text-slate-700 truncate">{val}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={!available}
                      onClick={() => handleBookClick(item)}
                      className={`w-full h-9 rounded-xl text-xs font-bold transition-all ${available ? "bg-slate-900 hover:bg-blue-600 text-white" : "bg-stone-100 text-stone-400 cursor-not-allowed"}`}
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
