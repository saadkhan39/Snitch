import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/state/auth.slice"
import productReducer from "../features/product/state/product.slice"
import cartReducer from "../features/cart/state/cart.slice"
import wishlistReducer from "../features/wishlist/state/wishlist.slice"
import sellerHeroReducer from "../features/hero/state/hero.slice"

export const store = configureStore({
    reducer:{
        auth : authReducer,
        product : productReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        sellerHero: sellerHeroReducer
    }
})