import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { useAuth } from "../../auth/AuthContext";
import {
  confirmAdminTwoFactor,
  disableAdminTwoFactor,
  setupAdminTwoFactor,
} from "../../services/auth.service";

export default function SecurityPage() {
  const { admin, authenticate } = useAuth();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const startSetup = async () => {
    setMessage("");
    const response = await setupAdminTwoFactor();
    setSetup(response.data);
  };

  const confirmSetup = async event => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await confirmAdminTwoFactor(code);
      authenticate(response);
      setSetup(null);
      setCode("");
      setMessage("Two-factor authentication is enabled.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid code.");
    }
  };

  const disableTwoFactor = async event => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await disableAdminTwoFactor(code);
      authenticate(response);
      setCode("");
      setMessage("Two-factor authentication is disabled.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid code.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Security</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Admin security
        </h1>
        <p className="mt-2 text-slate-500">
          Protect admin accounts with authenticator-app two-factor security.
        </p>
      </div>

      <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Two-factor authentication
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current status:{" "}
              <b>{admin?.twoFactorEnabled ? "Enabled" : "Disabled"}</b>
            </p>
          </div>
        </div>

        {!admin?.twoFactorEnabled && !setup && (
          <button
            type="button"
            onClick={startSetup}
            className="mt-5 rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white"
          >
            Start 2FA setup
          </button>
        )}

        {setup && (
          <form onSubmit={confirmSetup} className="mt-5 grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-600">
                Add this secret to Google Authenticator, 1Password, Authy, or any
                TOTP app.
              </p>
              <code className="mt-3 block break-all rounded-lg bg-white p-3 text-sm font-black text-slate-950">
                {setup.secret}
              </code>
              <p className="mt-3 break-all text-xs font-bold text-slate-500">
                {setup.otpauthUrl}
              </p>
            </div>
            <CodeInput code={code} setCode={setCode} />
            <button className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white">
              Confirm and enable
            </button>
          </form>
        )}

        {admin?.twoFactorEnabled && (
          <form onSubmit={disableTwoFactor} className="mt-5 grid gap-4">
            <CodeInput code={code} setCode={setCode} />
            <button className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700">
              Disable 2FA
            </button>
          </form>
        )}

        {message && (
          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            {message}
          </p>
        )}
      </section>

      <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
            <KeyRound size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Security hardening active
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Rate limiting, CSRF protection, secure headers, request logs, and
              audit logs are enabled on the API.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CodeInput({ code, setCode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      6-digit code
      <input
        value={code}
        onChange={event => setCode(event.target.value)}
        inputMode="numeric"
        maxLength="6"
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
        required
      />
    </label>
  );
}
