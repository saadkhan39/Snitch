import {Router} from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js"
import { login, register } from "../controllers/auth.controller.js"

const router  = Router()


//register api
router.post("/register",validateRegisterUser,register)

//login api
router.post("/login",validateLoginUser,login)


export default router