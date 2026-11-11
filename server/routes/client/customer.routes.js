import express from "express";

import customerController from "../../controllers/client/customer.controller.js";
import protectCustomer from "../../middlewares/customerAuth.js";

const router = express.Router();

router.use(protectCustomer);

router.patch("/profile", customerController.updateProfile);
router.post("/addresses", customerController.addAddress);
router.put("/addresses/:id", customerController.updateAddress);
router.delete("/addresses/:id", customerController.deleteAddress);
router.get("/wishlist", customerController.getWishlist);
router.post("/wishlist/:foodId", customerController.addWishlistItem);
router.delete("/wishlist/:foodId", customerController.removeWishlistItem);

export default router;
