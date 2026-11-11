import { useCallback, useEffect, useMemo, useState } from "react";
import { translations } from "../data/food.data";
import {
  getLanguageMeta,
  getCategoryLabel,
  getVisualForCategory,
} from "../utils/foodHelpers";
import { useCustomerAuth } from "../../auth/AuthContext";
import { usePersistentUiState } from "../hooks/usePersistentUiState";
import { useFoodMenu } from "../hooks/useFoodMenu";
import { readUiStorage, removeUiStorage } from "../utils/uiStorage";
import {
  addCustomerWishlistItem,
  createProductReview,
  getCurrentCustomer,
  getCustomerWishlist,
  getHomeBanners,
  getCustomerNotifications,
  getCustomerOrders,
  markCustomerNotificationsRead,
  reorderCustomerOrder,
  removeCustomerWishlistItem,
} from "../../services/api";
import CustomerAuthModal from "../../auth/components/CustomerAuthModal";
import FoodHeader from "../components/FoodHeader";
import FoodCard from "../components/FoodCard";
import CartDrawer from "../components/CartDrawer";
import CustomerNotifications from "../components/CustomerNotifications";
import RecentOrders from "../components/RecentOrders";
import ProductDetailsModal from "../components/ProductDetailsModal";
import WishlistDrawer from "../components/WishlistDrawer";
import ProfileModal from "../components/ProfileModal";
import ReviewModal from "../components/ReviewModal";
import BannerShowcase from "../components/BannerShowcase";

const GUEST_CART_KEY = "fast-food-cart-guest";
const GUEST_WISHLIST_KEY = "fast-food-wishlist-guest";
const EMPTY_CART = [];
const EMPTY_LIST = [];

