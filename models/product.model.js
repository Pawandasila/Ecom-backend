import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: false,
    },
    color: {
        type: String,
        required: false,
    },
    stock: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    },
    sku: {
        type: String,
        required: false,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
        },
        category: {
            type: String,
            required: [true, "Product category is required"],
        },
        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
        },
        discount: {
            type: Number,
            default: 0,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        variants: [variantSchema],
        averageRating: {
            type: Number,
            default: 0,
        },
        
    },
    {
        timestamps: true,
    }
);




const Product = mongoose.model("Product", productSchema);

export default Product;
