
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Cookie configuration for same-origin production deployment
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    { id: user._id },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
    },
  });
}

// REGISTER
export const register = async (req, res) => {
  try {
    const { fullname, email, contact, password, isSeller } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or contact already exists",
      });
    }

    const user = await userModel.create({
      fullname,
      email,
      contact,
      password,
      role: isSeller ? "seller" : "buyer",
    });

    return await sendTokenResponse(
      user,
      res,
      "User registered successfully"
    );

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return await sendTokenResponse(
      user,
      res,
      "User logged in successfully"
    );

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("GetMe error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

// GOOGLE CALLBACK
export const googleCallback = async (req, res) => {
  try {
    const { id, displayName, emails } = req.user;

    const email = emails?.[0]?.value;

    if (!email) {
      return res.redirect("/login?error=google_auth_failed");
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        email,
        googleId: id,
        fullname: displayName,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    // Redirect to the same deployed website
    return res.redirect("/");

  } catch (error) {
    console.error("Google authentication error:", error);

    return res.redirect("/login?error=google_auth_failed");
  }
};
