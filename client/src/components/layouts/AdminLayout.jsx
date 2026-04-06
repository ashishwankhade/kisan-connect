import { useState } from "react";
import { 
  LayoutDashboard, Sprout, Tractor, Users, Store, 
  LogOut, Menu, X, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "../../api/axios";

// 🔥 IMPORTING THE ACTUAL ADMIN PAGES
// Change these lines:
import DashboardOverview from "../../pages/admin/DashboardOverview";
import CropVerification from "../../pages/admin/CropVerification";
import Procurement from "../../pages/admin/Procurement";
import MarketplaceMod from "../../pages/admin/MarketplaceMod";
import FarmerDirectory from "../../pages/admin/FarmerDirectory";

export default function AdminLayout({ setView }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminName = localStorage.getItem("userName") || "Admin";

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      localStorage.clear(); 
      setView("landing");
    }
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "crops", label: "Crop Verification", icon: Sprout },
    { id: "procurement", label: "Procurement", icon: Store },
    { id: "marketplace", label: "Marketplace (Land/Equip)", icon: Tractor },
    { id: "farmers", label: "Farmer Directory", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      // Pass setActiveTab so the dashboard cards can click through to other pages
      case "overview": return <DashboardOverview setActiveTab={setActiveTab} />;
      case "crops": return <CropVerification />;
      case "procurement": return <Procurement />;
      case "marketplace": return <MarketplaceMod />;
      case "farmers": return <FarmerDirectory />;
      default: return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950">
            <ShieldCheck className="w-8 h-8 text-green-500 mr-3" />
            <span className="text-xl font-extrabold text-white tracking-wide">AgriSmart <span className="text-green-500">Admin</span></span>
            <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-green-600 text-white shadow-md shadow-green-900/50' 
                      : 'hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{adminName}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">System Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold border-2 border-slate-200">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8 custom-scrollbar">
          {renderContent()}
        </div>

      </main>

    </div>
  );
}