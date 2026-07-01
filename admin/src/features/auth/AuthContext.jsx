import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  getCurrentAdmin,
  logoutAdmin,
  refreshAdminToken,
} from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // The local auth state should still clear if the server is unavailable.
    } finally {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentAdmin()
      .then(response => {
        if (mounted) {
          setAdmin(response.data);
        }
      })
      .catch(async () => {
        try {
          const response = await refreshAdminToken();

          if (mounted) {
            setAdmin(response.data);
          }
        } catch {
          if (mounted) {
            setAdmin(null);
          }
        }
      })
      .finally(() => {
        if (mounted) {
          setCheckingSession(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const authenticate = useCallback(response => {
    setAdmin(response.data);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      authenticate,
      checkingSession,
      isAuthenticated: Boolean(admin),
      logout,
    }),
    [admin, authenticate, checkingSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const RequireAdmin = () => {
  const { checkingSession, isAuthenticated } = useAuth();
  const location = useLocation();

  if (checkingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7f6] p-6 text-slate-600">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Checking admin access...
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};
