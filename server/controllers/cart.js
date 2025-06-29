const Cart = require("../models/cart");
const Food = require("../models/food");
const createError = require("../middlewares/createError");

exports.getCart = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.foodId");
    if (!cart) return res.status(200).json({ cartItems: [] });

    return res.status(200).json({ cartItems: cart.items, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  const { userId, foodId, quantity } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food) return next(createError(404, "Food item not found"));

    const price = parseFloat(food.price);
    const totalPrice = (price * quantity).toFixed(3);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ foodId, quantity, totalPrice }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.foodId.toString() === foodId,
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;

        const currentTotal = parseFloat(cart.items[itemIndex].totalPrice);
        const newTotal = (currentTotal + price * quantity).toFixed(3);
        cart.items[itemIndex].totalPrice = newTotal;
      } else {
        cart.items.push({ foodId, quantity, totalPrice });
      }
    }

    await cart.save();

    // Return cart items only (for frontend convenience)
    res.status(200).json({
      message: "Item added to cart successfully",
      cartItems: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeCart = async (req, res, next) => {
  const foodId = req.params.foodId;
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return next(createError(404, "Cart not found"));

    // Remove item matching the foodId
    cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
    await cart.save();

    res.status(200).json({ message: "Item removed", cartItems: cart.items });
  } catch (error) {
    next(error);
  }
};
