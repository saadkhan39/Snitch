import {Router} from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js"
import { googleCallback, login, register } from "../controllers/auth.controller.js"
import passport from "passport"
import { config } from "../config/config.js"

const router  = Router()


//register api
router.post("/register",validateRegisterUser,register)

//login api
router.post("/login",validateLoginUser,login)

//google auth
router.get("/google",
     passport.authenticate('google', { scope: ['profile', 'email'] })
)

//google auth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login"
   }),
  googleCallback
);

export default router