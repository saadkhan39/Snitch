import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import passport from "passport";

async function sendTokenResponse(user, res, message) {
  const token = await jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET, {
        expiresIn: "7d"
    })


  res.cookie("token", token);

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

// google callback
export const googleCallback = async (req,res) =>{
  console.log(req.user);
  res.redirect("http://localhost:5173")
}


