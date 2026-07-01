import { useEffect, useMemo, useState } from "react";
import { fallbackFoods } from "../data/food.data";
import { normalizeFood } from "../utils/foodHelpers";

export function useFoodMenu(language) {
  const [foods, setFoods] = useState(fallbackFoods);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchFoods = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/food`);

        if (!response.ok) throw new Error("Menu API is not available");

        const payload = await response.json();
        const apiFoods = Array.isArray(payload.data) ? payload.data : [];

        if (mounted && apiFoods.length > 0) {
          setFoods(apiFoods);
          setUsingFallback(false);
        } else {
          setFoods(fallbackFoods);
          setUsingFallback(true);
        }
      } catch {
        setFoods(fallbackFoods);
        setUsingFallback(true);
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
        .filter(food => food.status !== "inactive")
        .map((food, index) => normalizeFood(food, index, language)),
    [foods, language],
  );

  return { menu, loading, usingFallback };
}
