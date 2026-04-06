import { Button } from "@/components/ui/button";
import { Sprout, Menu, X, Leaf, Map, Tractor, Home, LogIn, UserPlus, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios"; // 🔥 Import API to call the logout endpoint

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"; 

export default function Navbar({ setView, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Check for logged-in user whenever the view changes
  useEffect(() => {
    // 🔥 We only check for name/role now. 
    // The actual secure token is in the HTTP-Only cookie.
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("role");

    if (name) {
      setUser({ name, role });
    } else {
      setUser(null);
    }
  }, [currentView]);

  // 🔥 UPDATED LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      // Call the backend to clear the HTTP-Only cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed on server, clearing local state anyway.", error);
    } finally {
      // Clear local UI data
      localStorage.clear();
      setUser(null);
      setIsMenuOpen(false); // Close mobile menu if open
      setView("login");
      window.scrollTo(0, 0);
    }
  };

  const navigateTo = (page) => {
    setView(page);
    setIsMenuOpen(false); // Close mobile menu on navigate
    window.scrollTo(0, 0);
  };

  const activeClass = (page) => 
    currentView === page 
      ? "text-green-600 font-bold border-b-2 border-green-600 pb-1 flex items-center gap-1.5" 
      : "text-slate-600 hover:text-green-600 transition-colors cursor-pointer flex items-center gap-1.5";

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      
      {/* Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => navigateTo("landing")}
      >
        <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-green-100">
          <Sprout className="text-white w-5 h-5 md:w-6 md:h-6" />
        </div>
        <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 leading-none">
          AgriSmart
        </span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button onClick={() => navigateTo("landing")} className={activeClass("landing")}>
          <Home className="w-4 h-4" /> Home
        </button>
        <button onClick={() => navigateTo("crop-registration")} className={activeClass("crop-registration")}>
          <Leaf className="w-4 h-4" /> Crops
        </button>
        <button onClick={() => navigateTo("land-renting")} className={activeClass("land-renting")}>
          <Map className="w-4 h-4" /> Land
        </button>
        <button onClick={() => navigateTo("equipment")} className={activeClass("equipment")}>
          <Tractor className="w-4 h-4" /> Equipment
        </button>
      </div>

      {/* User Section (Desktop & Mobile Toggle) */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* If User is Logged In (Desktop) */}
        {user ? (
          <div className="hidden sm:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 rounded-full border border-slate-200 hover:bg-slate-50 h-10">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-700 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize leading-none mt-1">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 mt-1 shadow-xl border-slate-100">
                <DropdownMenuLabel className="font-bold text-slate-800">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5" onClick={() => navigateTo("profile")}>
                  <User className="w-4 h-4 mr-2 text-slate-500" /> Profile & Listings
                </DropdownMenuItem>
                
                {/* Admin Specific Link */}
                {user.role === 'admin' && (
                   <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5" onClick={() => navigateTo("adminDashboard")}>
                     <Map className="w-4 h-4 mr-2 text-blue-500" /> Admin Dashboard
                   </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg py-2.5" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          /* If User is NOT Logged In (Desktop) */
          <>
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex text-slate-600 font-semibold hover:text-green-600 transition-colors h-10"
              onClick={() => navigateTo("login")}
            >
              Log in
            </Button>
            <Button 
              className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 shadow-md shadow-green-100 rounded-xl px-5 font-bold h-10"
              onClick={() => navigateTo("signup")}
            >
              Join Now
            </Button>
          </>
        )}

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* --- Mobile Dropdown (Expanded) --- */}
      {isMenuOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-white border-b border-slate-200 p-4 flex flex-col gap-1 md:hidden shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50 max-h-[calc(100vh-70px)] overflow-y-auto">
          
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-1 mb-2">
            <button onClick={() => navigateTo("landing")} className={`p-3 rounded-xl flex items-center gap-3 w-full text-left font-semibold ${currentView === 'landing' ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Home className={`w-5 h-5 ${currentView === 'landing' ? 'text-green-600' : 'text-slate-400'}`} /> Home
            </button>
            <button onClick={() => navigateTo("crop-registration")} className={`p-3 rounded-xl flex items-center gap-3 w-full text-left font-semibold ${currentView === 'crop-registration' ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Leaf className={`w-5 h-5 ${currentView === 'crop-registration' ? 'text-green-600' : 'text-slate-400'}`} /> Crops Marketplace
            </button>
            <button onClick={() => navigateTo("land-renting")} className={`p-3 rounded-xl flex items-center gap-3 w-full text-left font-semibold ${currentView === 'land-renting' ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Map className={`w-5 h-5 ${currentView === 'land-renting' ? 'text-green-600' : 'text-slate-400'}`} /> Land Renting
            </button>
            <button onClick={() => navigateTo("equipment")} className={`p-3 rounded-xl flex items-center gap-3 w-full text-left font-semibold ${currentView === 'equipment' ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Tractor className={`w-5 h-5 ${currentView === 'equipment' ? 'text-green-600' : 'text-slate-400'}`} /> Equipment
            </button>
          </div>
          
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
             {user ? (
               <>
                 <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                 </div>
                 
                 <Button 
                   variant="outline" 
                   className="w-full h-12 rounded-xl flex items-center justify-start gap-3 font-semibold text-slate-700 border-slate-200"
                   onClick={() => navigateTo("profile")}
                 >
                   <User className="w-5 h-5 text-slate-400" /> My Profile
                 </Button>

                 {user.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl flex items-center justify-start gap-3 font-semibold text-slate-700 border-slate-200"
                      onClick={() => navigateTo("adminDashboard")}
                    >
                      <Map className="w-5 h-5 text-blue-500" /> Admin Dashboard
                    </Button>
                 )}

                 <Button 
                   variant="outline" 
                   className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-red-600 border-red-200 hover:bg-red-50 bg-red-50/50"
                   onClick={handleLogout}
                 >
                   <LogOut className="w-5 h-5" /> Log Out
                 </Button>
               </>
             ) : (
               <>
                 <Button 
                   variant="outline" 
                   className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700"
                   onClick={() => navigateTo("login")}
                 >
                   <LogIn className="w-5 h-5" /> Log In
                 </Button>
                 <Button 
                   className="w-full bg-green-600 h-12 rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                   onClick={() => navigateTo("signup")}
                 >
                   <UserPlus className="w-5 h-5" /> Join AgriSmart
                 </Button>
               </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}