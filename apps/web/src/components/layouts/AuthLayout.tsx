import React, { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * AuthLayout - Base layout for authentication pages
 * Features:
 * - Full-screen gradient background (#0b1326 → slate-950)
 * - Ambient glow blobs with blur effects
 * - Centered card with backdrop-blur
 * - Logo "DevPath" (cyan-400 gradient)
 * - Footer copyright text
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0b1326] via-slate-950 to-slate-950 relative">
      {/* Ambient glow blobs - left */}
      <div className="absolute -left-40 -top-40 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />

      {/* Ambient glow blobs - right */}
      <div className="absolute -right-40 top-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />

      {/* Main content container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo - positioned at top */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              DevPath
            </span>
          </h1>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md backdrop-blur-md bg-slate-950/70 border border-slate-700/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-cyan-500/10">
          {children}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-xs text-slate-600">
          <p>© 2024 DevPath. The Architectural Navigator.</p>
        </div>
      </div>
    </div>
  );
};
