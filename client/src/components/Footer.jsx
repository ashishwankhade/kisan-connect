// Footer.jsx — Redesigned
import { Sprout, ArrowRight } from "lucide-react";

export default function Footer({ setView }) {
  return (
    <footer className="bg-[#0f1f0f] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: "'Lora', Georgia, serif" }} className="font-bold text-xl text-white">AgriSmart</span>
            </div>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              Empowering Maharashtra's farmers with GPS-tracked crop registration, land marketplaces, and machinery sharing.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Platform is live and active</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Platform</h4>
            <div className="space-y-3">
              {[
                { label: "Home", view: "landing" },
                { label: "Rent Land", view: "land-renting" },
                { label: "Equipment", view: "equipment" },
                { label: "Crop Registration", view: "crop-registration" },
              ].map(({ label, view }) => (
                <button key={view} onClick={() => setView(view)}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors w-full text-left group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Legal</h4>
            <div className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
                <a key={item} href="#" className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">© 2026 AgriSmart. Built for Indian Farmers.</p>
          <div className="flex items-center gap-6">
            {["Crops", "Land", "Equipment"].map((item) => (
              <span key={item} className="text-white/20 text-xs hover:text-white/50 cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
