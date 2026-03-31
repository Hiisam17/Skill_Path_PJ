import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { InputField } from "@/components/forms/InputField";
import { SocialButton } from "@/components/auth/SocialButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
/**
 * SignUpPage - User registration page
 * Features:
 * - Full Name, Email, Password, Confirm Password fields
 * - Form validation (required, email format, password match)
 * - Social buttons (GitHub, Google) - OAuth stubs
 * - Divider with "OR SYNCHRONIZE WITH" text
 * - Link to login page
 */
export const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Gọi API Đăng ký tới Backend NestJS của chúng ta
      // (Nhớ đổi URL nếu bạn cấu hình port hoặc prefix khác nhé)
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName, // Truyền đúng tên biến fullName mà NestJS đang đợi
        }),
      });

      const data = await response.json();

      // Nếu Backend báo lỗi (ví dụ: Trùng email)
      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }

      // 2. Sau khi Backend báo "Đăng ký thành công!", ta mới gọi hàm login của AuthContext 
      // để tự động lấy token và đăng nhập cho user luôn.
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // 3. Chuyển hướng sang trang lộ trình
      navigate("/dashboard");
      
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Đã có lỗi xảy ra từ máy chủ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "github" | "google") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Nơi Supabase sẽ đá người dùng về sau khi đăng nhập thành công
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Lỗi đăng nhập social:", error.message);
        setErrors({ submit: "Không thể kết nối với " + provider });
      }
      // Lưu ý: Không cần navigate ở đây, vì Supabase sẽ tự động redirect cả trang web
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">
            Begin Your Odyssey
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Map your professional trajectory with precision.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <InputField
            name="fullName"
            label="Full Name"
            placeholder="Alex Rivers"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />

          {/* Email */}
          <InputField
            name="email"
            type="email"
            label="Email Address"
            placeholder="alex@odyssey.dev"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          {/* Password fields in 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <InputField
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm
              bg-cyan-500 hover:bg-cyan-600 text-slate-950
              shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating..." : "Create My Path 🚀"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Or Synchronize With
          </span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            provider="github"
            onClick={() => handleSocialSignup("github")}
          />
          <SocialButton
            provider="google"
            onClick={() => handleSocialSignup("google")}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
