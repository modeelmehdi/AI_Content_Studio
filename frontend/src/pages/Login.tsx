import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import {login} from "../services/authService";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {setUser} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { const result = await login(email,password); setUser(result.user); navigate((location.state as {from?:string})?.from||"/dashboard"); }
    catch(error) { setError((error as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <section className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-950 px-4 py-16">

        <div className="w-full max-w-md">

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">

            {/* Icon */}

            <div className="mb-6 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20">
                👋
              </div>

              <h1 className="text-3xl font-extrabold text-white">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Login to continue to AI Content Studio
              </p>

            </div>

            {/* Error */}

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email Address
                </label>

                <input
                  type="email" id="email" required autoComplete="email" maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              {/* Password */}

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>

                <input
                  type="password" id="password" required autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <p className="text-xs text-slate-500">Your session is protected with secure cookies. Sign out on shared devices.</p>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Login"}
              </button>

            </form>

            {/* Register */}

            <div className="mt-7 text-center text-sm text-slate-400">

              Don't have an account?

              <Link
                to="/register"
                className="ml-2 font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </section>
    </MainLayout>
  );
}