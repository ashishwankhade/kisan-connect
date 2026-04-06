// ============================================================
// AddLandModal.jsx — Redesigned
// ============================================================
import { useState } from "react";
import api from "../api/axios";
import { X, Loader2, Sprout, MapPin, Droplets, Box, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddLandModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ title: "", location: "", area: "", price: "", soilType: "", waterSource: "", description: "", lat: "", lng: "" });

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
      setImageFile(file); setImagePreview(URL.createObjectURL(file)); setError("");
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude, location: prev.location || `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
        setLocationLoading(false);
      },
      () => { setError("Unable to get location."); setLocationLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (!formData.title || !formData.price || !formData.location) throw new Error("Please fill all required fields.");
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));
      if (imageFile) data.append("image", imageFile);
      await api.post("/lands", data);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to list land.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">List Your Land</h2>
            <p className="text-xs text-slate-500 mt-0.5">Reach thousands of farmers instantly</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form id="land-form" onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium border border-red-100">{error}</div>}

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Farm Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
                {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <Sprout className="w-7 h-7 text-stone-300" />}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400 mt-1.5">JPG, PNG, WEBP · Max 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Title <span className="text-red-400">*</span></label>
            <Input name="title" placeholder="e.g. Fertile 5 Acre Plot near Nagpur" required onChange={handleChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Price (₹/Month) <span className="text-red-400">*</span></label>
              <Input name="price" type="number" placeholder="15000" required onChange={handleChange} className="h-11 rounded-xl bg-stone-50 border-stone-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Location <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input name="location" placeholder="City / Area" className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" value={formData.location} required onChange={handleChange} />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleGetLocation} title="GPS" className="shrink-0 h-11 w-11 rounded-xl border-stone-200 hover:bg-green-50 hover:border-green-200">
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <Crosshair className="w-4 h-4 text-green-600" />}
                </Button>
              </div>
              {formData.lat && <p className="text-[10px] text-green-600 font-bold mt-1">✓ GPS Coordinates Attached</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Area</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input name="area" placeholder="e.g. 4 Acres" className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" required onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Water Source</label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input name="waterSource" placeholder="Well / Canal" className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" required onChange={handleChange} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Soil Type</label>
            <Input name="soilType" placeholder="e.g. Black Cotton Soil" className="h-11 rounded-xl bg-stone-50 border-stone-200" required onChange={handleChange} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Description</label>
            <textarea name="description" rows="3"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Crops suitable, road access, other details..."
              onChange={handleChange}
            />
          </div>
        </form>

        <div className="px-7 py-5 border-t border-stone-100 bg-stone-50 rounded-b-3xl">
          <Button type="submit" form="land-form" disabled={loading}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-100"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : "Post Listing"}
          </Button>
        </div>
      </div>
    </div>
  );
}
