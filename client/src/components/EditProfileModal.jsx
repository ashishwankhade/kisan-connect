// EditProfileModal.jsx — Redesigned
import { useState, useEffect } from "react";
import api from "../api/axios";
import { X, Loader2, Save, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditProfileModal({ user, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", district: "" });

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", phone: user.phone || "", district: user.district || "" });
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await api.put("/auth/profile", formData);
      localStorage.setItem("userName", response.data.name);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update your personal details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form id="edit-profile-form" onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium border border-red-100">{error}</div>}

          {[
            { name: "name", label: "Full Name", icon: User, placeholder: "Your full name" },
            { name: "phone", label: "Phone Number", icon: Phone, placeholder: "+91 XXXXX XXXXX" },
            { name: "district", label: "District / Location", icon: MapPin, placeholder: "e.g. Nagpur, Maharashtra" },
          ].map(({ name, label, icon: Icon, placeholder }) => (
            <div key={name}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} required
                  className="h-12 pl-11 rounded-xl bg-stone-50 border-stone-200 focus:ring-green-500"
                />
              </div>
            </div>
          ))}

          <div className="pt-2 pb-1">
            <p className="text-xs text-stone-400 italic">Email address cannot be changed.</p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-stone-100 bg-stone-50">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl border-stone-200 font-semibold" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="edit-profile-form" disabled={loading}
              className="flex-1 h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-100"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
