import { addToCart } from "../service/cart.service";
import { useDispatch } from "react-redux"

export const useCart =()=>{
    const dispatch = useDispatch()

    async function handleAddToCart({productId, variantId}) {
        const data = await addToCart({productId,variantId})
        return data  
    }

    return {handleAddToCart}
}