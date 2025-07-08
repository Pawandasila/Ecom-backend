import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { HTTPSTATUS } from "../config/https.config.js";
import mongoose from "mongoose";

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const { productId, quantity = 1, selectedVariant = {} } = req.body;

    if (!productId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity <= 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedVariant.size === selectedVariant.size &&
        item.selectedVariant.color === selectedVariant.color
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        selectedVariant,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);

    if (error.name === "CastError") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": objectId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    ).populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    if (!cart) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Cart or item not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);

    if (error.name === "CastError" || error.name === "BSONTypeError") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while updating cart item",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);

    if (error.name === "CastError") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while removing from cart",
    });
  }
};
