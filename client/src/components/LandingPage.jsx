import { Button } from "@/components/ui/button";
import { Sprout, Map, Tractor, ArrowRight, Wheat, Sun, CloudRain } from "lucide-react";
import cropImg from "../assets/img/crop_registration.webp";
import landImg from "../assets/img/land_rent.jpg";
import equipmentImg from "../assets/img/rental-service.jpeg";
import heroBg from "../assets/img/hero_section.webp";

export default function LandingPage({ setView }) {
  const services = [
    {
      id: "crops",
      title: "Crop Registration",
      subtitle: "Smart Field Monitoring",
      desc: "GPS-tagged crops, real-time image uploads, and government procurement — all in one place.",
      icon: Sprout,
      image: cropImg,
      accent: "#37bd68",
      lightBg: "#f0fdf4",
      route: "crop-registration",
      tag: "GPS Tracking",
    },
    {
      id: "land",
      title: "Land Marketplace",
      subtitle: "Rent or List Agricultural Land",
      desc: "Find verified farmland with soil reports, water sources, and direct owner contact.",
      icon: Map,
      image: landImg,
      accent: "#d97706",
      lightBg: "#fffbeb",
      route: "land-renting",
      tag: "Verified Listings",
    },
    {
      id: "equipment",
      title: "Equipment Rental",
      subtitle: "Machinery Sharing Network",
      desc: "Rent modern farm machinery from local owners at daily rates. No middlemen.",
      icon: Tractor,
      image: equipmentImg,
      accent: "#2563eb",
      lightBg: "#eff6ff",
      route: "equipment",
      tag: "Daily Rates",
    },
  ];

  const stats = [
    { value: "2,400+", label: "Registered Farmers", icon: "🌾" },
    { value: "₹4.2Cr", label: "Procurement Value", icon: "💰" },
    { value: "380+", label: "Land Listings", icon: "🗺️" },
    { value: "150+", label: "Equipment Listed", icon: "🚜" },
  ];

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif" }} className="bg-[#fafaf7]">
      
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a0a]/80 via-[#0a1a0a]/50 to-transparent" />
        </div>

        {/* Decorative grain overlay */}
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 w-full">
          <div className="max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-400/30 bg-green-900/30 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span style={{ fontFamily: "system-ui, sans-serif" }} className="text-green-300 text-xs font-semibold tracking-widest uppercase">
                India's #1 AgriTech Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6">
              The Farmer's
              <br />
              <span className="text-green-400 italic">Digital Field</span>
            </h1>

            <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-lg text-white/70 leading-relaxed max-w-xl mb-10">
              Register crops, list land, rent machinery — built specifically for Indian farmers
              who want to grow smarter.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Primary — bright lime-green, dark text for max contrast on dark hero */}
              <Button
                onClick={() => setView("crop-registration")}
                className="h-14 px-8 text-base font-bold rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 shadow-xl shadow-green-900/50 border-0 transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Start Registering <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {/* Secondary — solid white so it's always legible on any dark overlay */}
              <Button
                onClick={() => setView("land-renting")}
                className="h-14 px-8 text-base font-bold rounded-2xl bg-white text-slate-900 hover:bg-stone-100 shadow-md border-0 transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Browse Land
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
          <div className="w-[1px] h-12 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-[#0f1f0f] py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">{s.value}</div>
              <div style={{ fontFamily: "system-ui, sans-serif" }} className="text-xs text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-16">
          <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-xs font-bold tracking-[0.25em] text-green-600 uppercase mb-3">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Three pillars of<br /><em className="text-green-700">modern farming</em></h2>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setView(s.route)}
                className="group relative overflow-hidden rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{ background: s.lightBg, border: `1.5px solid ${s.accent}20` }}
              >
                {/* Image top */}
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ fontFamily: "system-ui, sans-serif", background: s.accent, color: "white" }}
                  >
                    {s.tag}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.accent}15` }}>
                      <Icon className="w-5 h-5" style={{ color: s.accent }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "system-ui, sans-serif", color: s.accent }} className="text-[10px] font-bold uppercase tracking-wider">{s.subtitle}</p>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{s.title}</h3>
                    </div>
                  </div>
                  <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-sm text-slate-600 leading-relaxed mb-5">{s.desc}</p>
                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ fontFamily: "system-ui, sans-serif", color: s.accent }}>
                    Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f0fdf4] py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-xs font-bold tracking-[0.25em] text-green-600 uppercase mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Get started in<br /><em className="text-green-700">3 easy steps</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "📝", title: "Create Account", desc: "Sign up for free with your phone number and district details." },
              { step: "02", icon: "🌱", title: "Register Your Assets", desc: "Add your crops, land listings, or equipment to the platform." },
              { step: "03", icon: "📲", title: "Get WhatsApp Alerts", desc: "Receive real-time notifications on rental requests and approvals." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-100 h-full">
                  <div style={{ fontFamily: "system-ui, sans-serif" }} className="text-5xl font-black text-green-100 mb-4">{item.step}</div>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEATHER CALLOUT ── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-[#0f1f0f] p-10 md:p-16 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-green-900/40 blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-green-800/20 blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Wheat className="w-8 h-8 text-green-400" />
                  <Sun className="w-6 h-6 text-yellow-400" />
                  <CloudRain className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-4xl font-bold leading-tight mb-4">
                  Built for every<br /><em className="text-green-400">Indian season</em>
                </h2>
                <p style={{ fontFamily: "system-ui, sans-serif" }} className="text-white/60 leading-relaxed mb-8">
                  Whether it\'s Kharif, Rabi, or Zaid — AgriSmart supports your entire crop cycle
                  with government MSP integration and real-time verification.
                </p>
                <Button
                  onClick={() => setView("signup")}
                  className="h-14 px-8 text-base font-bold rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 shadow-xl shadow-green-900/50 border-0 transition-all hover:-translate-y-0.5"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Join AgriSmart Free
                </Button>
              </div>

              {/* Seasonal badges */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                {[
                  { season: "Kharif", months: "Jun–Oct", color: "#16a34a" },
                  { season: "Rabi", months: "Nov–Mar", color: "#2563eb" },
                  { season: "Zaid", months: "Mar–Jun", color: "#d97706" },
                ].map((s) => (
                  <div
                    key={s.season}
                    className="rounded-2xl p-4 text-center"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}
                  >
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.season}</div>
                    <div style={{ fontFamily: "system-ui, sans-serif" }} className="text-xs text-white/50 mt-1">{s.months}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}