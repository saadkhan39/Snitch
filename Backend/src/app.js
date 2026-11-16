
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import heroRouter from "./routes/hero.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render runs behind a proxy
app.set("trust proxy", 1);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS only needed for separate local frontend during development
if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }));
}

// Google Passport
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// API routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlists", wishlistRouter);
app.use("/api/hero", heroRouter);

// Serve React build
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Snitch server is running",
  });
});

// React frontend fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
