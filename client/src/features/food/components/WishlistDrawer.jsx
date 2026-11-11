import ProductVisual from "./ProductVisual";
import { formatCurrency } from "../utils/foodHelpers";

export default function WishlistDrawer({
  items,
  language,
  onAddToCart,
  onOpenDetails,
  onRemove,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-60 bg-[#171511]/45 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close wishlist"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 grid h-full w-full max-w-lg grid-rows-[auto_1fr] overflow-hidden bg-[#fffaf2] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] p-5">
          <div>
            <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
              Wishlist
            </p>
            <h2 className="text-3xl font-black text-[#171511]">
              Saved products
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-black text-[#171511]"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid min-h-44 place-items-center rounded-3xl border border-dashed border-[#eadfce] bg-white p-6 text-center">
              <div>
                <strong className="block text-[#171511]">
                  No saved products yet
                </strong>
                <span className="mt-1 block text-sm font-medium text-[#726b61]">
                  Save favorites from the menu to find them quickly later.
                </span>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map(food => (
                <article
                  key={food.id}
                  className="grid grid-cols-[84px_1fr] gap-3 rounded-3xl border border-[#eadfce] bg-white p-3"
                >
                  <div className="h-20 overflow-hidden rounded-2xl bg-[#fff4dd]">
                    <ProductVisual food={food} size="small" />
                  </div>

                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenDetails(food)}
                      className="block max-w-full truncate text-left font-black text-[#171511]"
                    >
                      {food.title}
                    </button>
                    <p className="mt-1 text-sm font-bold text-[#726b61]">
                      {formatCurrency(food.price, language)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={food.stock === 0}
                        onClick={() => onAddToCart(food)}
                        className="rounded-full bg-[#f5a400] px-4 py-2 text-xs font-black text-[#171511] disabled:bg-[#c9bba6] disabled:text-white"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(food)}
                        className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-black text-[#726b61]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
