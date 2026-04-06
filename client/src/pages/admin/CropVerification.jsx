import { useState, useEffect } from "react";
import api from "../../api/axios";
import { CheckCircle, XCircle, Eye, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function CropVerification() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending"); // Pending, Verified, Rejected

  const fetchCrops = async () => {
    try {
      const res = await api.get('/crops'); // Uses your existing route!
      setCrops(res.data);
    } catch (error) {
      console.error("Failed to fetch crops", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
    
    try {
      await api.put(`/admin/crops/${id}/verify`, { status });
      alert(`Crop marked as ${status}`);
      fetchCrops(); // Refresh list
    } catch (error) {
      alert("Verification failed.");
    }
  };

  const filteredCrops = crops.filter(c => c.verificationStatus === filter);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
            {['Pending', 'Verified', 'Rejected'].map(status => (
                <Button 
                    key={status} 
                    onClick={() => setFilter(status)}
                    className={`rounded-xl px-6 ${filter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    {status}
                </Button>
            ))}
        </div>
        <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search crops..." className="pl-9 w-full sm:w-64 bg-slate-50 border-none rounded-xl" />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Farmer / Crop</th>
                <th className="p-4">Location & GPS</th>
                <th className="p-4">Yield details</th>
                <th className="p-4">Evidence</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredCrops.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400">No {filter} crops found.</td></tr>
              ) : (
                  filteredCrops.map((crop) => (
                    <tr key={crop._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-base">{crop.cropType} <span className="text-xs text-slate-500">({crop.variety || 'N/A'})</span></p>
                        <p className="text-xs text-slate-500 mt-1">{crop.farmer?.name || 'Unknown Farmer'}</p>
                      </td>
                      <td className="p-4">
                        <p className="flex items-center gap-1 text-slate-900"><MapPin className="w-3.5 h-3.5 text-red-500"/> {crop.village}, {crop.district}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">{crop.gpsCoordinates}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-900">{crop.area} Acres</p>
                        <p className="text-xs text-slate-500 mt-1">Est: {crop.expectedYield} Qtl</p>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                            <a href={crop.cropImage} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                                <Eye className="w-3 h-3"/> Image
                            </a>
                            {crop.landDocument && (
                                <a href={crop.landDocument} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100">
                                    <Eye className="w-3 h-3"/> 7/12 Doc
                                </a>
                            )}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {crop.verificationStatus === 'Pending' ? (
                            <>
                                <Button size="sm" onClick={() => handleVerify(crop._id, 'Verified')} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 h-9">
                                    Approve
                                </Button>
                                <Button size="sm" onClick={() => handleVerify(crop._id, 'Rejected')} variant="destructive" className="rounded-lg px-4 h-9 bg-red-500">
                                    Reject
                                </Button>
                            </>
                        ) : (
                            <Badge className={crop.verificationStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {crop.verificationStatus}
                            </Badge>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}