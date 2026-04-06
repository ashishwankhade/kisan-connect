import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Users, Loader2, Phone, Calendar as CalIcon } from "lucide-react";

export default function FarmerDirectory() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await api.get('/admin/farmers');
        setFarmers(res.data);
      } catch (error) {
        console.error("Failed to fetch farmers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
        <div>
            <h2 className="text-xl font-bold text-slate-900">Farmer Directory</h2>
            <p className="text-sm text-slate-500">Total Registered Users: {farmers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {farmers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{user.name}</td>
                  <td className="p-4 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400"/> {user.phone || user.email}</td>
                  <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Farmer</span>
                  </td>
                  <td className="p-4 flex items-center gap-2 text-slate-500">
                      <CalIcon className="w-4 h-4"/> {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}