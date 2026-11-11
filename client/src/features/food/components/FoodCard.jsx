import ProductVisual from "./ProductVisual";
import { formatCurrency } from "../utils/foodHelpers";

export default function FoodCard({
  food,
  language,
  onAddToCart,
  onOpenDetails,
  onToggleWishlist,
  isWishlisted,
  text,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e9e5de] bg-white shadow-[0_8px_28px_rgba(39,32,24,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#ffd79e] hover:shadow-[0_18px_44px_rgba(39,32,24,0.11)]">
      <button type="button" onClick={() => onOpenDetails(food)} className="relative block h-48 w-full overflow-hidden bg-[#f7f4ef] text-start sm:h-52">
        <ProductVisual food={food} />
        <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        {food.tag && (
          <span className="absolute inset-s-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#287a4f] shadow-sm backdrop-blur">
            {food.tag}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#8a837a]">
          <span className="uppercase tracking-[0.08em]">{food.categoryLabel}</span>
          {food.prepTime && <span className="rounded-lg bg-[#f5f3ef] px-2 py-1">{food.prepTime}</span>}
        </div>

        <div className="flex-1">
          <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-[-0.02em] text-[#24211d]">
            {food.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#746e66]">
            {food.description}
          </p>
          <button
            type="button"
            onClick={() => onOpenDetails(food)}
            className="mt-2 text-sm font-bold text-[#b96500] transition hover:text-[#24211d]"
          >
            Details <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0ede8] pt-4">
          <strong className="text-lg font-black tracking-[-0.02em] text-[#24211d]">{formatCurrency(food.price, language)}</strong>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label={isWishlisted ? "Remove from saved items" : "Save item"}
              onClick={() => onToggleWishlist(food)}
              className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
                isWishlisted
                  ? "border-[#ff9f1c] bg-[#fff3df] text-[#d77600]"
                  : "border-[#e9e5de] bg-white text-[#777068] hover:border-[#ff9f1c] hover:text-[#d77600]"
              }`}
            >
              <HeartIcon filled={isWishlisted} />
            </button>

            <button
              type="button"
              disabled={food.stock === 0}
              onClick={() => onAddToCart(food)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#24211d] px-4 text-sm font-black text-white transition hover:bg-[#ff9f1c] hover:text-[#171511] disabled:bg-[#c9bba6]"
            >
              {food.stock === 0 ? text.soldOut : text.orderNow}
              {food.stock !== 0 && <PlusIcon />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeartIcon({ filled }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

function PlusIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>;
}
