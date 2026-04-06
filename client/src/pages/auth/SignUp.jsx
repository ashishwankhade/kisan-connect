import { useState } from "react";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sprout, User, Mail, Phone, MapPin, Lock, ChevronLeft, UserPlus, Loader2 } from "lucide-react";

export default function SignUp({ setView }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    email: "",
    password: "",
    role: "farmer", 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", formData);
      
      // 🔥 FIX APPLIED HERE: Token is no longer manually stored. 
      // The browser automatically saves the HTTP-Only cookie from the response.
      const { role, name } = response.data;

      // Save UI state only
      localStorage.setItem("role", role);
      localStorage.setItem("userName", name);
      
      alert("Registration Successful!");
      
      // Redirect based on the role received from backend
      if (role === 'admin') {
        setView('adminDashboard');
      } else {
        setView('farmerDashboard');
      }

    } catch (err) {
      // Extract the specific message from the backend controller
      const errorMessage = err.response?.data?.message || "Server error. Please check backend logs.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[450px] space-y-4">
        
        <button 
          onClick={() => setView('login')}
          className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </button>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="bg-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-100">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Farmer Registration</CardTitle>
            <CardDescription>Join AgriSmart to manage crops and equipment</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="name"
                  placeholder="Full Name" 
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-green-500" 
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="phone"
                  type="tel"
                  placeholder="Phone Number" 
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-green-500" 
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="district"
                  placeholder="District (e.g. Nagpur)" 
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-green-500" 
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="email"
                  type="email" 
                  placeholder="Email Address" 
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-green-500" 
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  name="password"
                  type="password" 
                  placeholder="Create Password" 
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-green-500" 
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-lg shadow-green-100 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" /> Register as Farmer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}