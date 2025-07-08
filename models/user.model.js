import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        address: {
            type: String,
            default: "",
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.generateAccessToken = function () {
  const { _id, role } = this;
  const accessToken = jwt.sign(
    {
      userId: _id,
      role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return accessToken;
};

// Generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  const { _id, role } = this;
  const refreshToken = jwt.sign({ userId: _id, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
