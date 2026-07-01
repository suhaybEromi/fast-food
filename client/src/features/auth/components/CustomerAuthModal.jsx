import { useState } from "react";

import { useCustomerAuth } from "../AuthContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
};

export default function CustomerAuthModal({ initialMode = "login", onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signin, signup } = useCustomerAuth();

  const isSignup = mode === "signup";

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
      if (isSignup) {
        await signup(form);
      } else {
        await signin({
          email: form.email,
          password: form.password,
        });
      }

      onClose();
    } catch (error) {
      setMessage(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#171511]/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close account dialog"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#eadfce] bg-[#fffaf2] shadow-2xl">
        <div className="bg-[#201914] px-6 py-5 text-white">
          <p className="text-xs font-black uppercase text-[#f5a400]">
            Customer account
          </p>
          <h2 className="mt-1 text-3xl font-black">
            {isSignup ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm font-medium text-white/70">
            {isSignup
              ? "Save your cart and track every order from your profile."
              : "Sign in to checkout and see your current order status."}
          </p>
        </div>

        <form className="grid gap-4 p-6" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="07xx xxx xxxx"
                required
              />
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, area, nearest point"
              />
            </>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            minLength={isSignup ? 8 : undefined}
            required
          />

          {message && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#f5a400] px-5 py-3 font-black text-[#171511] transition hover:-translate-y-0.5 disabled:bg-[#c9bba6] disabled:text-white"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>

          <button
            type="button"
            className="rounded-full border border-[#eadfce] bg-white px-5 py-3 text-sm font-black text-[#171511] transition hover:border-[#f5a400]"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setMessage("");
            }}
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "New customer? Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#726b61]">
      {label}
      <input
        {...props}
        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
      />
    </label>
  );
}
