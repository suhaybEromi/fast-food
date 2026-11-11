import { useEffect, useRef, useState } from "react";

import { languages } from "../data/food.data";

const compactButton =
  "inline-flex h-10 items-center justify-center rounded-xl border border-[#e9e5de] bg-white px-4 text-sm font-bold text-[#24211d] transition hover:border-[#ff9f1c] hover:bg-[#fffaf2] disabled:text-[#b2a796]";

export default function FoodHeader({
  text,
  language,
  setLanguage,
  categoryTiles,
  activeCategory,
  setActiveCategory,
  cartCount,
  openCart,
  checkingSession,
  customer,
  logout,
  openAuth,
  openProfile,
  openWishlist,
  openNotifications,
  unreadNotifications,
  wishlistCount,
}) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const initial = (customer?.name || "A").charAt(0).toUpperCase();

  useEffect(() => {
    if (!isAccountOpen) return undefined;

    const closeAccount = event => {
      if (!accountRef.current?.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    const closeOnEscape = event => {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeAccount);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeAccount);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAccountOpen]);

  const runAccountAction = action => {
    setIsAccountOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-2xl">
      <div className="mx-auto grid w-full max-w-[1440px] gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <a href="#menu" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff9f1c] text-sm font-black tracking-tight text-[#17130e] shadow-[0_8px_20px_rgba(255,159,28,0.25)]">
              F<span className="-ms-0.5 text-white">F</span>
            </span>

            <div className="min-w-0">
              <strong className="block truncate text-lg font-black leading-none tracking-[-0.03em] text-[#1f1c18] sm:text-xl">
                FireFast
              </strong>
              <small className="mt-1 hidden truncate text-xs font-medium text-[#7b756d] md:block">
                {text.appTagline}
              </small>
            </div>
          </a>

          <div className="flex shrink-0 items-center gap-2">
            <label className="sr-only" htmlFor="food-language">
              {text.language}
            </label>
            <select
              id="food-language"
              value={language}
              onChange={event => setLanguage(event.target.value)}
              className="h-10 max-w-26 rounded-xl border border-[#e9e5de] bg-white px-3 text-sm font-bold text-[#24211d] outline-none focus:border-[#ff9f1c] focus:ring-4 focus:ring-[#ff9f1c]/10 sm:max-w-36"
            >
              {languages.map(item => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>

            {customer ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-expanded={isAccountOpen}
                  onClick={() => setIsAccountOpen(current => !current)}
                  className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-[#e9e5de] bg-white px-1.5 pe-3 text-sm font-bold text-[#24211d] transition hover:border-[#ff9f1c]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#24211d] text-xs text-white">
                    {initial}
                  </span>
                  <span className="hidden max-w-32 truncate sm:block">
                    {customer.name}
                  </span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#ff9f1c] px-1 text-[10px] text-[#171511] ring-2 ring-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {isAccountOpen && (
                  <section className="absolute right-0 top-12 z-40 w-[min(calc(100vw-1.5rem),310px)] overflow-hidden rounded-2xl border border-[#e9e5de] bg-white shadow-[0_20px_60px_rgba(35,29,22,0.16)]">
                    <div className="border-b border-[#eeeae4] bg-[#faf9f7] p-4">
                      <p className="truncate text-sm font-black text-[#171511]">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#726b61]">
                        {customer.loyaltyPoints || 0} loyalty points
                      </p>
                    </div>

                    <div className="grid p-2">
                      <MenuButton
                        label="Notifications"
                        badge={unreadNotifications}
                        onClick={() => runAccountAction(openNotifications)}
                      />
                      <MenuButton
                        label="Profile"
                        onClick={() => runAccountAction(openProfile)}
                      />
                      <MenuButton
                        label="Wishlist"
                        badge={wishlistCount}
                        onClick={() => runAccountAction(openWishlist)}
                      />
                      <MenuButton
                        label="Sign out"
                        danger
                        onClick={() => runAccountAction(logout)}
                      />
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  disabled={checkingSession}
                  onClick={() => openAuth("login")}
                  className={compactButton}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  disabled={checkingSession}
                  onClick={() => openAuth("signup")}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#24211d] px-4 text-sm font-bold text-white transition hover:bg-[#ff9f1c] hover:text-[#1f1c18] disabled:bg-[#c9bba6]"
                >
                  Sign up
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={openCart}
              aria-label={text.openCart}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff9f1c] px-3.5 text-sm font-black text-[#1f1c18] shadow-[0_8px_20px_rgba(255,159,28,0.2)] transition hover:bg-[#f48b00]"
            >
              <CartIcon />
              {text.cart}
              <span className="grid min-h-5 min-w-5 place-items-center rounded-md bg-white/85 px-1.5 text-[11px]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {!customer && (
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              disabled={checkingSession}
              onClick={() => openAuth("login")}
              className={compactButton}
            >
              Sign in
            </button>
            <button
              type="button"
              disabled={checkingSession}
              onClick={() => openAuth("signup")}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#24211d] px-4 text-sm font-bold text-white disabled:bg-[#c9bba6]"
            >
              Sign up
            </button>
          </div>
        )}

        <nav
          aria-label={text.browseByCategory}
          className="no-scrollbar flex gap-2 overflow-x-auto border-t border-black/5 pt-3"
        >
          {categoryTiles.map(tile => {
            const isActive = tile.title === activeCategory;

            return (
              <button
                type="button"
                key={tile.title}
                onClick={() => setActiveCategory(tile.title)}
                className={`inline-flex min-w-max items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                  isActive
                    ? "border-[#24211d] bg-[#24211d] text-white shadow-sm"
                    : "border-[#e9e5de] bg-white text-[#625c54] hover:border-[#ff9f1c] hover:text-[#24211d]"
                }`}
              >
                <span
                  className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs ${
                    isActive
                      ? "bg-[#ff9f1c] text-[#171511]"
                      : "bg-[#fff3df] text-[#a75c00]"
                  }`}
                >
                  {tile.count}
                </span>
                {tile.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6" />
      <circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function MenuButton({ label, badge = 0, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-[#24211d] hover:bg-[#fff3df]"
      }`}
    >
      <span>{label}</span>
      {badge > 0 && (
        <span className="grid min-h-6 min-w-6 place-items-center rounded-lg bg-[#ff9f1c] px-2 text-xs text-[#171511]">
          {badge}
        </span>
      )}
    </button>
  );
}
