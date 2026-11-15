import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import passport from "passport";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
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

// register controller
export const register = async (req, res) => {
  const { fullname, email, contact, password, isSeller } = req.body;

  try {
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "user with this email and contact does already exits",
      });
    }

    const user = await userModel.create({
      fullname,
      email,
      password,
      contact,
      role: isSeller ? "seller" : "buyer",
    });

    await sendTokenResponse(user, res, "User registered successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// login controller
export const login = async (req,res) => {
    const {email ,password} = req.body

    const user = await userModel.findOne({email})

    if(!user){
      return res.status(400).json({
        message:"Invalid email or password"
      })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
      return res.status(400).json({
        message:"Invalid Password"
      })
    }

    await sendTokenResponse(user, res, "User logged in successfully")
}

// getMe controller
export const getMe = async (req,res) =>{
  const user = req.user

  res.status(200).json({
    message:"User fetched successfully",
    success:true,
    user:{
      id:user._id,
      fullname:user.fullname,
      email:user.email,
      contact:user.contact,
      role:user.role
    }
  })
} 

// logout controller
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

// google callback
export const googleCallback = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
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
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};



