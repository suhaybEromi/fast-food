import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

import { useAuth } from "../AuthContext";
import { loginAdmin, signupAdmin } from "../../services/auth.service";
import heroImage from "../../../assets/hero.png";

const emptyForm = {
  // name: "",
  email: "",
  password: "",
};

const getErrorMessage = error =>
  error.response?.data?.message || "Something went wrong. Please try again.";

export default function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate, checkingSession, isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const destination = location.state?.from?.pathname || "/";

  const copy = useMemo(
    () =>
      isSignup
        ? {
            eyebrow: "Admin signup",
            title: "Create the admin account",
            helper:
              "Create an admin profile to manage foods, categories, stock, and orders.",
            button: "Create admin",
          }
        : {
            eyebrow: "Admin login",
            title: "Welcome back",
            helper: "Sign in to manage foods, categories, stock, and orders.",
            button: "Login to dashboard",
          },
    [isSignup],
  );

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7f6] p-6 text-slate-600">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Checking admin access...
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const fillAdmin = () => {
    setForm({ email: "suhaibmuhammad083@gmail.com", password: "suhayb" });
  };

  const handleChange = event => {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const response = isSignup
        ? await signupAdmin(payload)
        : await loginAdmin(payload);

      authenticate(response);
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f5f7f6] text-slate-950 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden min-h-screen bg-[#17212b] p-8 text-white lg:grid">
        <div
          className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-cover bg-center p-8 shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(23, 33, 43, 0.28), rgba(23, 33, 43, 0.88)), url(${heroImage})`,
          }}
        >
          <div className="inline-flex w-fit items-center gap-3 rounded-lg bg-white/95 px-4 py-3 text-slate-950 shadow-lg">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-600 text-white">
              <Store size={21} />
            </span>
            <div>
              <p className="text-sm font-black uppercase text-red-600">
                FireFast
              </p>
              <p className="text-sm font-bold text-slate-500">Admin console</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              <ShieldCheck size={17} />
              Protected dashboard access
            </div>
            <h1 className="text-5xl font-black leading-none tracking-normal">
              Run the menu with confidence.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80">
              Admins can update foods, categories, availability, and live orders
              after signing in.
            </p>
          </div>
        </div>
      </section>

      <section className="grid min-h-screen place-items-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-600 text-white">
              <Store size={22} />
            </span>
            <div>
              <p className="text-xl font-black text-slate-950">FireFast</p>
              <p className="text-sm font-bold text-slate-500">Admin console</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8"
          >
            <p className="text-sm font-black uppercase text-red-600">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {copy.helper}
            </p>

            <div>
              <button
                type="button"
                onClick={fillAdmin}
                className="mt-5 w-25 rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 hover:bg-red-100"
              >
                Admin
              </button>
            </div>

            <div className="mt-7 space-y-4">
              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">
                    Name
                  </span>
                  <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500 focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                    <User size={18} />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="Admin name"
                      required
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-600">
                  Email
                </span>
                <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500 focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="admin@example.com"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-600">
                  Password
                </span>
                <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-slate-500 focus-within:border-red-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
                  <LockKeyhole size={18} />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </span>
              </label>
            </div>

            {message && (
              <p className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? "Please wait..." : copy.button}
              <ArrowRight size={18} />
            </button>

            {/* <p className="mt-5 text-center text-sm font-semibold text-slate-500">
              {isSignup
                ? "Already have an admin account?"
                : "Need an admin account?"}{" "}
              <Link
                className="font-black text-red-600 hover:text-red-700"
                to={isSignup ? "/login" : "/signup"}
              >
                {isSignup ? "Login" : "Signup"}
              </Link>
            </p> */}
          </form>
        </div>
      </section>
    </main>
  );
}
