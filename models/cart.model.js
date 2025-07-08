import mongoose from "mongoose";


const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    selectedVariant: {
        size: String,
        color: String,
    },
});


const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, 
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);


cartSchema.methods.calculateTotalPrice = async function () {
    let total = 0;
    await this.populate('items.product');
    this.items.forEach(item => {
        const product = item.product;
        let price = product.basePrice;

        
        if (product.discount && product.discount > 0) {
            price = price - (price * product.discount) / 100;
        }

        
        if (product.variants && product.variants.length > 0) {
            const matchedVariant = product.variants.find(
                v =>
                    (!item.selectedVariant.size || v.size === item.selectedVariant.size) &&
                    (!item.selectedVariant.color || v.color === item.selectedVariant.color)
            );
            if (matchedVariant) {
                price = matchedVariant.price;
            }
        }

        total += price * item.quantity;
    });
    this.totalPrice = total;
    return this.save();
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
