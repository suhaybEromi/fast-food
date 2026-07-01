import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  refreshCustomerToken,
  signupCustomer,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCurrentCustomer()
      .then(response => {
        if (mounted) {
          setCustomer(response.data);
        }
      })
      .catch(async () => {
        try {
          const response = await refreshCustomerToken();

          if (mounted) {
            setCustomer(response.data);
          }
        } catch {
          if (mounted) {
            setCustomer(null);
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

  const signin = useCallback(async payload => {
    const response = await loginCustomer(payload);
    setCustomer(response.data);
    return response;
  }, []);

  const signup = useCallback(async payload => {
    const response = await signupCustomer(payload);
    setCustomer(response.data);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } catch {
      // Local state still clears if the API is temporarily unavailable.
    } finally {
      setCustomer(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      checkingSession,
      customer,
      isAuthenticated: Boolean(customer),
      logout,
      signin,
      signup,
    }),
    [checkingSession, customer, logout, signin, signup],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useCustomerAuth must be used inside AuthProvider");
  }

  return context;
};
