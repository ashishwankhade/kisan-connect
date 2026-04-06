import { useState } from "react";
import { X, Calendar as CalendarIcon, Loader2, Send, Gauge, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "../api/axios";

export default function BookEquipmentModal({ equipment, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen || !equipment) return null;

  // Calculate estimated cost dynamically based on days entered
  const estimatedCost = days ? (Number(days) * equipment.price).toLocaleString() : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 🔥 Real API Call to your new Request System
        await api.post('/requests', { 
            itemType: 'Equipment',
            itemId: equipment._id, 
            duration: Number(days), 
            message 
        });
        
        alert(`Booking request sent to the owner of ${equipment.name}!`);
        onClose();
        setDays(""); // Reset form
        setMessage("");
    } catch (error) {
        alert(error.response?.data?.message || "Failed to send booking request.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Mobile Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm md:hidden"
        >
            <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* --- LEFT SIDE: EQUIPMENT DETAILS --- */}
        <div className="w-full md:w-1/2 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="relative h-64 md:h-72 bg-slate-200">
                <img src={equipment.image} alt={equipment.name} className="w-full h-full object-cover" />
                <Badge className="absolute top-4 left-4 bg-blue-600 text-white border-none shadow-sm px-3 py-1 text-sm font-bold">
                    ₹{equipment.price} / day
                </Badge>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">{equipment.category}</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{equipment.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Power</p>
                            <p className="text-sm font-bold text-slate-700">{equipment.power}</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <Fuel className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Fuel</p>
                            <p className="text-sm font-bold text-slate-700">{equipment.fuel}</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2">
                        <CalendarIcon className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Model Year & Location</p>
                            <p className="text-sm font-bold text-slate-700">{equipment.year} • {equipment.location}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE: BOOKING FORM --- */}
        <div className="w-full md:w-1/2 bg-white flex flex-col h-full">
            <div className="hidden md:flex justify-end p-4">
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="p-6 md:px-10 md:py-4 flex-1 flex flex-col justify-center">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Request Booking</h3>
                    <p className="text-slate-500 text-sm mt-1">Send a rental request to the equipment owner.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Number of Days</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                type="number" 
                                min="1"
                                placeholder="e.g. 3" 
                                className="pl-9 h-12 bg-slate-50 border-slate-200"
                                required 
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Message to Owner (Optional)</label>
                        <textarea 
                            rows="3"
                            className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 resize-none"
                            placeholder="Hi, I need this for plowing my 5-acre farm starting next Monday..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Estimated Cost</span>
                        <span className="text-xl font-extrabold text-blue-600">₹{estimatedCost}</span>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading || !days}
                        className="w-full h-14 text-base bg-slate-900 hover:bg-blue-700 font-bold rounded-xl shadow-lg mt-2 transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send Request</>}
                    </Button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}