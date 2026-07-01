import { languages, foodIcons } from "../data/food.data";

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
  openNotifications,
  unreadNotifications,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfce]/90 bg-[#fffaf2]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-330 flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a href="#menu" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#201914] text-sm font-black text-[#f5a400] shadow-lg">
              FF
            </span>

            <div>
              <strong className="block text-2xl font-black leading-none">
                FireFast
              </strong>
              <small className="mt-1 block text-sm font-bold text-[#726b61]">
                {text.appTagline}
              </small>
            </div>
          </a>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid gap-1 text-xs font-black text-[#726b61]">
              {text.language}
              <select
                value={language}
                onChange={event => setLanguage(event.target.value)}
                className="min-w-36 rounded-2xl border border-[#eadfce] bg-white px-3 py-2.5 text-sm font-bold text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
              >
                {languages.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-end gap-2">
              {customer ? (
                <>
                  <button
                    type="button"
                    onClick={openNotifications}
                    className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-black text-[#171511] transition hover:border-[#f5a400]"
                  >
                    Updates
                    {unreadNotifications > 0 && (
                      <span className="grid min-h-6 min-w-6 place-items-center rounded-full bg-[#f5a400] px-2 text-xs text-[#171511]">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  <div className="hidden max-w-44 rounded-2xl border border-[#eadfce] bg-white px-4 py-2 text-sm font-black text-[#171511] sm:block">
                    <span className="block truncate">{customer.name}</span>
                    <small className="block truncate text-xs font-bold text-[#726b61]">
                      {customer.email}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-black text-[#171511] transition hover:border-[#f5a400]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={checkingSession}
                    onClick={() => openAuth("login")}
                    className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-black text-[#171511] transition hover:border-[#f5a400] disabled:text-[#b2a796]"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    disabled={checkingSession}
                    onClick={() => openAuth("signup")}
                    className="rounded-2xl border border-[#171511] bg-[#171511] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:bg-[#c9bba6]"
                  >
                    Sign up
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={openCart}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#f5a400] px-5 py-3 text-sm font-black text-[#171511] shadow-[0_16px_32px_rgba(245,164,0,0.24)] transition hover:-translate-y-0.5"
              >
                {text.cart}
                <span className="grid min-h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-xs">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        <nav
          aria-label={text.browseByCategory}
          className="grid auto-cols-[minmax(150px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1"
        >
          {categoryTiles.map(tile => (
            <button
              type="button"
              key={tile.title}
              onClick={() => setActiveCategory(tile.title)}
              className={`flex min-w-40 items-center gap-3 rounded-3xl border p-3 text-start transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(57,42,23,0.12)] ${
                tile.title === activeCategory
                  ? "border-[#f5a400] bg-white shadow-[0_18px_44px_rgba(57,42,23,0.12)]"
                  : "border-[#eadfce] bg-white/80"
              }`}
            >
              <span className="grid h-12 w-12 min-w-12 place-items-center rounded-2xl bg-[#fff4dd] text-2xl">
                {foodIcons[tile.visual] || "🍽️"}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-[#171511]">
                  {tile.label}
                </span>
                <small className="mt-0.5 block text-xs font-bold text-[#726b61]">
                  {tile.count} {text.itemCount}
                </small>
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
