/**
 * LoginPage Component
 * Authentication page for user login
 * Form with email and password fields
 * Validates input and handles login via AuthContext
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { LoginDto } from "@/types";

/**
 * LoginPage Component
 * Displays login form with email and password inputs
 * On successful login, navigates to /career-paths
 * Shows error messages if login fails
 *
 * @returns {JSX.Element} Login form
 */
export const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle login form submission
   * Validates input, calls AuthContext.login(), and redirects on success
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Input validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      // Call login from AuthContext
      await login({ email, password } as LoginDto);

      // On success, redirect to career paths
      navigate("/career-paths");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>IT Career Roadmap</h1>
        <h2 style={styles.subtitle}>Sign In</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Demo Credentials:</p>
          <p style={styles.demoCredentials}>
            Email: <strong>test@example.com</strong>
            <br />
            Password: <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// ───── STYLES ─────
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  } as const,
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  } as const,
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#666",
    textAlign: "center" as const,
  },
  errorBox: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fcc",
  } as const,
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  } as const,
  input: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  } as const,
  button: {
    padding: "12px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "8px",
    transition: "background-color 0.2s",
  } as const,
  footer: {
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #eee",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "8px",
  } as const,
  demoCredentials: {
    fontSize: "12px",
    color: "#666",
    lineHeight: "1.6",
  } as const,
};
