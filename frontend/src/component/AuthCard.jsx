import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthCard({ onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = isSignUp
        ? "http://localhost:8000/api/v1/auth/signup"
        : "http://localhost:8000/api/v1/auth/login";

      const payload = isSignUp
        ? { name, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Authentication failed. Please try again.");
      }

      const user = data.user || data.users;
      setSuccess(isSignUp ? "Account created successfully!" : "Signed in successfully!");
      localStorage.setItem("ats_user", JSON.stringify(user));

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
      }, 500);
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 sm:p-10 transition-all">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="font-bold text-2xl text-slate-900 tracking-tight mb-1">
          SiliconFriends
        </h1>
        <p className="text-sm text-slate-500 font-medium text-center">
          {isSignUp ? "Create your new account" : "Sign in to your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input (only for Sign Up) */}
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rohit Indurke"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              required
            />
          </div>
        )}

        {/* Email input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            required
          />
        </div>

        {/* Password input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            required
            minLength={isSignUp ? 6 : 1}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit button: Continue with Email */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading
            ? "Please wait..."
            : isSignUp
            ? "Create Account"
            : "Continue with Email"}
        </button>

        {/* Footer: Replaced "Contact Support" with "Sign Up" */}
        <div className="text-center pt-3 text-xs text-slate-500">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

