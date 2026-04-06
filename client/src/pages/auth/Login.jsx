import { useState } from "react";
import api from "../../api/axios"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sprout, Lock, Mail, ChevronLeft, ArrowRight, Loader2 } from "lucide-react";

export default function Login({ setView }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
      // 1. Call Backend
      const response = await api.post("/auth/login", formData);
      
      // 2. Extract Data (🔥 token is no longer extracted, it's safely in the HTTP-Only cookie!)
      const { role, name } = response.data;

      // 3. Save only UI state to Storage
      localStorage.setItem("role", role);
      localStorage.setItem("userName", name);

      alert(`Welcome back, ${name}!`);

      // 4. Navigate based on Role
      if (role === 'admin') {
        setView('adminDashboard');
      } else {
        setView('farmerDashboard');
      }

    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>

      <div className="w-full max-w-[400px] space-y-6">
        {/* Navigation Back */}
        <button 
          onClick={() => setView('landing')} 
          className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden">
          <CardHeader className="pt-8 pb-4 text-center">
            <div className="bg-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">AgriSmart Login</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs text-center font-medium animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="name@farm.com" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all focus:ring-green-500" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-xs text-green-600 font-bold hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all focus:ring-green-500" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-bold shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          New to the platform? 
          <button 
            onClick={() => setView('signup')}
            className="text-green-600 font-bold hover:underline ml-1"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}