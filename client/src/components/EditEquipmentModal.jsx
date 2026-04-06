// ============================================================
// EditEquipmentModal.jsx
// PUT /api/equipment/:id  (multipart/form-data)
// Fields: name, category, power, fuel, year, price, location,
//         isAvailable, image (optional)
// ============================================================
import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  X, Loader2, Save, MapPin, Gauge, Fuel,
  Calendar, IndianRupee, Tractor, Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["Tractor", "Harvester", "Cultivator", "Sprayer", "Seeder", "Thresher", "Pump", "Other"];
const FUELS      = ["Diesel", "Petrol", "Electric", "Solar"];

const Label = ({ children }) => (
  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{children}</p>
);

const IconInput = ({ icon: Icon, iconColor = "text-slate-400", ...props }) => (
  <div className="relative">
    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 shrink-0 ${iconColor}`} />
    <Input {...props} className="pl-9 h-11 rounded-xl bg-stone-50 border-stone-200 focus:ring-green-500" />
  </div>
);

export default function EditEquipmentModal({ equipment, isOpen, onClose, onSuccess }) {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "", category: "Tractor", power: "", fuel: "Diesel",
    year: "", price: "", location: "", isAvailable: true,
  });

  // seed form whenever the modal opens with a new equipment object
  useEffect(() => {
    if (equipment) {
      setFormData({
        name:        equipment.name        || "",
        category:    equipment.category    || "Tractor",
        power:       equipment.power       || "",
        fuel:        equipment.fuel        || "Diesel",
        year:        equipment.year        || "",
        price:       equipment.price       || "",
        location:    equipment.location    || "",
        isAvailable: equipment.isAvailable ?? true,
      });
      setImagePreview(equipment.image || null);
      setImageFile(null);
      setError("");
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData(p => ({ ...p, [e.target.name]: val }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);
      await api.put(`/equipment/${equipment._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update equipment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">

        {/* ── Header ── */}
        <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Equipment</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{equipment.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* ── Form ── */}
        <form id="edit-equipment-form" onSubmit={handleSubmit} className="p-7 space-y-5">

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Equipment Photo */}
          <div>
            <Label>Equipment Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
                {imagePreview
                  ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  : <Tractor className="w-7 h-7 text-stone-300" />
                }
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                    file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400 mt-1.5">Leave empty to keep current photo.</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label>Equipment Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Mahindra 475 Tractor"
              required
              className="h-11 rounded-xl bg-stone-50 border-stone-200"
            />
          </div>

          {/* Category + Fuel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-11 w-full pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                <select
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  className="flex h-11 w-full pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {FUELS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Power + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Power / HP</Label>
              <IconInput icon={Gauge} iconColor="text-purple-400" name="power" value={formData.power}
                onChange={handleChange} placeholder="e.g. 45 HP" required />
            </div>
            <div>
              <Label>Year of Manufacture</Label>
              <IconInput icon={Calendar} iconColor="text-slate-400" name="year" type="number"
                min="1990" max={new Date().getFullYear()} value={formData.year}
                onChange={handleChange} placeholder="e.g. 2019" required />
            </div>
          </div>

          {/* Price + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rental Price (₹/day)</Label>
              <IconInput icon={IndianRupee} iconColor="text-green-500" name="price" type="number"
                value={formData.price} onChange={handleChange} placeholder="e.g. 1500" required />
            </div>
            <div>
              <Label>Location</Label>
              <IconInput icon={MapPin} iconColor="text-red-400" name="location"
                value={formData.location} onChange={handleChange} placeholder="Village / Town" required />
            </div>
          </div>

          {/* Availability toggle */}
          <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
            {/* custom toggle */}
            <div className="relative shrink-0">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable === true || formData.isAvailable === "true"}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full bg-stone-200 peer-checked:bg-green-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Mark as Available</p>
              <p className="text-xs text-slate-400">Uncheck if this equipment is currently in use</p>
            </div>
          </label>

        </form>

        {/* ── Footer ── */}
        <div className="px-7 py-5 border-t border-stone-100 bg-stone-50 rounded-b-3xl sticky bottom-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-stone-300 text-slate-600 font-semibold text-sm hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-equipment-form"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
