
import { Router } from "express";

import {
  validateLoginUser,
  validateRegisterUser,
} from "../validator/auth.validator.js";

import {
  getMe,
  googleCallback,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";

import passport from "passport";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

// Register
router.post("/register", validateRegisterUser, register);

// Login
router.post("/login", validateLoginUser, login);

// Logout
router.post("/logout", logout);

// Get logged-in user
router.get("/me", authenticateUser, getMe);

// Google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=google_auth_failed",
  }),
  googleCallback
);

export default router;
