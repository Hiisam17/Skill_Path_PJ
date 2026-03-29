import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { InputField } from "@/components/InputField";
import { SocialButton } from "@/components/SocialButton";
import { useAuth } from "@/context/AuthContext";
import type { LoginDto } from "@/types";

/**
 * LoginPage - User login page with Figma design
 * Features:
 * - Social buttons first (GitHub, Google)
 * - Email/password form fields
 * - "Forgot password?" link
 * - "Remember this device" checkbox
 * - Divider with "OR CONTINUE WITH EMAIL"
 * - Link to sign-up page
 * - Demo credentials info box
 */
export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberDevice: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
      } as LoginDto);
      navigate("/career-paths");
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Login failed. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "github" | "google") => {
    // TODO: Implement OAuth flow
    console.log(`Login with ${provider}`);
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

        {/* Social buttons FIRST */}
        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            provider="github"
            onClick={() => handleSocialLogin("github")}
          />
          <SocialButton
            provider="google"
            onClick={() => handleSocialLogin("google")}
          />
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
          {/* Email */}
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

          {/* Password with Forgot link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password <span className="text-red-400">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 rounded-lg
                bg-slate-950 border border-slate-700 text-slate-100
                placeholder-slate-600 placeholder-opacity-70
                focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30
                transition-all duration-200
                ${errors.password ? "border-red-500 focus:ring-red-500/30" : ""}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember this device */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberDevice"
              checked={formData.rememberDevice}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-cyan-500 cursor-pointer"
            />
            <span className="text-sm text-slate-400">Remember this device</span>
          </label>

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
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Continue Learning"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign up
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-slate-900/30 border border-slate-700/50 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
            Demo Credentials
          </p>
          <p className="text-sm text-slate-300">
            <strong>Email:</strong> test@example.com
          </p>
          <p className="text-sm text-slate-300">
            <strong>Password:</strong> password123
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
