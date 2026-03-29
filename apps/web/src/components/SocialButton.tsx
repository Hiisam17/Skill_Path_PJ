import React, { type ButtonHTMLAttributes } from "react";
import { Code, Mail } from "lucide-react";

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "github" | "google";
  loading?: boolean;
}

/**
 * SocialButton - Social authentication buttons (GitHub and Google)
 * Features:
 * - GitHub and Google provider variants
 * - lucide-react icons
 * - Hover states and smooth transitions
 * - Loading state support
 */
export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  loading = false,
  disabled = false,
  ...props
}) => {
  const isGithub = provider === "github";

  return (
    <button
      disabled={disabled || loading}
      className={`
        w-full py-3 px-4 rounded-lg border border-slate-700
        flex items-center justify-center gap-2 font-semibold text-sm
        transition-all duration-200
        ${
          isGithub
            ? "bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-slate-100"
            : "bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-slate-100"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:border-slate-600
      `}
      {...props}
    >
      {isGithub ? (
        <Code size={20} className="flex-shrink-0" />
      ) : (
        <Mail size={20} className="flex-shrink-0" />
      )}
      <span>
        {loading
          ? "Connecting..."
          : isGithub
            ? "Continue with GitHub"
            : "Continue with Google"}
      </span>
    </button>
  );
};
