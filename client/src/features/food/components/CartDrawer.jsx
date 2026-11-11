import { useEffect, useMemo, useState } from "react";
import ProductVisual from "./ProductVisual";
import { formatCurrency } from "../utils/foodHelpers";
import {
  createCustomerOrder,
  getDeliveryZones,
  validateCoupon,
} from "../../services/api";

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) &&
  Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

export default function CartDrawer({
  cart,
  setCart,
  customer,
  language,
  languageMeta,
  text,
  onOrderCreated,
  openAuth,
  closeCart,
}) {
  const defaultAddress = customer?.addresses?.find(item => item.isDefault);
  const [fulfillment, setFulfillment] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderMessage, setOrderMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?._id || "",
  );
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(
    defaultAddress?.location || null,
  );
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(0);

  const [checkout, setCheckout] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: defaultAddress?.address || customer?.address || "",
    notes: "",
  });

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      getDeliveryZones()
        .then(response => {
          const zones = Array.isArray(response.data) ? response.data : [];
          setDeliveryZones(zones);

          if (zones.length > 0 && !selectedZoneId) {
            setSelectedZoneId(zones[0]._id);
          }
        })
        .catch(() => setDeliveryZones([]));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedZoneId]);

  const selectedZone = deliveryZones.find(zone => zone._id === selectedZoneId);
  const deliveryFee =
    fulfillment === "pickup" || subtotal === 0
      ? 0
      : (selectedZone?.deliveryFee ?? (subtotal >= 25000 ? 0 : 2000));

  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.03) : 0;
  const discountAmount = coupon
    ? Math.min(subtotal, Math.round((subtotal * coupon.percentage) / 100))
    : 0;
  const maxRedeemablePoints = Math.min(
    customer?.loyaltyPoints || 0,
    Math.floor(subtotal / 50),
  );
  const cleanRedeemPoints = Math.min(
    Math.max(Number(redeemPoints) || 0, 0),
    maxRedeemablePoints,
  );
  const loyaltyDiscount = cleanRedeemPoints * 50;
  const total = Math.max(
    0,
    subtotal + deliveryFee + serviceFee - discountAmount - loyaltyDiscount,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const drawerSide = languageMeta.dir === "rtl" ? "left-0" : "right-0";
  const savedAddresses = customer?.addresses || [];

  const updateQuantity = (id, nextQuantity) => {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(1, Math.min(nextQuantity, item.stock || 99)),
              }
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  const removeFromCart = id => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const handleCheckoutChange = event => {
    setCheckout(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAddressSelect = event => {
    const addressId = event.target.value;
    const address = savedAddresses.find(item => item._id === addressId);

    setSelectedAddressId(addressId);

    if (address) {
      setCheckout(current => ({
        ...current,
        name: address.recipientName || current.name,
        phone: address.phone || current.phone,
        address: address.address || current.address,
      }));
      setDeliveryLocation(address.location || null);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setOrderMessage("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setDeliveryLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Current location",
        });
        setOrderMessage("Location added to delivery details.");
      },
      () => setOrderMessage("Could not read your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();

    if (!code) {
      setCoupon(null);
      return;
    }

    try {
      const response = await validateCoupon(code);
      setCoupon(response.data);
      setOrderMessage(`${response.data.code} applied.`);
    } catch (error) {
      setCoupon(null);
      setOrderMessage(error.message || "Coupon is invalid.");
    }
  };

  const handleSubmitOrder = async event => {
    event.preventDefault();

    if (cart.length === 0) {
      setOrderMessage(text.addFirstItem);
      return;
    }

    if (!customer) {
      setOrderMessage("Please sign in before placing your order.");
      openAuth("login");
      return;
    }

    setIsSubmitting(true);
    setOrderMessage("");

    const payload = {
      customer: {
        name: checkout.name,
        phone: checkout.phone,
        address: fulfillment === "pickup" ? "Pickup counter" : checkout.address,
      },
      items: cart.map(item => ({
        food: item.food,
        quantity: item.quantity,
      })),
      orderType: fulfillment,
      paymentMethod,
      deliveryZone: selectedZoneId || undefined,
      deliveryLocation,
      redeemPoints: cleanRedeemPoints,
      couponCode: coupon?.code || couponInput,
      notes: checkout.notes,
    };

    try {
      const result = await createCustomerOrder(payload);
      const savedOrder = result.data;

      onOrderCreated(savedOrder);
      setOrderMessage(text.orderQueued(savedOrder.orderNumber));
      setCart([]);
      setCheckout({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        notes: "",
      });
      setCoupon(null);
      setCouponInput("");
      setRedeemPoints(0);
    } catch (error) {
      setOrderMessage(error.message || "We could not place the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171511]/45 backdrop-blur-sm">
      <button
        type="button"
        aria-label={text.close}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={closeCart}
      />

      <aside
        className={`absolute top-0 ${drawerSide} grid h-full w-full max-w-xl grid-rows-[auto_1fr] overflow-hidden bg-[#fffaf2] shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] p-5">
          <div>
            <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
              {text.checkout}
            </p>
            <h2 className="text-3xl font-black text-[#171511]">
              {text.cart} ({cartCount})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-black text-[#171511] transition hover:border-[#f5a400]"
          >
            {text.close}
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`rounded-full border px-4 py-2 text-sm font-black ${
                fulfillment === "delivery"
                  ? "border-[#f5a400] bg-[#f5a400] text-[#171511]"
                  : "border-[#eadfce] bg-white text-[#726b61]"
              }`}
            >
              {text.delivery}
            </button>

            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`rounded-full border px-4 py-2 text-sm font-black ${
                fulfillment === "pickup"
                  ? "border-[#f5a400] bg-[#f5a400] text-[#171511]"
                  : "border-[#eadfce] bg-white text-[#726b61]"
              }`}
            >
              {text.pickup}
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="grid min-h-44 place-items-center rounded-3xl border border-dashed border-[#eadfce] bg-white p-6 text-center">
              <div>
                <strong className="block text-[#171511]">
                  {text.cartEmpty}
                </strong>
                <span className="mt-1 block text-sm font-medium text-[#726b61]">
                  {text.cartEmptyHint}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {cart.map(item => (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-3xl border border-[#eadfce] bg-white p-3"
                >
                  <div className="h-20 w-20 min-w-20 overflow-hidden rounded-2xl bg-[#fff4dd]">
                    <ProductVisual food={item} size="small" />
                  </div>

                  <div className="grid flex-1 gap-2">
                    <div>
                      <span className="text-xs font-black uppercase text-[#c97a00]">
                        {text.product}
                      </span>
                      <strong className="block text-[#171511]">
                        {item.title}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="block font-black text-[#726b61]">
                          {text.price}
                        </span>
                        <b>{formatCurrency(item.price, language)}</b>
                      </div>

                      <div>
                        <span className="block font-black text-[#726b61]">
                          {text.total}
                        </span>
                        <b className="text-[#287a4f]">
                          {formatCurrency(item.price * item.quantity, language)}
                        </b>
                      </div>
                    </div>

                    <div className="grid w-28 grid-cols-[32px_1fr_32px] overflow-hidden rounded-full border border-[#eadfce]">
                      <button
                        type="button"
                        className="bg-white font-black"
                        onClick={() =>
                          item.quantity === 1
                            ? removeFromCart(item.id)
                            : updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span className="grid place-items-center border-x border-[#eadfce] font-black">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        className="bg-white font-black"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 rounded-3xl bg-white p-4">
            <PriceRow
              label={text.subtotal}
              value={subtotal}
              language={language}
            />
            <PriceRow
              label={text.deliveryFee}
              value={deliveryFee}
              language={language}
            />
            <PriceRow
              label={text.service}
              value={serviceFee}
              language={language}
            />
            <PriceRow
              label="Discount"
              value={-discountAmount}
              language={language}
            />
            <PriceRow
              label="Loyalty"
              value={-loyaltyDiscount}
              language={language}
            />

            <div className="flex items-center justify-between gap-3 border-t border-[#eadfce] pt-3">
              <span className="font-black text-[#171511]">
                {text.totalPrice}
              </span>
              <strong className="text-xl text-[#287a4f]">
                {formatCurrency(total, language)}
              </strong>
            </div>
          </div>

          {!customer ? (
            <div className="mt-5 grid gap-3 rounded-3xl border border-[#eadfce] bg-white p-4">
              <div>
                <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
                  Customer account
                </p>
                <h3 className="text-2xl font-black text-[#171511]">
                  Sign in to checkout
                </h3>
                <p className="mt-2 text-sm font-bold text-[#726b61]">
                  Your cart and order status will stay connected to your
                  account.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="rounded-full bg-[#f5a400] px-5 py-3 font-black text-[#171511] transition hover:-translate-y-0.5"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="rounded-full border border-[#171511] bg-white px-5 py-3 font-black text-[#171511] transition hover:border-[#f5a400]"
                >
                  Create account
                </button>
              </div>

              {orderMessage && (
                <p className="rounded-2xl bg-[#fff4d8] px-4 py-3 text-sm font-black text-[#9b6500]">
                  {orderMessage}
                </p>
              )}
            </div>
          ) : (
            <form
              className="mt-5 grid gap-3 rounded-3xl border border-[#eadfce] bg-white p-4"
              onSubmit={handleSubmitOrder}
            >
              <div>
                <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
                  {text.payment}
                </p>
                <h3 className="text-2xl font-black text-[#171511]">
                  {text.checkout}
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={text.name}
                  name="name"
                  value={checkout.name}
                  onChange={handleCheckoutChange}
                  placeholder={text.namePlaceholder}
                  required
                />

                <Input
                  label={text.phone}
                  name="phone"
                  value={checkout.phone}
                  onChange={handleCheckoutChange}
                  placeholder={text.phonePlaceholder}
                  required
                />
              </div>

              {fulfillment === "delivery" && (
                <div className="grid gap-3">
                  {savedAddresses.length > 0 && (
                    <label className="grid gap-2 text-sm font-black text-[#726b61]">
                      Delivery address
                      <select
                        value={selectedAddressId}
                        onChange={handleAddressSelect}
                        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
                      >
                        <option value="">Custom address</option>
                        {savedAddresses.map(address => (
                          <option key={address._id} value={address._id}>
                            {address.label || "Address"} - {address.address}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <Input
                    label={text.address}
                    name="address"
                    value={checkout.address}
                    onChange={handleCheckoutChange}
                    placeholder={text.addressPlaceholder}
                    required
                  />

                  {deliveryZones.length > 0 && (
                    <label className="grid gap-2 text-sm font-black text-[#726b61]">
                      Delivery zone
                      <select
                        value={selectedZoneId}
                        onChange={event =>
                          setSelectedZoneId(event.target.value)
                        }
                        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
                      >
                        {deliveryZones.map(zone => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name} -{" "}
                            {formatCurrency(zone.deliveryFee, language)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf2] p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-[#171511]">
                          Delivery location
                        </p>
                        <p className="text-xs font-bold text-[#726b61]">
                          {hasLocation(deliveryLocation)
                            ? "Map location selected"
                            : "No map location selected"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {hasLocation(deliveryLocation) && (
                          <a
                            href={getMapUrl(deliveryLocation)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-black text-[#171511] transition hover:border-[#f5a400]"
                          >
                            View map
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="rounded-full bg-[#171511] px-4 py-2 text-xs font-black text-white transition hover:bg-[#f5a400] hover:text-[#171511]"
                        >
                          {hasLocation(deliveryLocation)
                            ? "Update location"
                            : "Use current location"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <label className="grid gap-2 text-sm font-black text-[#726b61]">
                {text.notes}
                <textarea
                  name="notes"
                  value={checkout.notes}
                  onChange={handleCheckoutChange}
                  placeholder={text.notesPlaceholder}
                  className="min-h-24 resize-y rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
                />
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["cash", "card", "wallet"].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-full border px-3 py-2 text-sm font-black ${
                      paymentMethod === method
                        ? "border-[#f5a400] bg-[#f5a400] text-[#171511]"
                        : "border-[#eadfce] bg-white text-[#726b61]"
                    }`}
                  >
                    {text[method]}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  label="Coupon"
                  name="coupon"
                  value={couponInput}
                  onChange={event => setCouponInput(event.target.value)}
                  placeholder="SAVE10"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="self-end rounded-full border border-[#eadfce] bg-white px-5 py-3 font-black text-[#171511] transition hover:border-[#f5a400]"
                >
                  Apply
                </button>
              </div>

              <label className="grid gap-2 text-sm font-black text-[#726b61]">
                Loyalty points
                <div className="grid gap-2 rounded-2xl border border-[#eadfce] bg-[#fffaf2] p-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="number"
                    min="0"
                    max={maxRedeemablePoints}
                    value={redeemPoints}
                    onChange={event => setRedeemPoints(event.target.value)}
                    className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
                  />
                  <span className="self-center text-xs font-black text-[#726b61]">
                    {customer.loyaltyPoints || 0} available
                  </span>
                </div>
              </label>

              <button
                className="rounded-full bg-[#f5a400] px-5 py-3 font-black text-[#171511] transition hover:-translate-y-0.5 disabled:bg-[#c9bba6] disabled:text-white"
                type="submit"
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? text.placingOrder : text.placeOrder}
              </button>

              {orderMessage && (
                <p className="rounded-2xl bg-[#287a4f]/10 px-4 py-3 text-sm font-black text-[#287a4f]">
                  {orderMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

function PriceRow({ label, value, language }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold text-[#726b61]">{label}</span>
      <strong>{formatCurrency(value, language)}</strong>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#726b61]">
      {label}
      <input
        {...props}
        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 font-medium text-[#171511] outline-none focus:border-[#f5a400] focus:ring-4 focus:ring-[#f5a400]/15"
      />
    </label>
  );
}
