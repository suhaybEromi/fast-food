import { useState } from "react";

export default function ReviewModal({ item, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (error) {
      setMessage(error.message || "Could not save review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-75 grid place-items-center bg-[#171511]/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close review"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-3xl border border-[#eadfce] bg-[#fffaf2] p-5 shadow-2xl"
      >
        <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
          Product rating
        </p>
        <h2 className="text-2xl font-black text-[#171511]">{item.title}</h2>

        <label className="mt-5 grid gap-2 text-sm font-black text-[#726b61]">
          Rating
          <select
            value={rating}
            onChange={event => setRating(Number(event.target.value))}
            className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
          >
            {[5, 4, 3, 2, 1].map(value => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 grid gap-2 text-sm font-black text-[#726b61]">
          Comment
          <textarea
            value={comment}
            onChange={event => setComment(event.target.value)}
            placeholder="What did you think?"
            className="min-h-28 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
          />
        </label>

        {message && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">
            {message}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#eadfce] bg-white px-5 py-3 font-black text-[#171511]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#f5a400] px-5 py-3 font-black text-[#171511] disabled:bg-[#c9bba6] disabled:text-white"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
