import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import {register} from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const {setUser} = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading,setLoading] = useState(false);
   const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(""); setSuccess("");
    if(password!==confirmPassword){setError("Passwords do not match.");return;}
    setLoading(true);
    try {const result=await register(name,email,password);setUser(result.user);setSuccess("Account created successfully.");navigate("/dashboard");}
    catch(error){setError((error as Error).message);}
    finally{setLoading(false);}
  };

  return (
    <MainLayout>
      <section className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-950 px-4 py-16">

        <div className="w-full max-w-md">

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">

            {/* Heading */}

            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20">
                🚀
              </div>

              <h1 className="text-3xl font-extrabold text-white">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Join AI Content Studio today
              </p>

            </div>

            {/* Error */}

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Name */}

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  Full Name
                </label>

                <input
                  type="text" id="name" required autoComplete="name" minLength={2} maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

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
                  type="password" id="password" required autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12+ characters, a letter and a number" minLength={12} maxLength={128}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              {/* Confirm Password */}

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">
                  Confirm Password
                </label>

                <input
                  type="password" id="confirm-password" required autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              {/* Button */}

              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>

            </form>

            {/* Login Link */}

            <div className="mt-7 text-center text-sm text-slate-400">

              Already have an account?

              <Link
                to="/login"
                className="ml-2 font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Login
              </Link>

            </div>

          </div>

        </div>

      </section>
    </MainLayout>
  );
}
