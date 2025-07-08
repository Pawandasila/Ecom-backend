import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { HTTPSTATUS } from "../config/https.config.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, shippingCost = 0, notes = "" } = req.body;


    if (!shippingAddress) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Cart is empty",
      });
    }

    await cart.calculateTotalPrice();
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
    }));

    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice: cart.totalPrice,
      shippingCost,
      shippingAddress,
      estimatedDeliveryDate,
      notes,
    });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    await order.populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "name description basePrice discount imageUrl variants",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    if (!order) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);

    if (error.name === "CastError") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Cannot cancel order that has been shipped or delivered",
      });
    }

    if (order.isCancelled) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    order.status = "cancelled";
    order.isCancelled = true;
    await order.save();

    await order.populate({
      path: "items.product",
      select: "name description basePrice discount imageUrl variants",
    });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);

    if (error.name === "CastError") {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "items.product",
        select: "name description basePrice discount imageUrl variants",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page < Math.ceil(totalOrders / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};