export default function FoodPage() {
  const { checkingSession, customer, logout, updateCustomer } =
    useCustomerAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const cartKey = customer?._id
    ? `fast-food-cart-${customer._id}`
    : GUEST_CART_KEY;
  const wishlistKey = customer?._id
    ? `fast-food-wishlist-${customer._id}`
    : GUEST_WISHLIST_KEY;
  const [cart, setCart] = usePersistentUiState(cartKey, EMPTY_CART);
  const [wishlistIds, setWishlistIds] = usePersistentUiState(
    wishlistKey,
    EMPTY_LIST,
  );

  const text = translations[language];
  const languageMeta = getLanguageMeta(language);

  const { menu, loading, error: menuError } = useFoodMenu(language);

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
  const wishlistItems = useMemo(
    () => menu.filter(food => wishlistIds.includes(food.id)),
    [menu, wishlistIds],
  );
  const wishlistCount = wishlistIds.length;
  const unreadNotifications = notifications.filter(item => !item.read).length;

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const showFeedback = useCallback((message, type = "success") => {
    setFeedback({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const extractWishlistIds = useCallback(
    items =>
      (Array.isArray(items) ? items : [])
        .map(item => item?._id || item?.id || item)
        .filter(Boolean),
    [],
  );

  useEffect(() => {
    let mounted = true;

    getHomeBanners()
      .then(response => {
        if (mounted) {
          setBanners(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (mounted) {
          setBanners([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!customer?._id) {
      return;
    }

    getCustomerWishlist()
      .then(response => {
        setWishlistIds(extractWishlistIds(response.data));
      })
      .catch(error => {
        if (error.status !== 401) {
          console.error(error);
        }
      });
  }, [customer?._id, extractWishlistIds, setWishlistIds]);

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

      const profileResponse = await getCurrentCustomer();
      updateCustomer(profileResponse.data);
    } catch (error) {
      if (error.status !== 401) {
        console.error(error);
      }
    }
  }, [customer?._id, updateCustomer]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchCustomerActivity, 0);

    if (!customer?._id) {
      return () => window.clearTimeout(timeoutId);
    }

    const intervalId = window.setInterval(fetchCustomerActivity, 15000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [customer?._id, fetchCustomerActivity]);

  useEffect(() => {
    if (!customer?._id) {
      return;
    }

    try {
      const guestCart = readUiStorage(GUEST_CART_KEY, []);

      if (Array.isArray(guestCart) && guestCart.length > 0) {
        setCart(current => (current.length > 0 ? current : guestCart));
        removeUiStorage(GUEST_CART_KEY);
      }
    } catch {
      removeUiStorage(GUEST_CART_KEY);
    }
  }, [customer?._id, setCart]);

  useEffect(() => {
    if (!customer?._id) {
      return;
    }

    const mergeGuestWishlist = async () => {
      try {
        const guestWishlist = readUiStorage(GUEST_WISHLIST_KEY, []);

        if (Array.isArray(guestWishlist) && guestWishlist.length > 0) {
          const serverReadyIds = guestWishlist
            .map(id => String(id))
            .filter(id => id.length === 24);

          await Promise.all(
            serverReadyIds.map(id =>
              addCustomerWishlistItem(id).catch(() => undefined),
            ),
          );
          removeUiStorage(GUEST_WISHLIST_KEY);

          const response = await getCustomerWishlist();
          setWishlistIds(extractWishlistIds(response.data));
        }
      } catch {
        removeUiStorage(GUEST_WISHLIST_KEY);
      }
    };

    mergeGuestWishlist();
  }, [customer?._id, extractWishlistIds, setWishlistIds]);

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

  const handleCustomerUpdated = useCallback(
    nextCustomer => {
      updateCustomer(nextCustomer);
    },
    [updateCustomer],
  );

  const toggleWishlist = useCallback(
    async food => {
      const isSaved = wishlistIds.includes(food.id);

      setWishlistIds(current =>
        isSaved ? current.filter(id => id !== food.id) : [...current, food.id],
      );
      showFeedback(
        isSaved ? "Removed from saved items" : "Saved for later",
        isSaved ? "neutral" : "saved",
      );

      if (!customer?._id || food.id.length !== 24) {
        return;
      }

      try {
        const response = isSaved
          ? await removeCustomerWishlistItem(food.id)
          : await addCustomerWishlistItem(food.id);

        updateCustomer(response.data);
        setWishlistIds(extractWishlistIds(response.data?.wishlist));
      } catch (error) {
        setWishlistIds(current =>
          isSaved
            ? [...current, food.id]
            : current.filter(id => id !== food.id),
        );

        if (error.status === 401) {
          openAuth("login");
        } else {
          console.error(error);
        }
        showFeedback("Could not update saved items", "error");
      }
    },
    [
      customer?._id,
      extractWishlistIds,
      openAuth,
      setWishlistIds,
      showFeedback,
      updateCustomer,
      wishlistIds,
    ],
  );

  const submitReview = useCallback(
    async payload => {
      const foodId = reviewTarget?.item?.food?._id || reviewTarget?.item?.food;

      if (!foodId || !reviewTarget?.order?._id) {
        throw new Error("Review target is missing.");
      }

      await createProductReview(foodId, {
        ...payload,
        orderId: reviewTarget.order._id,
      });
      await fetchCustomerActivity();
    },
    [fetchCustomerActivity, reviewTarget],
  );

  const addToCart = food => {
    const foodId = food.id || food._id;

    setCart(current => {
      const existing = current.find(item => item.id === foodId);

      if (existing) {
        return current.map(item =>
          item.id === foodId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + (food.quantity || 1),
                  food.stock || 99,
                ),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: foodId,
          food: foodId?.length === 24 ? foodId : undefined,
          title: food.title,
          category: food.categoryLabel || food.category?.title || food.category,
          image: food.image,
          visual: food.visual,
          price: food.price,
          quantity: food.quantity || 1,
          stock: food.stock,
        },
      ];
    });
    showFeedback(`${food.title} added to cart`, "cart");
  };

  const handleReorder = async order => {
    try {
      const response = await reorderCustomerOrder(order._id);
      const reorderItems = Array.isArray(response.data) ? response.data : [];

      reorderItems.forEach(item => {
        addToCart({
          ...item,
          id: item._id,
          categoryLabel: item.category?.title || "Product",
          quantity: item.quantity,
        });
      });
      setIsCartOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f7f5f1] text-[#24211d]"
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
        openProfile={() => setIsProfileOpen(true)}
        openWishlist={() => setIsWishlistOpen(true)}
        openNotifications={() => setIsNotificationsOpen(current => !current)}
        unreadNotifications={unreadNotifications}
        wishlistCount={wishlistCount}
      />

      <main
        id="menu"
        className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
      >
        {banners.length > 0 && <BannerShowcase banners={banners} />}

        <section>
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#d77600]">
                {text.browseByCategory}
              </p>
              <h1 className="text-4xl font-black tracking-[-0.045em] text-[#24211d] md:text-5xl">
                {text.featuredMenu}
              </h1>
            </div>
            <label className="relative block w-full lg:max-w-md">
              <span className="sr-only">{text.search}</span>
              <SearchIcon />
              <input
                type="search"
                value={query}
                placeholder={text.searchPlaceholder}
                onChange={event => setQuery(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#e4e0da] bg-white ps-11 pe-4 text-sm font-medium text-[#24211d] shadow-[0_6px_24px_rgba(39,32,24,0.04)] outline-none placeholder:text-[#9b958d] focus:border-[#ff9f1c] focus:ring-4 focus:ring-[#ff9f1c]/10"
              />
            </label>
          </div>

          {loading ? (
            <EmptyBox>{text.loadingMenu}</EmptyBox>
          ) : menuError ? (
            <EmptyBox>{menuError}</EmptyBox>
          ) : menuGroups.length === 0 ? (
            <EmptyBox>{text.noProducts}</EmptyBox>
          ) : (
            <div className="grid gap-12">
              {menuGroups.map(group => (
                <section className="grid gap-5" key={group.category}>
                  <div className="flex items-center justify-between gap-4 border-b border-[#e5e1db] pb-3">
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-[#24211d]">{group.label}</h2>
                    <strong className="rounded-lg bg-[#fff0d9] px-3 py-1.5 text-xs font-black text-[#a75c00]">
                      {group.items.length} {text.itemCount}
                    </strong>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {group.items.map(food => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        language={language}
                        text={text}
                        onAddToCart={addToCart}
                        onOpenDetails={setSelectedFood}
                        onToggleWishlist={toggleWishlist}
                        isWishlisted={wishlistIds.includes(food.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        {customer && (
          <RecentOrders
            orders={orders}
            language={language}
            text={text}
            onReviewFood={(order, item) => setReviewTarget({ order, item })}
            onReorder={handleReorder}
          />
        )}
      </main>

      <footer className="mt-12 border-t border-white/10 bg-[#24211d] text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-10 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-start lg:px-8">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff9f1c] text-sm font-black text-[#24211d]">FF</span>
            <div>
              <strong className="text-lg font-black text-white">FireFast</strong>
              <p className="mt-0.5 text-sm font-medium text-white/55">
              {text.appTagline}
              </p>
            </div>
          </div>
          <a
            href="#menu"
            className="text-sm font-bold text-white/65 transition hover:text-[#ff9f1c]"
          >
            {text.featuredMenu} &uarr;
          </a>
        </div>
      </footer>

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

      {isWishlistOpen && (
        <WishlistDrawer
          items={wishlistItems}
          language={language}
          onAddToCart={addToCart}
          onOpenDetails={setSelectedFood}
          onRemove={toggleWishlist}
          onClose={() => setIsWishlistOpen(false)}
        />
      )}

      {selectedFood && (
        <ProductDetailsModal
          food={selectedFood}
          language={language}
          text={text}
          isWishlisted={wishlistIds.includes(selectedFood.id)}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          onClose={() => setSelectedFood(null)}
        />
      )}

      {isProfileOpen && customer && (
        <ProfileModal
          customer={customer}
          onClose={() => setIsProfileOpen(false)}
          onCustomerUpdated={handleCustomerUpdated}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget.item}
          onClose={() => setReviewTarget(null)}
          onSubmit={submitReview}
        />
      )}

      {isAuthOpen && (
        <CustomerAuthModal
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {feedback && (
        <FeedbackToast
          key={feedback.id}
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}

function FeedbackToast({ message, type, onClose }) {
  const symbol = type === "error" ? "!" : type === "saved" ? "♥" : type === "neutral" ? "−" : "+";
  return (
    <div className="toast-enter fixed inset-x-4 bottom-5 z-80 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[#24211d] p-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]" role="status" aria-live="polite">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black ${type === "error" ? "bg-red-500" : "bg-[#ff9f1c] text-[#24211d]"}`}>{symbol}</span>
      <p className="min-w-0 flex-1 text-sm font-bold">{message}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss message" className="grid h-8 w-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white">&times;</button>
    </div>
  );
}

function EmptyBox({ children }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-[#dcd7d0] bg-white p-6 text-center font-bold text-[#726b61]">
      {children}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute inset-s-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a837a]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
    </svg>
  );
}
