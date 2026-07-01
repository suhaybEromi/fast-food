import { foodIcons } from "../data/food.data";

export default function ProductVisual({ food, size = "large" }) {
  if (food?.image) {
    return (
      <img
        src={food.image}
        alt={food.title}
        className="h-full w-full object-cover"
      />
    );
  }

  const iconSize = size === "small" ? "text-3xl" : "text-6xl";

  return (
    <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(245,164,0,0.24),transparent_9rem)]">
      <span className={iconSize}>{foodIcons[food?.visual] || "🍽️"}</span>
    </div>
  );
}
