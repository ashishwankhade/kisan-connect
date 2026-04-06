import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import LandRenting from "./components/LandRenting";
import EquipmentRental from "./components/EquipmentRental"; 
import Footer from "./components/Footer";
import Login from "./pages/auth/Login"; 
import SignUp from "./pages/auth/SignUp"; 
import UserProfile from "./components/UserProfile";
import CropRegistration from "./components/CropRegistration"; 

// 🔥 IMPORT THE NEW ADMIN LAYOUT
import AdminLayout from "./components/layouts/AdminLayout";

export default function App() {
  // 🔥 FIX 1: Initialize state from sessionStorage so it remembers the page after reload
  const [view, setView] = useState(() => {
    return sessionStorage.getItem("currentView") || "landing";
  });

  // 🔥 FIX 2: Save the current view to sessionStorage every time it changes
  useEffect(() => {
    sessionStorage.setItem("currentView", view);
  }, [view]);

  // 1. Auto-Login & Role Check on App Load
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    const role = localStorage.getItem("role"); // 🔥 Need to know if they are an admin
    
    // If user is logged in, we route them based on their role
    if (userName) {
      // Only redirect if they are currently on a login/signup page
      if (view === 'login' || view === 'signup') {
        // Redirect admins to admin dashboard, farmers to landing
        if (role === 'admin') {
          setView('adminDashboard');
        } else {
          setView('landing');
        }
      }
    }
    
    window.scrollTo(0, 0);
  }, []); // Run once on mount

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // 2. Helper to hide Navbar/Footer for auth pages AND the Admin Dashboard
  // The Admin layout has its own sidebar, so we hide the normal navigation
  const hideLayout = ["login", "signup", "adminDashboard"].includes(view);

  return (
    <div className="min-h-screen bg-slate-50/30 selection:bg-green-100 selection:text-green-900 flex flex-col">
      
      {/* Show Standard Navbar only for public pages */}
      {!hideLayout && <Navbar setView={setView} currentView={view} />}

      <main className="flex-grow">
        {/* --- AUTH VIEWS --- */}
        {view === "login" && <Login setView={setView} />}
        {view === "signup" && <SignUp setView={setView} />}

        {/* --- ADMIN DASHBOARD --- */}
        {/* 🔥 NEW: Renders the Admin UI when view is set to adminDashboard */}
        {view === "adminDashboard" && <AdminLayout setView={setView} />}

        {/* --- MAIN PUBLIC CONTENT --- */}
        {view === "landing" && <LandingPage setView={setView} />}
        {view === "land-renting" && <LandRenting setView={setView} />}
        {view === "profile" && <UserProfile setView={setView} />}
        {view === "equipment" && <EquipmentRental setView={setView} />}
        {view === "crop-registration" && <CropRegistration setView={setView} />}
      </main>

      {/* Show Footer only for public pages */}
      {!hideLayout && <Footer setView={setView} />} 
    </div>
  );
}