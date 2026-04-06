import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Store, Loader2, Phone, MapPin, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Procurement() {
  const [procurementList, setProcurementList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProcurement = async () => {
      try {
        const res = await api.get('/admin/procurement');
        setProcurementList(res.data);
      } catch (error) {
        console.error("Failed to fetch procurement data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProcurement();
  }, []);

  const filteredList = procurementList.filter(item => 
    item.preferredCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Store className="w-6 h-6 text-green-400" /> Government Procurement</h2>
            <p className="text-slate-300 text-sm mt-1">Review expected crop arrivals at APMC/Mandi centers.</p>
        </div>
        <div className="relative w-full md:w-72 text-slate-900">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
                placeholder="Search by Mandi or Farmer..." 
                className="pl-9 bg-white/95 border-none rounded-xl h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Mandi / Center</th>
                <th className="p-4">Farmer Details</th>
                <th className="p-4">Crop</th>
                <th className="p-4">Expected Qty</th>
                <th className="p-4">Selling Month</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredList.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">No procurement requests found.</td></tr>
              ) : (
                  filteredList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">
                          {item.preferredCenter || "Not Specified"}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{item.farmer?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {item.farmer?.phone || "N/A"}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{item.cropType}</p>
                        <p className="text-xs text-slate-500">{item.variety || 'Mixed'}</p>
                      </td>
                      <td className="p-4">
                          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg text-sm">
                              {item.sellingQuantity} Qtl
                          </span>
                      </td>
                      <td className="p-4 text-slate-600">{item.sellingPeriod || "N/A"}</td>
                      <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${item.verificationStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                             {item.verificationStatus === 'Verified' ? 'Approved' : 'Pending Verification'}
                         </span>
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