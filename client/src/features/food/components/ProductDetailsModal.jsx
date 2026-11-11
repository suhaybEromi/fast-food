import { useEffect, useMemo, useState } from "react";

import { getFoodDetails, IMAGE_URL } from "../../services/api";
import ProductVisual from "./ProductVisual";
import { formatCurrency } from "../utils/foodHelpers";

export default function ProductDetailsModal({
  food,
  language,
  text,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onClose,
}) {
  const [details, setDetails] = useState(food);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getFoodDetails(food.id)
      .then(response => {
        if (mounted) {
          setDetails({ ...food, ...response.data });
        }
      })
      .catch(() => {
        if (mounted) {
          setDetails(food);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [food]);

  const reviews = Array.isArray(details.reviews) ? details.reviews : [];
  const image =
    details.image && details.image.startsWith("http")
      ? details.image
      : details.image
        ? `${IMAGE_URL}${details.image}`
        : "";
  const visualDetails = { ...details, image };
  const rating = useMemo(
    () =>
      Number(details.ratingAverage || details.rating || 0).toLocaleString(
        "en",
        {
          maximumFractionDigits: 1,
        },
      ),
    [details.rating, details.ratingAverage],
  );

  return (
    <div className="fixed inset-0 z-65 grid place-items-center bg-[#171511]/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label={text.close}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <section className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-[#eadfce] bg-[#fffaf2] shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-h-72 bg-[#fff4dd]">
          <ProductVisual food={visualDetails} />
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-[#c97a00]">
                {details.categoryLabel || details.category?.title || "Product"}
              </p>
              <h2 className="text-3xl font-black text-[#171511]">
                {details.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-black text-[#171511]"
            >
              {text.close}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black">
            <span className="rounded-full bg-[#287a4f]/10 px-3 py-1 text-[#287a4f]">
              {rating} stars
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[#726b61]">
              {details.ratingCount || reviews.length || 0} reviews
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[#726b61]">
              {details.stock > 0 ? `${details.stock} in stock` : text.soldOut}
            </span>
            {loading && (
              <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-[#9b6500]">
                Loading
              </span>
            )}
          </div>

          <p className="mt-5 leading-7 text-[#5d554b]">{details.description}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <strong className="text-2xl text-[#171511]">
              {formatCurrency(details.price, language)}
            </strong>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => onToggleWishlist(visualDetails)}
                className="rounded-full border border-[#eadfce] bg-white px-5 py-3 text-sm font-black text-[#171511] transition hover:border-[#f5a400]"
              >
                {isWishlisted ? "Saved" : "Wishlist"}
              </button>
              <button
                type="button"
                disabled={details.stock === 0}
                onClick={() => onAddToCart(visualDetails)}
                className="rounded-full bg-[#f5a400] px-5 py-3 text-sm font-black text-[#171511] transition hover:-translate-y-0.5 disabled:bg-[#c9bba6] disabled:text-white"
              >
                {details.stock === 0 ? text.soldOut : text.orderNow}
              </button>
            </div>
          </div>

          <section className="mt-7 border-t border-[#eadfce] pt-5">
            <h3 className="text-lg font-black text-[#171511]">
              Reviews and ratings
            </h3>

            {reviews.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-[#eadfce] bg-white p-4 text-sm font-bold text-[#726b61]">
                No customer reviews yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {reviews.map(review => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-[#eadfce] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[#171511]">
                        {review.customer?.name || "Customer"}
                      </strong>
                      <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-black text-[#9b6500]">
                        {review.rating}/5
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm leading-6 text-[#726b61]">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
