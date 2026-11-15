import {Router} from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js"
import { getMe, googleCallback, login, logout, register } from "../controllers/auth.controller.js"
import passport from "passport"
import { config } from "../config/config.js"
import { authenticateUser } from "../middleware/auth.middleware.js"

const router  = Router()


//register api
router.post("/register",validateRegisterUser,register)

//login api
router.post("/login",validateLoginUser,login)

//logout api
router.post("/logout",logout)

//me api
router.get("/me",authenticateUser,getMe)

//google auth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

//google auth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
  }),
  googleCallback
);



export default router