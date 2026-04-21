import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import {
  Sprout, Calendar, MapPin, Ruler, Droplets, Layers,
  ChevronLeft, Navigation, Save, Loader2, Camera,
  FileText, Tractor, ArrowRight, CheckCircle, X, Plus, Clock,
  Wheat, Wind, Sun, CloudRain, Landmark, CreditCard, Hash, Building2,Info
} from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: "Crop Details",      emoji: "🌱", color: "#22c55e", light: "#f0fdf4" },
  { num: 2, label: "Location & Photos", emoji: "📍", color: "#3b82f6", light: "#eff6ff" },
  { num: 3, label: "Yield & Sales",     emoji: "🌾", color: "#f59e0b", light: "#fffbeb" },
];

const selectCls =
  "flex h-11 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all";

const inputCls =
  "h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:ring-white/40 focus:border-white/30";

const Label = ({ children, light }) => (
  <p className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${light ? "text-slate-500" : "text-white/50"}`}>
    {children}
  </p>
);

/* ─────────────────────────────────────────────────────────
   ANIMATED BOTANICAL BACKGROUND
───────────────────────────────────────────────────────── */
function BotanicalBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f0a] via-[#0d2b0d] to-[#071a07]" />
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-400/8 blur-[100px]" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-lime-400/6 blur-[80px]" />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#86efac" strokeWidth="2.5" strokeLinecap="round">
          <line x1="80" y1="800" x2="80" y2="200" />
          <line x1="80" y1="200" x2="60" y2="140" />
          <line x1="80" y1="220" x2="50" y2="175" />
          <line x1="80" y1="240" x2="100" y2="180" />
          <line x1="80" y1="260" x2="110" y2="210" />
          <line x1="80" y1="280" x2="55" y2="230" />
          <ellipse cx="75" cy="130" rx="10" ry="30" fill="#86efac" fillOpacity="0.3" stroke="#86efac" />
        </g>
        <g stroke="#86efac" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <line x1="130" y1="800" x2="140" y2="280" />
          <line x1="140" y1="280" x2="125" y2="220" />
          <line x1="140" y1="300" x2="115" y2="260" />
          <line x1="140" y1="320" x2="160" y2="265" />
          <ellipse cx="128" cy="210" rx="8" ry="24" fill="#86efac" fillOpacity="0.2" stroke="#86efac" />
        </g>
        <g stroke="#4ade80" strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <line x1="40" y1="800" x2="35" y2="350" />
          <line x1="35" y1="350" x2="20" y2="290" />
          <line x1="35" y1="370" x2="55" y2="315" />
          <ellipse cx="22" cy="278" rx="7" ry="20" fill="#4ade80" fillOpacity="0.2" stroke="#4ade80" />
        </g>
        <path d="M0 650 Q80 550 160 600 Q100 700 0 650Z" fill="#22c55e" fillOpacity="0.15" stroke="#22c55e" strokeWidth="1.5" />
        <path d="M0 700 Q100 620 200 660 Q130 750 0 700Z" fill="#16a34a" fillOpacity="0.12" />
        <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
          <line x1="1120" y1="800" x2="1110" y2="150" />
          <line x1="1110" y1="150" x2="1090" y2="90" />
          <line x1="1110" y1="170" x2="1085" y2="128" />
          <line x1="1110" y1="190" x2="1130" y2="140" />
          <line x1="1110" y1="210" x2="1140" y2="165" />
          <line x1="1110" y1="230" x2="1088" y2="188" />
          <ellipse cx="1094" cy="78" rx="9" ry="26" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" />
        </g>
        <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.4">
          <line x1="1160" y1="800" x2="1165" y2="300" />
          <line x1="1165" y1="300" x2="1148" y2="240" />
          <line x1="1165" y1="320" x2="1182" y2="270" />
          <ellipse cx="1150" cy="230" rx="8" ry="22" fill="#fbbf24" fillOpacity="0.2" stroke="#fbbf24" />
        </g>
        <path d="M1200 100 Q1100 200 1050 150 Q1120 50 1200 100Z" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeWidth="1" />
        <path d="M1200 160 Q1080 240 1040 190 Q1110 100 1200 160Z" fill="#16a34a" fillOpacity="0.1" />
        <g stroke="#86efac" strokeWidth="1.5" opacity="0.3">
          <line x1="600" y1="750" x2="600" y2="680" />
          <line x1="600" y1="690" x2="585" y2="670" />
          <line x1="600" y1="695" x2="615" y2="672" />
          <line x1="900" y1="780" x2="900" y2="720" />
          <line x1="900" y1="730" x2="888" y2="713" />
          <line x1="900" y1="735" x2="912" y2="715" />
          <line x1="300" y1="760" x2="302" y2="700" />
          <line x1="302" y1="710" x2="290" y2="695" />
          <line x1="302" y1="714" x2="314" y2="696" />
        </g>
        <line x1="0" y1="795" x2="1200" y2="795" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
        {[...Array(8)].map((_, row) =>
          [...Array(14)].map((_, col) => (
            <circle key={`${row}-${col}`} cx={80 + col * 80} cy={80 + row * 90} r="1.5" fill="#22c55e" fillOpacity="0.2" />
          ))
        )}
        <circle cx="200" cy="200" r="80" stroke="#22c55e" strokeWidth="1" strokeDasharray="6 10" opacity="0.15" fill="none" />
        <circle cx="1000" cy="600" r="100" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 10" opacity="0.12" fill="none" />
        <circle cx="600" cy="400" r="200" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4 12" opacity="0.08" fill="none" />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FLOATING STAT PILL (dashboard)
───────────────────────────────────────────────────────── */
function StatPill({ icon: Icon, val, label, color }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}25` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{val}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function CropRegistration({ setView }) {
  const [existingCrops, setExistingCrops]   = useState([]);
  const [showForm, setShowForm]             = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep]       = useState(1);
  const [loading, setLoading]               = useState(false);
  const [gpsLoading, setGpsLoading]         = useState(false);

  const [isCameraOpen, setIsCameraOpen]       = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    cropType: "Wheat", variety: "", season: "Rabi",
    sowingDate: "", expectedHarvestDate: "",
    area: "", soilType: "Black Soil", irrigationType: "Drip",
    village: "", district: "", state: "Maharashtra",
    gpsCoordinates: "", cropImage: null, landDocument: null,
    expectedYield: "", sellToGovt: false,
    sellingQuantity: "", preferredCenter: "", sellingPeriod: "",
    // Bank details
    bankAccountName: "", bankAccountNumber: "", bankIFSC: "", bankName: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/crops/mycrops");
        if (res.data?.length > 0) { setExistingCrops(res.data); setShowForm(false); }
        else setShowForm(true);
      } catch { setShowForm(true); }
      finally { setInitialLoading(false); }
    })();
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } }); }
      catch { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { alert("Camera permission denied."); setIsCameraOpen(false); }
  };
  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };
  const capturePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth  || v.clientWidth  || 640;
    const h = v.videoHeight || v.clientHeight || 480;
    if (w === 0 || h === 0) { alert("Camera not ready yet. Please wait a moment and try again."); return; }
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    c.toBlob((blob) => {
      if (!blob) { alert("Could not capture photo. Please try again."); return; }
      const file = new File([blob], "crop_photo.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(blob);
      setFormData((p) => ({ ...p, cropImage: file }));
      setCapturedPreview(previewUrl);
      stopCamera();
    }, "image/jpeg", 0.92);
  };
  const retakePhoto = () => { setFormData(p => ({ ...p, cropImage: null })); setCapturedPreview(null); startCamera(); };
  useEffect(() => () => stopCamera(), []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setFormData(p => ({ ...p, [e.target.name]: file }));
    if (e.target.name === "cropImage") setCapturedPreview(URL.createObjectURL(file));
  };
  const handleGetLocation = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setFormData(p => ({ ...p, gpsCoordinates: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })); setGpsLoading(false); },
      () => { alert("Could not get location."); setGpsLoading(false); }
    ) ?? (alert("GPS not supported."), setGpsLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cropImage) { alert("Please take or upload a crop photo."); return; }
    // Validate bank details if selling to govt
    if (formData.sellToGovt) {
      if (!formData.bankAccountName || !formData.bankAccountNumber || !formData.bankIFSC || !formData.bankName) {
        alert("Please fill in all bank account details to receive MSP payment."); return;
      }
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => v !== null && v !== "" && fd.append(k, v));
      const res = await api.post("/crops", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setExistingCrops(p => [res.data, ...p]);
      setShowForm(false);
      setFormData({
        cropType:"Wheat", variety:"", season:"Rabi", sowingDate:"", expectedHarvestDate:"",
        area:"", soilType:"Black Soil", irrigationType:"Drip", village:"", district:"",
        state:"Maharashtra", gpsCoordinates:"", cropImage:null, landDocument:null,
        expectedYield:"", sellToGovt:false, sellingQuantity:"", preferredCenter:"", sellingPeriod:"",
        bankAccountName:"", bankAccountNumber:"", bankIFSC:"", bankName:"",
      });
      setCapturedPreview(null); setCurrentStep(1);
    } catch (err) { alert(err.response?.data?.message || "Server error"); }
    finally { setLoading(false); }
  };

  /* ── loading ── */
  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <BotanicalBg />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Sprout className="w-8 h-8 text-green-400 animate-pulse" />
        </div>
        <p className="text-white/50 text-sm tracking-wide">Loading your crops…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
        @keyframes floatUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .float-1 { animation: floatUp 0.6s ease forwards; }
        .float-2 { animation: floatUp 0.6s 0.1s ease both; }
        .float-3 { animation: floatUp 0.6s 0.2s ease both; }
        .float-4 { animation: floatUp 0.6s 0.3s ease both; }
        .shimmer { animation: shimmer 3s ease-in-out infinite; }
        .glass { background: rgba(255,255,255,0.07); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); }
        .glass-white { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); }
        select option { background: #1a2e1a; color: white; }
      `}</style>

      <BotanicalBg />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ════════════ LEFT PANEL ════════════ */}
        <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col justify-between p-8 lg:p-10">
          <button
            onClick={() => setView("landing")}
            className="self-start flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs font-medium uppercase tracking-widest mb-12"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Home
          </button>

          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-full px-3.5 py-1.5 mb-6 self-start">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shimmer" />
              <span className="text-green-400 text-[11px] font-bold uppercase tracking-widest">
                {showForm ? "Step " + currentStep + " of 3" : "Crop Portal"}
              </span>
            </div>

            <h1
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-4"
            >
              {showForm ? (
                currentStep === 1 ? <>Your Crop,<br /><em className="not-italic text-green-400">Your Story.</em></> :
                currentStep === 2 ? <>Mark Your<br /><em className="not-italic text-blue-400">Field.</em></> :
                <>Plan Your<br /><em className="not-italic text-amber-400">Harvest.</em></>
              ) : (
                <>Your Crops,<br /><em className="not-italic text-green-400">Verified.</em></>
              )}
            </h1>

            <p className="text-white/40 text-sm leading-relaxed max-w-[280px]">
              {showForm ? (
                currentStep === 1 ? "Tell us what you're growing this season. Accurate details help us serve you better." :
                currentStep === 2 ? "A GPS tag and field photo verify your crop's authenticity for government records." :
                "Estimate your yield, choose your mandi, and add your bank details for direct MSP payment."
              ) : "All your registered crops tracked in one place. Verification happens within 48 hours."}
            </p>

            {showForm && (
              <div className="mt-10 space-y-3">
                {STEPS.map(s => (
                  <div key={s.num} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
                      style={{
                        background: currentStep === s.num ? s.color : currentStep > s.num ? `${s.color}30` : "rgba(255,255,255,0.07)",
                        color: currentStep >= s.num ? "white" : "rgba(255,255,255,0.3)",
                        border: `1px solid ${currentStep === s.num ? s.color : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      {currentStep > s.num ? <CheckCircle className="w-4 h-4" /> : s.emoji}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${currentStep >= s.num ? "text-white" : "text-white/25"}`}>
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showForm && existingCrops.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-3">
                <StatPill icon={Sprout} val={existingCrops.length} label="Total Crops" color="#22c55e" />
                <StatPill icon={CheckCircle} val={existingCrops.filter(c => c.verificationStatus === "Verified").length} label="Verified" color="#22c55e" />
                <StatPill icon={Clock} val={existingCrops.filter(c => c.verificationStatus === "Pending").length} label="Pending Review" color="#f59e0b" />
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-white/15 text-[10px] uppercase tracking-widest font-medium">
            <Sprout className="w-3.5 h-3.5" /> AgriSmart · Crop Registration
          </div>
        </div>

        {/* ════════════ RIGHT PANEL ════════════ */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:overflow-y-auto">
          <div className="flex-1 p-6 lg:p-10 flex flex-col">

            {/* ─── DASHBOARD VIEW ─── */}
            {!showForm ? (
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col gap-6 float-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg">Registered Crops</h2>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 20px #22c55e40" }}
                  >
                    <Plus className="w-4 h-4" /> Register New
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {existingCrops.map(crop => (
                    <CropCard key={crop._id} crop={crop} />
                  ))}
                </div>
              </div>

            ) : (
              /* ─── FORM VIEW ─── */
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col gap-6">
                {existingCrops.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}

                <form
                  onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); setCurrentStep(p => Math.min(p + 1, 3)); }}
                  className="flex flex-col gap-6 flex-1"
                >

                  {/* ══ STEP 1 ══ */}
                  {currentStep === 1 && (
                    <div className="space-y-5 float-1">
                      <FormCard title="What are you growing?" icon="🌱">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label>Crop</Label>
                            <select name="cropType" value={formData.cropType} onChange={handleChange} className={selectCls} required>
                              {["Wheat","Rice","Soybean","Cotton","Sugarcane","Other"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label>Variety / Seed Name</Label>
                            <input name="variety" value={formData.variety} onChange={handleChange} placeholder="e.g. Sharbati"
                              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                              required />
                          </div>
                          <div>
                            <Label>Season</Label>
                            <select name="season" value={formData.season} onChange={handleChange} className={selectCls} required>
                              <option value="Kharif">Kharif (Monsoon)</option>
                              <option value="Rabi">Rabi (Winter)</option>
                              <option value="Zaid">Zaid (Summer)</option>
                            </select>
                          </div>
                        </div>
                      </FormCard>

                      <FormCard title="Growing Timeline" icon="📅">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Planting Date</Label>
                            <input type="date" name="sowingDate" value={formData.sowingDate} onChange={handleChange}
                              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                              required />
                          </div>
                          <div>
                            <Label>Expected Harvest</Label>
                            <input type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={handleChange}
                              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
                              required />
                          </div>
                        </div>
                      </FormCard>

                      <FormCard title="Land Details" icon="🪨">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label>Area (Acres)</Label>
                            <input type="number" step="0.1" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 5.5"
                              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                              required />
                          </div>
                          <div>
                            <Label>Soil Type</Label>
                            <select name="soilType" value={formData.soilType} onChange={handleChange} className={selectCls}>
                              <option>Black Soil</option><option>Red Soil</option><option>Alluvial</option>
                            </select>
                          </div>
                          <div>
                            <Label>Irrigation</Label>
                            <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className={selectCls}>
                              <option value="Drip">Drip</option>
                              <option value="Sprinkler">Sprinkler</option>
                              <option value="Canal">Canal / Flood</option>
                              <option value="Rainfed">Rain-fed</option>
                            </select>
                          </div>
                        </div>
                      </FormCard>
                    </div>
                  )}

                  {/* ══ STEP 2 ══ */}
                  {currentStep === 2 && (
                    <div className="space-y-5 float-1">
                      <FormCard title="GPS Location" icon="📡">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-white/70 text-sm">Required to verify your crop's exact field location.</p>
                            {formData.gpsCoordinates && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-green-400 font-mono">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {formData.gpsCoordinates}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={gpsLoading}
                            className="shrink-0 flex items-center gap-2 h-10 px-5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", boxShadow: "0 4px 16px #3b82f640" }}
                          >
                            {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                            {formData.gpsCoordinates ? "Re-capture" : "Get Location"}
                          </button>
                        </div>
                      </FormCard>

                      <FormCard title="Field Address" icon="🏘️">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { name: "village", label: "Village", ph: "Your village" },
                            { name: "district", label: "District", ph: "Your district" },
                            { name: "state", label: "State", ph: "Maharashtra" },
                          ].map(f => (
                            <div key={f.name}>
                              <Label>{f.label}</Label>
                              <input name={f.name} value={formData[f.name]} onChange={handleChange} placeholder={f.ph}
                                className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                                required />
                            </div>
                          ))}
                        </div>
                      </FormCard>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Crop photo */}
                        <FormCard title="Crop Photo" icon="📸" required>
                          <div className="rounded-xl border border-white/15 bg-white/5 overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
                            {isCameraOpen ? (
                              <div className="w-full flex flex-col items-center p-3 gap-3">
                                <video ref={videoRef} autoPlay playsInline className="w-full max-h-[180px] rounded-lg object-cover bg-black" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="flex gap-3">
                                  <button type="button" onClick={stopCamera}
                                    className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white shadow">
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button type="button" onClick={capturePhoto}
                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
                                    <Camera className="w-4 h-4 text-slate-900" />
                                  </button>
                                </div>
                              </div>
                            ) : capturedPreview ? (
                              <div className="relative w-full group">
                                <img src={capturedPreview} alt="crop" className="w-full h-[200px] object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <button type="button" onClick={retakePhoto}
                                    className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Camera className="w-3.5 h-3.5" /> Retake
                                  </button>
                                </div>
                                <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3 p-5 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-white/50" />
                                </div>
                                <button type="button" onClick={startCamera}
                                  className="h-9 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow">
                                  Open Camera
                                </button>
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex-1 h-px bg-white/10" /><span className="text-white/25 text-[10px]">or</span><div className="flex-1 h-px bg-white/10" />
                                </div>
                                <label className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                                  Upload from device
                                  <input type="file" name="cropImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                              </div>
                            )}
                          </div>
                        </FormCard>

                        {/* 7/12 doc */}
                        <FormCard title="7/12 Document" icon="📄" subtitle="Optional">
                          <label className="rounded-xl border border-white/15 border-dashed bg-white/5 hover:bg-white/10 min-h-[200px] flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-colors group">
                            <input type="file" name="landDocument" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
                            {formData.landDocument ? (
                              <>
                                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-3">
                                  <FileText className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-xs font-bold text-white truncate max-w-full px-2">{formData.landDocument.name}</p>
                                <p className="text-[10px] text-green-400 mt-1">✓ Selected</p>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-2xl bg-white/8 group-hover:bg-white/15 flex items-center justify-center mb-3 transition-colors">
                                  <FileText className="w-6 h-6 text-white/30" />
                                </div>
                                <p className="text-sm text-white/50 font-medium">Click to Upload</p>
                                <p className="text-[10px] text-white/25 mt-1">PDF or image · 5MB max</p>
                                <p className="text-[10px] text-white/20 mt-1">Helps with MSP procurement</p>
                              </>
                            )}
                          </label>
                        </FormCard>
                      </div>
                    </div>
                  )}

                  {/* ══ STEP 3 ══ */}
                  {currentStep === 3 && (
                    <div className="space-y-5 float-1">

                      {/* Expected Yield */}
                      <FormCard title="Expected Yield" icon="⚖️">
                        <div className="max-w-xs">
                          <Label>Total Expected Yield (Quintals)</Label>
                          <input type="number" name="expectedYield" value={formData.expectedYield} onChange={handleChange} placeholder="e.g. 50"
                            className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-lg font-bold text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/30"
                            required />
                        </div>
                      </FormCard>

                      {/* MSP / Sell to Govt */}
                      <div className="rounded-2xl glass p-6">
                        <label className="flex items-start gap-4 cursor-pointer">
                          <div className="relative mt-0.5 shrink-0">
                            <input type="checkbox" name="sellToGovt" checked={formData.sellToGovt} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 rounded-full bg-white/10 peer-checked:bg-green-500 border border-white/15 peer-checked:border-green-400 transition-all" />
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">Sell to Government at MSP?</p>
                            <p className="text-white/35 text-xs mt-0.5">We'll coordinate with your nearest mandi for procurement.</p>
                          </div>
                        </label>

                        {formData.sellToGovt && (
                          <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Quantity to Sell (Quintals)</Label>
                                <input type="number" name="sellingQuantity" value={formData.sellingQuantity} onChange={handleChange} placeholder="e.g. 40"
                                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                                  required={formData.sellToGovt} />
                              </div>
                              <div>
                                {/* ── FREE-TEXT MANDI INPUT (was dropdown) ── */}
                                <Label>Preferred Mandi</Label>
                                <input
                                  type="text"
                                  name="preferredCenter"
                                  value={formData.preferredCenter}
                                  onChange={handleChange}
                                  placeholder="e.g. Nagpur Kalamna APMC"
                                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                                  required={formData.sellToGovt}
                                />
                                <p className="text-[10px] text-white/25 mt-1.5 pl-1">Type your nearest mandi / APMC name</p>
                              </div>
                            </div>

                            <div>
                              <Label>Selling Month</Label>
                              <input type="month" name="sellingPeriod" value={formData.sellingPeriod} onChange={handleChange}
                                className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark] max-w-xs"
                                required={formData.sellToGovt} />
                            </div>
                          </div>
                        )}
                      </div>

// ─────────────────────────────────────────────────────────────────────────────
// DROP-IN REPLACEMENT for the "Bank Account for Payment" FormCard in Step 3
// of CropRegistration.jsx  (search for `title="Bank Account for Payment"`)
//
// Changes vs original:
//   1. Added MSP price-variation note banner below the existing info banner.
//   2. Everything else (field layout, validation, icons) is identical.
// ─────────────────────────────────────────────────────────────────────────────

{/* ── BANK DETAILS CARD ── */}
<FormCard
  title="Bank Account for Payment"
  icon="🏦"
  subtitle={formData.sellToGovt ? "Required for MSP transfer" : "Optional"}
>
  {/* ── Existing security info banner ── */}
  <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-3">
    <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
    <p className="text-[11px] text-amber-300/80 leading-relaxed">
      Your payment for crop sale will be transferred directly to this account
      after verification. Details are securely stored and only used for MSP
      disbursement.
    </p>
  </div>

  {/* ── NEW: MSP price-variation notice ── */}
  <div className="flex items-start gap-3 rounded-xl bg-blue-500/10 border border-blue-400/20 px-4 py-3 mb-4">
    {/* Using the Info icon — make sure it's imported from lucide-react */}
    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
    <div>
      <p className="text-[11px] font-bold text-blue-300 mb-0.5 uppercase tracking-wide">
        Note — MSP Rates Vary by State
      </p>
      <p className="text-[11px] text-blue-300/70 leading-relaxed">
        Crop prices under the Minimum Support Price (MSP) scheme may differ
        across states based on individual state government policies, bonuses,
        and procurement seasons. The final amount credited to your account will
        be as per the rate applicable in your state at the time of procurement.
        For exact rates, contact your nearest APMC or Agriculture Department.
      </p>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Account Holder Name */}
    <div className="sm:col-span-2">
      <Label>Account Holder Name</Label>
      <div className="relative">
        <input
          name="bankAccountName"
          value={formData.bankAccountName}
          onChange={handleChange}
          placeholder="As printed on your passbook"
          className="w-full h-11 rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
          required={formData.sellToGovt}
        />
        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
      </div>
    </div>

    {/* Account Number */}
    <div>
      <Label>Account Number</Label>
      <div className="relative">
        <input
          name="bankAccountNumber"
          value={formData.bankAccountNumber}
          onChange={handleChange}
          placeholder="e.g. 1234567890"
          inputMode="numeric"
          className="w-full h-11 rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 tracking-widest font-mono"
          required={formData.sellToGovt}
        />
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
      </div>
    </div>

    {/* IFSC Code */}
    <div>
      <Label>IFSC Code</Label>
      <div className="relative">
        <input
          name="bankIFSC"
          value={formData.bankIFSC}
          onChange={(e) =>
            setFormData((p) => ({ ...p, bankIFSC: e.target.value.toUpperCase() }))
          }
          placeholder="e.g. SBIN0001234"
          maxLength={11}
          className="w-full h-11 rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase tracking-widest font-mono"
          required={formData.sellToGovt}
        />
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
      </div>
      <p className="text-[10px] text-white/25 mt-1.5 pl-1">
        11-character code on your cheque book
      </p>
    </div>

    {/* Bank Name */}
    <div className="sm:col-span-2">
      <Label>Bank Name</Label>
      <div className="relative">
        <input
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          placeholder="e.g. State Bank of India"
          className="w-full h-11 rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
          required={formData.sellToGovt}
        />
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
      </div>
    </div>
  </div>
</FormCard>

                    </div>
                  )}

                  {/* ── NAV BUTTONS ── */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(p => p - 1)}
                        className="flex items-center gap-2 h-11 px-6 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm font-semibold transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    ) : <div />}

                    {currentStep < 3 ? (
                      <button
                        type="submit"
                        className="flex items-center gap-2 h-11 px-8 rounded-xl text-white font-bold text-sm shadow-lg transition-all"
                        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 24px #22c55e50" }}
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading || !formData.gpsCoordinates}
                        className="flex items-center gap-2 h-11 px-8 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40"
                        style={{
                          background: loading || !formData.gpsCoordinates ? "#374151" : "linear-gradient(135deg,#22c55e,#16a34a)",
                          boxShadow: "0 4px 24px #22c55e50",
                        }}
                      >
                        {loading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          : <><Save className="w-4 h-4" /> Submit to Government</>
                        }
                      </button>
                    )}
                  </div>

                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FORM CARD WRAPPER
───────────────────────────────────────────────────────── */
function FormCard({ title, icon, children, subtitle, required: req }) {
  return (
    <div className="rounded-2xl glass p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-white font-bold text-sm">{title}</p>
        {subtitle && <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{subtitle}</span>}
        {req && <span className="text-[10px] text-red-400 font-bold ml-1">Required</span>}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CROP CARD (dashboard)
───────────────────────────────────────────────────────── */
function CropCard({ crop }) {
  const status = {
    Pending:  { bg: "bg-amber-500",  icon: Clock,        label: "Pending Verification", glow: "#f59e0b" },
    Verified: { bg: "bg-green-500",  icon: CheckCircle,  label: "Verified",             glow: "#22c55e" },
    Rejected: { bg: "bg-red-500",    icon: X,            label: "Rejected",             glow: "#ef4444" },
  }[crop.verificationStatus] || { bg: "bg-amber-500", icon: Clock, label: "Pending", glow: "#f59e0b" };
  const Icon = status.icon;

  return (
    <div className="group rounded-2xl overflow-hidden glass hover:scale-[1.02] transition-all duration-300 float-1"
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)` }}>
      <div className="relative h-44 overflow-hidden">
        <img src={crop.cropImage} alt={crop.cropType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} text-white text-[10px] font-bold shadow`}
          style={{ boxShadow: `0 0 12px ${status.glow}60` }}>
          <Icon className="w-3 h-3" /> {status.label}
        </div>
        <div className="absolute bottom-3 left-3">
          <p className="text-green-300 text-[9px] font-bold uppercase tracking-widest">{crop.season} Season</p>
          <p className="text-white text-lg font-bold leading-tight">
            {crop.cropType} <span className="text-white/40 text-sm font-normal">({crop.variety || "Mixed"})</span>
          </p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Area", val: `${crop.area} Acres`, icon: "📐" },
            { label: "Est. Yield", val: `${crop.expectedYield} Qtl`, icon: "⚖️" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className="text-[9px] text-white/30 uppercase tracking-wide font-bold mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-white">{s.icon} {s.val}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/35 font-medium">
          <MapPin className="w-3 h-3 text-red-400 shrink-0" /> {crop.village}, {crop.district}
        </div>
        {/* Show mandi if available */}
        {crop.preferredCenter && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400/60 font-medium">
            <Building2 className="w-3 h-3 shrink-0" /> {crop.preferredCenter}
          </div>
        )}
      </div>
    </div>
  );
}