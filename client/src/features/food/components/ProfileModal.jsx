import { useState } from "react";

import {
  addCustomerAddress,
  deleteCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from "../../services/api";

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) &&
  Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  address: "",
  location: null,
  isDefault: false,
};

export default function ProfileModal({ customer, onClose, onCustomerUpdated }) {
  const [profile, setProfile] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateProfileField = event => {
    setProfile(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updateAddressField = event => {
    const { name, value, type, checked } = event.target;

    setAddressForm(current => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setAddressForm(current => ({
          ...current,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: "Current location",
          },
        }));
        setMessage("Location added to address.");
      },
      () => setMessage("Could not read your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const saveProfile = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await updateCustomerProfile(profile);
      onCustomerUpdated(response.data);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = editingAddressId
        ? await updateCustomerAddress(editingAddressId, addressForm)
        : await addCustomerAddress(addressForm);

      onCustomerUpdated(response.data);
      setAddressForm(emptyAddress);
      setEditingAddressId("");
      setMessage("Address saved.");
    } catch (error) {
      setMessage(error.message || "Could not save address.");
    } finally {
      setLoading(false);
    }
  };

  const editAddress = address => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || "Home",
      recipientName: address.recipientName || customer.name || "",
      phone: address.phone || customer.phone || "",
      address: address.address || "",
      location: address.location || null,
      isDefault: Boolean(address.isDefault),
    });
  };

  const removeAddress = async id => {
    setLoading(true);
    setMessage("");

    try {
      const response = await deleteCustomerAddress(id);
      onCustomerUpdated(response.data);
      setMessage("Address removed.");
    } catch (error) {
      setMessage(error.message || "Could not remove address.");
    } finally {
      setLoading(false);
    }
  };

  const addresses = Array.isArray(customer?.addresses)
    ? customer.addresses
    : [];

  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-[#171511]/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close profile"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <section className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#eadfce] bg-[#fffaf2] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] p-5 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
              User profile
            </p>
            <h2 className="text-3xl font-black text-[#171511]">
              Account and addresses
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

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            className="grid gap-4 rounded-3xl border border-[#eadfce] bg-white p-4"
            onSubmit={saveProfile}
          >
            <h3 className="text-xl font-black text-[#171511]">
              Profile details
            </h3>
            <div className="rounded-2xl bg-[#fff4d8] px-4 py-3">
              <p className="text-xs font-black uppercase text-[#9b6500]">
                Loyalty balance
              </p>
              <strong className="text-2xl text-[#171511]">
                {customer?.loyaltyPoints || 0} points
              </strong>
            </div>
            <Input
              label="Name"
              name="name"
              value={profile.name}
              onChange={updateProfileField}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={profile.phone}
              onChange={updateProfileField}
              required
            />
            <Input
              label="Default address"
              name="address"
              value={profile.address}
              onChange={updateProfileField}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#f5a400] px-5 py-3 font-black text-[#171511] disabled:bg-[#c9bba6] disabled:text-white"
            >
              Save profile
            </button>
          </form>

          <div className="grid gap-4">
            <form
              className="grid gap-4 rounded-3xl border border-[#eadfce] bg-white p-4"
              onSubmit={saveAddress}
            >
              <h3 className="text-xl font-black text-[#171511]">
                {editingAddressId ? "Edit address" : "Add address"}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Label"
                  name="label"
                  value={addressForm.label}
                  onChange={updateAddressField}
                  required
                />
                <Input
                  label="Recipient"
                  name="recipientName"
                  value={addressForm.recipientName}
                  onChange={updateAddressField}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={addressForm.phone}
                  onChange={updateAddressField}
                  required
                />
                <label className="flex items-center gap-3 pt-7 text-sm font-black text-[#726b61]">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={updateAddressField}
                    className="h-5 w-5 accent-[#f5a400]"
                  />
                  Default
                </label>
              </div>
              <Input
                label="Address"
                name="address"
                value={addressForm.address}
                onChange={updateAddressField}
                required
              />
              <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf2] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-[#171511]">
                      Location
                    </p>
                    <p className="text-xs font-bold text-[#726b61]">
                      {hasLocation(addressForm.location)
                        ? "Map location selected"
                        : "No location added"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {hasLocation(addressForm.location) && (
                      <a
                        href={getMapUrl(addressForm.location)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-black text-[#171511]"
                      >
                        View map
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="rounded-full bg-[#171511] px-4 py-2 text-xs font-black text-white"
                    >
                      {hasLocation(addressForm.location)
                        ? "Update location"
                        : "Use current location"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#171511] px-5 py-3 font-black text-white disabled:bg-[#c9bba6]"
                >
                  Save address
                </button>
                {editingAddressId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId("");
                      setAddressForm(emptyAddress);
                    }}
                    className="rounded-full border border-[#eadfce] bg-white px-5 py-3 font-black text-[#171511]"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="grid gap-3">
              {addresses.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#eadfce] bg-white p-5 text-center text-sm font-bold text-[#726b61]">
                  No saved addresses yet.
                </p>
              ) : (
                addresses.map(address => (
                  <article
                    key={address._id}
                    className="rounded-3xl border border-[#eadfce] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="text-[#171511]">
                          {address.label || "Address"}
                        </strong>
                        {address.isDefault && (
                          <span className="ms-2 rounded-full bg-[#287a4f]/10 px-2 py-1 text-xs font-black text-[#287a4f]">
                            Default
                          </span>
                        )}
                        <p className="mt-1 text-sm font-bold text-[#726b61]">
                          {address.recipientName} - {address.phone}
                        </p>
                        <p className="mt-1 text-sm text-[#726b61]">
                          {address.address}
                        </p>
                        {hasLocation(address.location) && (
                          <a
                            href={getMapUrl(address.location)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-black text-[#9b6500]"
                          >
                            Open map location
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editAddress(address)}
                        className="rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs font-black text-[#171511]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAddress(address._id)}
                        className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        {message && (
          <p className="mx-5 mb-5 rounded-2xl bg-[#287a4f]/10 px-4 py-3 text-sm font-black text-[#287a4f] sm:mx-6">
            {message}
          </p>
        )}
      </section>
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
