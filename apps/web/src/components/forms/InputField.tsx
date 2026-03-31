import React, { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * InputField - Reusable form input component with Figma design tokens
 * Features:
 * - Label with required (*) indicator
 * - Focus ring with cyan-500
 * - Error message display (red-400)
 * - Hint text (slate-500)
 * - Accessibility: htmlFor/id linking
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  error,
  hint,
  required = false,
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-slate-950 border border-slate-700 text-slate-100
          placeholder-slate-600 placeholder-opacity-70
          focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30
          transition-all duration-200
          ${error ? "border-red-500 focus:ring-red-500/30" : ""}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        {...props}
      />

      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-2 text-sm text-slate-500">{hint}</p>
      )}
    </div>
  );
};
