import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import Food from "../../models/food.js";
import {
  createHttpError,
  optionalString,
  requireObjectId,
  requireString,
} from "../../utils/validation.js";

const publicCustomerFields =
  "name email phone address addresses wishlist role loyaltyPoints";

const sendCustomer = async (res, customerId, message = "Customer updated") => {
  const customer =
    await Customer.findById(customerId).select(publicCustomerFields);

  res.status(200).json({
    success: true,
    message,
    data: customer,
  });
};

const normalizeAddress = payload => ({
  label: optionalString(payload.label || "Home", 40) || "Home",
  recipientName: requireString(
    payload.recipientName || payload.name,
    "Name",
    80,
  ),
  phone: requireString(payload.phone, "Phone", 30),
  address: requireString(payload.address, "Address", 220),
  location: normalizeLocation(payload.location),
  isDefault: Boolean(payload.isDefault),
});

function normalizeLocation(location) {
  if (!location?.lat || !location?.lng) {
    return undefined;
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createHttpError("Location is invalid");
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw createHttpError("Location is outside the valid map range");
  }

  return {
    lat,
    lng,
    label: optionalString(location.label, 120),
  };
}

const updateProfile = asyncHandler(async (req, res) => {
  const update = {};

  if (req.body.name !== undefined) {
    update.name = requireString(req.body.name, "Name", 80);
  }

  if (req.body.phone !== undefined) {
    update.phone = requireString(req.body.phone, "Phone", 30);
  }

  if (req.body.address !== undefined) {
    update.address = optionalString(req.body.address, 220);
  }

  if (Object.keys(update).length === 0) {
    throw createHttpError("No profile fields were provided");
  }

  const customer = await Customer.findById(req.customer._id);

  Object.assign(customer, update);

  if (update.address) {
    const defaultAddress = customer.addresses.find(item => item.isDefault);

    if (defaultAddress) {
      defaultAddress.recipientName = customer.name;
      defaultAddress.phone = customer.phone;
      defaultAddress.address = update.address;
    } else {
      customer.addresses.push({
        label: "Home",
        recipientName: customer.name,
        phone: customer.phone,
        address: update.address,
        isDefault: true,
      });
    }
  }

  await customer.save();
  await sendCustomer(res, customer._id, "Profile updated");
});

const addAddress = asyncHandler(async (req, res) => {
  const address = normalizeAddress(req.body);
  const customer = await Customer.findById(req.customer._id);

  if (customer.addresses.length === 0) {
    address.isDefault = true;
  }

  if (address.isDefault) {
    customer.addresses.forEach(item => {
      item.isDefault = false;
    });
    customer.address = address.address;
  }

  customer.addresses.push(address);
  await customer.save();

  await sendCustomer(res, customer._id, "Address saved");
});

const updateAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  const address = customer.addresses.id(req.params.id);

  if (!address) {
    throw createHttpError("Address not found", 404);
  }

  const nextAddress = normalizeAddress({
    ...address.toObject(),
    ...req.body,
  });

  if (nextAddress.isDefault) {
    customer.addresses.forEach(item => {
      item.isDefault = false;
    });
    customer.address = nextAddress.address;
  }

  Object.assign(address, nextAddress);
  await customer.save();

  await sendCustomer(res, customer._id, "Address updated");
});

const deleteAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  const address = customer.addresses.id(req.params.id);

  if (!address) {
    throw createHttpError("Address not found", 404);
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
    customer.address = customer.addresses[0].address;
  }

  await customer.save();
  await sendCustomer(res, customer._id, "Address removed");
});

const getWishlist = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id).populate({
    path: "wishlist",
    populate: { path: "category", select: "title slug" },
  });

  res.status(200).json({
    success: true,
    data: customer.wishlist || [],
  });
});

const addWishlistItem = asyncHandler(async (req, res) => {
  const foodId = requireObjectId(req.params.foodId, "Food");
  const foodExists = await Food.exists({ _id: foodId, status: "active" });

  if (!foodExists) {
    throw createHttpError("Food not found", 404);
  }

  await Customer.findByIdAndUpdate(req.customer._id, {
    $addToSet: { wishlist: foodId },
  });

  await sendCustomer(res, req.customer._id, "Added to wishlist");
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  const foodId = requireObjectId(req.params.foodId, "Food");

  await Customer.findByIdAndUpdate(req.customer._id, {
    $pull: { wishlist: foodId },
  });

  await sendCustomer(res, req.customer._id, "Removed from wishlist");
});

export default {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
};
