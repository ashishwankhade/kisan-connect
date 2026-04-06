import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Tractor, MapPin, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplaceMod() {
  const [data, setData] = useState({ lands: [], equipment: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('land'); // 'land' or 'equipment'

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/marketplace');
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch marketplace data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} listing? This cannot be undone.`)) return;
    
    try {
      await api.delete(`/admin/marketplace/${type}/${id}`);
      fetchData(); // Refresh lists
    } catch (error) {
      alert("Failed to delete listing.");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  const currentList = tab === 'land' ? data.lands : data.equipment;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-max">
        <button 
            onClick={() => setTab('land')} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'land' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            Land Listings ({data.lands.length})
        </button>
        <button 
            onClick={() => setTab('equipment')} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'equipment' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            Equipment Listings ({data.equipment.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No {tab} listings found.
              </div>
          ) : (
              currentList.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                    <div className="h-40 bg-slate-100 relative">
                        {item.image ? (
                            <img src={item.image} alt="listing" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><Tractor className="w-8 h-8 text-slate-300"/></div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-900">
                            ₹{item.price} {tab === 'equipment' ? '/day' : ''}
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{item.title || item.name}</h3>
                        <p className="text-xs flex items-center gap-1 text-slate-500 mb-4"><MapPin className="w-3 h-3 text-red-500"/> {item.location}</p>
                        
                        <Button 
                            onClick={() => handleDelete(tab, item._id)} 
                            variant="destructive" 
                            className="w-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Remove Listing
                        </Button>
                    </div>
                </div>
              ))
          )}
      </div>

    </div>
  );
}