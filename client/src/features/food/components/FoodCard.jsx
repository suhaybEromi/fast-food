import ProductVisual from "./ProductVisual";
import { formatCurrency } from "../utils/foodHelpers";

export default function FoodCard({ food, language, onAddToCart, text }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_16px_42px_rgba(57,42,23,0.08)] transition hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-[#fff4dd]">
        <ProductVisual food={food} />
        <span className="absolute inset-s-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black text-[#287a4f] shadow-sm">
          {food.tag}
        </span>
      </div>

      <div className="grid gap-3 p-4">
        <div className="flex items-center justify-between text-xs font-bold text-[#726b61]">
          <span>{food.categoryLabel}</span>
          <span>{food.prepTime}</span>
        </div>

        <div>
          <h3 className="line-clamp-2 min-h-11 text-lg font-black">
            {food.title}
          </h3>
          <p className="mt-2 line-clamp-3 min-h-[4.1rem] text-sm leading-6 text-[#726b61]">
            {food.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <strong>{formatCurrency(food.price, language)}</strong>

          <button
            type="button"
            disabled={food.stock === 0}
            onClick={() => onAddToCart(food)}
            className="rounded-full bg-[#201914] px-4 py-2 text-sm font-black text-white hover:bg-[#f5a400] hover:text-[#171511] disabled:bg-[#c9bba6]"
          >
            {food.stock === 0 ? text.soldOut : text.orderNow}
          </button>
        </div>
      </div>
    </article>
  );
}
