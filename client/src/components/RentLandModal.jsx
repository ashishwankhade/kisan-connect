// ============================================================
// RentLandModal.jsx — Redesigned
// ============================================================
import { useState } from "react";
import { X, Calendar, Loader2, Send, MapPin, Ruler, Droplets, Sprout, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "../api/axios";

export default function RentLandModal({ land, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen || !land) return null;

  const estimatedCost = duration ? `₹${(Number(duration) * Number(land.price)).toLocaleString()}` : "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/requests", { itemType: "Land", itemId: land._id, duration: Number(duration), message });
      alert(`Request sent for ${land.title}!`);
      onClose(); setDuration(""); setMessage("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send request.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md">
          <X className="w-4 h-4 text-slate-600" />
        </button>

        {/* LEFT: Details */}
        <div className="w-full md:w-[45%] overflow-y-auto">
          <div className="relative h-56 md:h-72">
            {land.image
              ? <img src={land.image} alt={land.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-green-50 flex items-center justify-center"><Sprout className="w-16 h-16 text-green-200" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-white/70 text-xs font-semibold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{land.location}</p>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif" }} className="text-xl font-bold text-white leading-tight">{land.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-sm font-bold">
                  ₹{Number(land.price).toLocaleString()}<span className="text-white/60 text-xs">/mo</span>
                </span>
                {land.isAvailable && <span className="bg-green-500 text-white px-3 py-1 rounded-xl text-xs font-bold">Available</span>}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Ruler, label: "Area", val: land.area, color: "text-slate-500" },
                { icon: Droplets, label: "Water", val: land.waterSource, color: "text-blue-500" },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase mb-1.5 ${color}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{val}</p>
                </div>
              ))}
              <div className="col-span-2 bg-stone-50 rounded-2xl p-3 border border-stone-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase mb-1.5 text-green-600">
                  <Sprout className="w-3 h-3" /> Soil Type
                </div>
                <p className="text-sm font-semibold text-slate-800">{land.soilType}</p>
              </div>
            </div>

            {land.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{land.description}</p>
            )}

            <div className="flex items-center gap-2.5 bg-green-50 rounded-2xl p-3 border border-green-100">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-800">Verified Listing</p>
                <p className="text-[10px] text-green-600">Documents checked by AgriSmart</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="w-full md:w-[55%] bg-[#fafaf7] flex flex-col">
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">Rental Request</p>
            <h3 style={{ fontFamily: "'Lora', Georgia, serif" }} className="text-2xl font-bold text-slate-900 mb-1">Interested in this land?</h3>
            <p className="text-sm text-slate-500 mb-8">Send a request directly to the owner — no broker fees.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Duration (Months)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input type="number" min="1" placeholder="e.g. 6" required value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-12 pl-11 rounded-xl border-stone-200 bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Message (Optional)</label>
                <textarea rows="3" value={message} onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Hi, I want to grow wheat on this land starting next month..."
                />
              </div>

              {/* Cost preview */}
              {duration && (
                <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-stone-200">
                  <span className="text-sm text-slate-600 font-medium">Estimated Total</span>
                  <span className="text-xl font-bold text-green-700">{estimatedCost}</span>
                </div>
              )}

              <Button type="submit" disabled={loading || !duration}
                className="w-full h-13 py-3.5 text-sm bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-100 gap-2 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Rental Request</>}
              </Button>

              <p className="text-[11px] text-center text-slate-400">By sending, you agree to our Terms of Service.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
