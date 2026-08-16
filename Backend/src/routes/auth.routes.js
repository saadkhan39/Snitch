import {Router} from "express"
import { validateRegisterUser } from "../validator/auth.validator.js"
import { register } from "../controllers/auth.controller.js"

const router  = Router()


//register api
router.post("/register",validateRegisterUser,register)


export default router