import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type NavItem =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Roadmaps", to: "/explore" },
  { label: "Community", href: "#community" },
];

const getInitials = (name?: string, email?: string) => {
  const displayName = name || email || "User";
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/login");
  };

  const renderNavItem = (item: NavItem) => {
    const className = "hover:text-white transition-colors duration-200";

    if (typeof item.to === "string") {
      return (
        <Link key={item.label} to={item.to} className={className} onClick={closeMobileMenu}>
          {item.label}
        </Link>
      );
    }

    return (
      <a key={item.label} href={item.href} className={className} onClick={closeMobileMenu}>
        {item.label}
      </a>
    );
  };

  const avatar = user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.fullName || user.email || "User avatar"}
      className="h-9 w-9 rounded-full object-cover border border-[#00BDD6]/30"
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-[#0d1829] border border-[#00BDD6]/30 text-[#00E5FF] flex items-center justify-center text-xs font-bold">
      {getInitials(user?.fullName, user?.email)}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#090E1A]/80 backdrop-blur-md border-b border-[#1F2937]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          Dev<span className="text-[#00E5FF]">Path</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
          {NAV_ITEMS.map(renderNavItem)}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {avatar}
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-[#1F2937] bg-transparent text-white hover:bg-[#111726] h-9 px-4 text-sm"
                size="sm"
              >
                Dashboard
              </Button>
              <button
                onClick={handleLogout}
                className="text-sm text-[#94A3B8] hover:text-white transition-colors px-3 py-1.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-[#94A3B8] hover:text-white transition-colors px-3 py-1.5"
              >
                Log In
              </button>
              <Button
                onClick={() => navigate("/sign-up")}
                className="bg-[#00BDD6] hover:bg-[#00BDD6]/90 text-[#090E1A] font-semibold text-sm
                           shadow-[0_0_15px_rgba(0,189,214,0.3)] hover:shadow-[0_0_20px_rgba(0,189,214,0.5)]
                           transition-all duration-300"
                size="sm"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-[#94A3B8] hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F2937] px-4 py-4 flex flex-col gap-3 bg-[#090E1A]">
          <div className="flex flex-col gap-3 text-[#94A3B8] text-sm">
            {NAV_ITEMS.map(renderNavItem)}
          </div>
          <hr className="border-[#1F2937]" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-white">
                {avatar}
                <span>{user?.fullName || user?.email || "Logged in"}</span>
              </div>
              <Button
                onClick={() => {
                  closeMobileMenu();
                  navigate("/dashboard");
                }}
                variant="outline"
                className="border-[#1F2937] bg-transparent text-white hover:bg-[#111726] w-full"
                size="sm"
              >
                Go to Dashboard
              </Button>
              <button
                className="text-sm text-[#94A3B8] hover:text-white text-left py-1"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="text-sm text-[#94A3B8] hover:text-white text-left py-1"
                onClick={() => {
                  closeMobileMenu();
                  navigate("/login");
                }}
              >
                Log In
              </button>
              <Button
                onClick={() => {
                  closeMobileMenu();
                  navigate("/sign-up");
                }}
                className="bg-[#00BDD6] text-[#090E1A] font-semibold w-full"
                size="sm"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
