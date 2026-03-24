/**
 * LoginPage Component
 * Authentication page for user login
 * Form with email and password fields
 * Validates input and handles login via AuthContext
 */

import { useState } from "react";
import type { FormEvent } from "react";

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
  /**
   * Handle login form submission
   * TODO: Call AuthContext.login() with email/password
   * TODO: On success, redirect to /career-paths
   * TODO: On error, display error message
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }

    try {
      setIsLoading(true);
      // TODO: const { login } = useAuth();
      // TODO: await login({ email, password } as LoginDto);
      // TODO: navigate('/career-paths');
      throw new Error("Not implemented");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
