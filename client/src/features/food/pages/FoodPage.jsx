import { useCallback, useEffect, useMemo, useState } from "react";
import { translations } from "../data/food.data";
import {
  getLanguageMeta,
  getCategoryLabel,
  getVisualForCategory,
} from "../utils/foodHelpers";
import { useCustomerAuth } from "../../auth/AuthContext";
import { useStoredState } from "../hooks/useStoredState";
import { useFoodMenu } from "../hooks/useFoodMenu";
import {
  getCustomerNotifications,
  getCustomerOrders,
  markCustomerNotificationsRead,
} from "../../services/api";
import CustomerAuthModal from "../../auth/components/CustomerAuthModal";
import FoodHeader from "../components/FoodHeader";
import FoodCard from "../components/FoodCard";
import CartDrawer from "../components/CartDrawer";
import CustomerNotifications from "../components/CustomerNotifications";
import RecentOrders from "../components/RecentOrders";

const GUEST_CART_KEY = "fast-food-cart-guest";
const EMPTY_CART = [];

export default function FoodPage() {
  const { checkingSession, customer, logout } = useCustomerAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const cartKey = customer?._id
    ? `fast-food-cart-${customer._id}`
    : GUEST_CART_KEY;
  const [cart, setCart] = useStoredState(cartKey, EMPTY_CART);

  const text = translations[language];
  const languageMeta = getLanguageMeta(language);

  const { menu, loading, usingFallback } = useFoodMenu(language);

  const categories = useMemo(
    () => ["All", ...new Set(menu.map(food => food.category))],
    [menu],
  );

  const categoryTiles = useMemo(
    () =>
      categories.map((category, index) => ({
        title: category,
        label:
          category === "All" ? text.all : getCategoryLabel(category, language),
        visual:
          category === "All" ? "combo" : getVisualForCategory(category, index),
        count:
          category === "All"
            ? menu.length
            : menu.filter(food => food.category === category).length,
      })),
    [categories, language, menu, text.all],
  );

  const filteredMenu = useMemo(() => {
    const search = query.trim().toLowerCase();

    return menu.filter(food => {
      const matchesCategory =
        activeCategory === "All" || food.category === activeCategory;

      const matchesSearch =
        !search ||
        food.title.toLowerCase().includes(search) ||
        food.description.toLowerCase().includes(search) ||
        food.categoryLabel.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menu, query]);

  const menuGroups = useMemo(() => {
    const groups = new Map();

    filteredMenu.forEach(food => {
      if (!groups.has(food.category)) groups.set(food.category, []);
      groups.get(food.category).push(food);
    });

    return Array.from(groups, ([category, items]) => ({
      category,
      label: getCategoryLabel(category, language),
      items,
    }));
  }, [filteredMenu, language]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(item => !item.read).length;

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const fetchCustomerActivity = useCallback(async () => {
    if (!customer?._id) {
      setOrders([]);
      setNotifications([]);
      return;
    }

    try {
      const [ordersResponse, notificationsResponse] = await Promise.all([
        getCustomerOrders(),
        getCustomerNotifications(),
      ]);

      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
      setNotifications(
        Array.isArray(notificationsResponse.data)
          ? notificationsResponse.data
          : [],
      );
    } catch (error) {
      if (error.status !== 401) {
        console.error(error);
      }
    }
  }, [customer?._id]);

  useEffect(() => {
    fetchCustomerActivity();

    if (!customer?._id) {
      return undefined;
    }

    const intervalId = window.setInterval(fetchCustomerActivity, 15000);

    return () => window.clearInterval(intervalId);
  }, [customer?._id, fetchCustomerActivity]);

  useEffect(() => {
    if (!customer?._id) {
      return;
    }

    try {
      const storedGuestCart = localStorage.getItem(GUEST_CART_KEY);
      const guestCart = storedGuestCart ? JSON.parse(storedGuestCart) : [];

      if (Array.isArray(guestCart) && guestCart.length > 0) {
        setCart(current => (current.length > 0 ? current : guestCart));
        localStorage.removeItem(GUEST_CART_KEY);
      }
    } catch {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [customer?._id, setCart]);

  const handleLogout = useCallback(async () => {
    await logout();
    setOrders([]);
    setNotifications([]);
    setIsNotificationsOpen(false);
  }, [logout]);

  const handleOrderCreated = useCallback(
    order => {
      setOrders(current => [
        order,
        ...current.filter(item => item._id !== order._id),
      ]);
      fetchCustomerActivity();
    },
    [fetchCustomerActivity],
  );

  const markNotificationsRead = useCallback(async () => {
    try {
      await markCustomerNotificationsRead();
      setNotifications(current =>
        current.map(item => ({ ...item, read: true })),
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  const addToCart = food => {
    setCart(current => {
      const existing = current.find(item => item.id === food.id);

      if (existing) {
        return current.map(item =>
          item.id === food.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, food.stock || 99),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: food.id,
          food: food.id.length === 24 ? food.id : undefined,
          title: food.title,
          category: food.categoryLabel,
          image: food.image,
          visual: food.visual,
          price: food.price,
          quantity: 1,
          stock: food.stock,
        },
      ];
    });
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,164,0,0.18),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8eddc_100%)] text-[#171511]"
      dir={languageMeta.dir}
      lang={language}
    >
      <FoodHeader
        text={text}
        language={language}
        setLanguage={setLanguage}
        categoryTiles={categoryTiles}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
        checkingSession={checkingSession}
        customer={customer}
        logout={handleLogout}
        openAuth={openAuth}
        openNotifications={() => setIsNotificationsOpen(current => !current)}
        unreadNotifications={unreadNotifications}
      />

      <main id="menu" className="mx-auto grid w-full max-w-330 gap-6 px-4 py-6">
        <section className="rounded-4xl border border-[#eadfce] bg-white/85 p-5 shadow-[0_18px_48px_rgba(57,42,23,0.11)] sm:p-7">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
                {text.browseByCategory}
              </p>
              <h1 className="text-4xl font-black text-[#171511] md:text-5xl">
                {text.featuredMenu}
              </h1>
            </div>

            {usingFallback && (
              <span className="w-fit rounded-full bg-[#fff4d8] px-3 py-2 text-xs font-black text-[#c97a00]">
                {text.sampleMenu}
              </span>
            )}
          </div>

          <label className="mb-7 grid gap-2 text-sm font-black text-[#726b61]">
            {text.search}
            <input
              type="search"
              value={query}
              placeholder={text.searchPlaceholder}
              onChange={event => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-base font-medium outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
            />
          </label>

          {loading ? (
            <EmptyBox>{text.loadingMenu}</EmptyBox>
          ) : menuGroups.length === 0 ? (
            <EmptyBox>{text.noProducts}</EmptyBox>
          ) : (
            <div className="grid gap-10">
              {menuGroups.map(group => (
                <section className="grid gap-4" key={group.category}>
                  <div className="flex items-center justify-between border-t border-[#eadfce] pt-6 first:border-t-0 first:pt-0">
                    <h2 className="text-2xl font-black">{group.label}</h2>
                    <strong className="rounded-full bg-[#fff4d8] px-3 py-2 text-xs font-black text-[#c97a00]">
                      {group.items.length} {text.itemCount}
                    </strong>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.items.map(food => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        language={language}
                        text={text}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        <RecentOrders orders={orders} language={language} text={text} />
      </main>

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          setCart={setCart}
          customer={customer}
          language={language}
          languageMeta={languageMeta}
          text={text}
          onOrderCreated={handleOrderCreated}
          openAuth={openAuth}
          closeCart={() => setIsCartOpen(false)}
        />
      )}

      {isNotificationsOpen && customer && (
        <CustomerNotifications
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkRead={markNotificationsRead}
        />
      )}

      {isAuthOpen && (
        <CustomerAuthModal
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </div>
  );
}

function EmptyBox({ children }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-[#eadfce] bg-[#fff8ec]/80 p-6 text-center font-bold text-[#726b61]">
      {children}
    </div>
  );
}
