const Cart = require("../models/cart");
const Food = require("../models/food");

exports.getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.foodId");
    if (!cart) {
      return res.status(200).json({ cartItems: [] });
    }
    return res.status(200).json({ cartItems: cart.items, user: req.user });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addToCart = async (req, res) => {
  const { userId, foodId, quantity } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

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
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
};

exports.removeCart = async (req, res) => {
  const foodId = req.params.foodId;
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove item matching the foodId
    cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
    await cart.save();

    res.status(200).json({ message: "Item removed", cartItems: cart.items });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error while removing from cart" });
  }
};
