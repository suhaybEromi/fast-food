import {
  languages,
  categoryLabels,
} from "../data/food.data";
import { IMAGE_URL } from "../../services/api";

export function getLanguageMeta(language) {
  return languages.find(item => item.code === language) || languages[0];
}

export function formatCurrency(value, language) {
  const meta = getLanguageMeta(language);
  const amount = Number(value || 0).toLocaleString(meta.locale);
  const suffix = language === "en" ? "IQD" : "د.ع";

  return `${amount} ${suffix}`;
}

export function getCategoryLabel(category, language) {
  return categoryLabels[language]?.[category] || category;
}

export function getVisualForCategory(category, index = 0) {
  const key = category.toLowerCase();

  if (key.includes("burger")) return "burger";
  if (key.includes("wrap") || key.includes("sandwich")) return "wrap";
  if (key.includes("side") || key.includes("fries")) return "fries";
  if (key.includes("chicken") || key.includes("wing")) return "wings";
  if (key.includes("combo") || key.includes("meal")) return "combo";
  if (key.includes("drink") || key.includes("tea")) return "drink";

  return ["burger", "wrap", "fries", "wings", "bowl", "combo"][index % 6];
}

export function normalizeFood(food, index, language) {
  const category =
    typeof food.category === "string"
      ? food.category
      : food.category?.title || "Featured";

  const image =
    food.image && food.image.startsWith("http")
      ? food.image
      : food.image
        ? `${IMAGE_URL}${food.image}`
        : "";

  const id = food._id;

  return {
    id,
    title: food.title,
    description: food.description || "",
    category,
    categoryLabel: getCategoryLabel(category, language),
    price: Number(food.price) || 0,
    stock: Number(food.stock) || 0,
    soldCount: Number(food.soldCount) || 0,
    status: food.status || "active",
    image,
    rating: Number(food.ratingAverage || food.rating) || 0,
    ratingAverage: Number(food.ratingAverage || food.rating) || 0,
    ratingCount: Number(food.ratingCount) || 0,
    prepTime: food.prepTime || "",
    tag: food.tag || "",
    visual: food.visual || getVisualForCategory(category, index),
  };
}
