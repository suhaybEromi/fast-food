import { useEffect, useMemo, useState } from "react";
import { normalizeFood } from "../utils/foodHelpers";
import { getFoods } from "../../services/api";

export function useFoodMenu(language) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchFoods = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await getFoods();
        const apiFoods = Array.isArray(payload.data) ? payload.data : [];

        if (mounted) {
          setFoods(apiFoods);
        }
      } catch (requestError) {
        if (mounted) {
          setFoods([]);
          setError(requestError.message || "Could not load the menu.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFoods();

    return () => {
      mounted = false;
    };
  }, []);

  const menu = useMemo(
    () =>
      foods
        .filter(food => food?._id && food.status !== "inactive")
        .map((food, index) => normalizeFood(food, index, language)),
    [foods, language],
  );

  return { menu, loading, error };
}
