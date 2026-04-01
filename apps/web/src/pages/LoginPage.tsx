import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { InputField } from "@/components/forms/InputField";
import { SocialButton } from "@/components/auth/SocialButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase"; // Đảm bảo bạn đã tạo file này

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberDevice: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth(); // Hàm này sẽ gọi API NestJS và lưu Token
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Gọi hàm login từ Context - hàm này sẽ fetch tới http://localhost:3000/api/auth/login
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      setErrors({
        submit: error.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Google/GitHub qua Supabase
  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrors({ submit: `Could not authenticate with ${provider}` });
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Continue your journey through the tech landscape.
          </p>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <SocialButton provider="github" onClick={() => handleSocialLogin("github")} />
          <SocialButton provider="google" onClick={() => handleSocialLogin("google")} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Or Continue With Email
          </span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password <span className="text-red-400">*</span>
              </label>
              <Link to="/forgot-password" title="Coming soon" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                Forgot password?
              </Link>
            </div>
            <InputField
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              label=""
              required
            />
          </div>

          {/* Remember this device */}
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              name="rememberDevice"
              checked={formData.rememberDevice}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-cyan-500 cursor-pointer"
            />
            <span className="text-sm text-slate-400">Remember this device</span>
          </label>

          {errors.submit && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Continue Learning"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link to="/sign-up" className="font-semibold text-cyan-400 hover:text-cyan-300">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};