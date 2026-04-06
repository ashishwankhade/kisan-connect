// ============================================================
// EditLandModal.jsx — Redesigned
// ============================================================
import { useState, useEffect } from "react";
import api from "../api/axios";
import { X, Loader2, Save, MapPin, Droplets, Box, Sprout, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditLandModal({ land, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ title: "", location: "", area: "", price: "", soilType: "", waterSource: "", description: "", isAvailable: true, lat: "", lng: "" });

  useEffect(() => {
    if (land) {
      setFormData({ title: land.title || "", location: land.location || "", area: land.area || "", price: land.price || "", soilType: land.soilType || "", waterSource: land.waterSource || "", description: land.description || "", isAvailable: land.isAvailable ?? true, lat: land.coordinates?.lat || "", lng: land.coordinates?.lng || "" });
      setImagePreview(land.image || null);
      setImageFile(null);
    }
  }, [land]);

  if (!isOpen || !land) return null;

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setFormData(p => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude })); setLocationLoading(false); },
      () => { setError("Unable to get location."); setLocationLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);
      await api.put(`/lands/${land._id}`, data);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Listing</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update your land details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form id="edit-land-form" onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium border border-red-100">{error}</div>}

          {/* Image */}
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
                <p className="text-[10px] text-stone-400 mt-1.5">Leave empty to keep current photo.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Title</label>
            <Input name="title" value={formData.title} onChange={handleChange} required className="h-11 rounded-xl bg-stone-50 border-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Price (₹/Month)</label>
              <Input name="price" type="number" value={formData.price} onChange={handleChange} required className="h-11 rounded-xl bg-stone-50 border-stone-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Location</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input name="location" value={formData.location} className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" onChange={handleChange} required />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleGetLocation} className="shrink-0 h-11 w-11 rounded-xl border-stone-200 hover:bg-green-50">
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <Crosshair className="w-4 h-4 text-green-600" />}
                </Button>
              </div>
              {formData.lat && <p className="text-[10px] text-green-600 font-bold mt-1">✓ GPS Attached</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Area</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input name="area" value={formData.area} className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Water Source</label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input name="waterSource" value={formData.waterSource} className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200" onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Soil Type</label>
            <Input name="soilType" value={formData.soilType} onChange={handleChange} required className="h-11 rounded-xl bg-stone-50 border-stone-200" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Availability toggle */}
          <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
            <input type="checkbox" name="isAvailable" checked={formData.isAvailable === true || formData.isAvailable === "true"} onChange={handleChange}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">Mark as Available</p>
              <p className="text-xs text-slate-400">Uncheck if the land is currently occupied</p>
            </div>
          </label>
        </form>

        <div className="px-7 py-5 border-t border-stone-100 bg-stone-50 rounded-b-3xl">
          <Button type="submit" form="edit-land-form" disabled={loading}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-100"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
