import axios from "axios";

const api = axios.create({
    baseURL:"/api/cart",
    withCredentials: true
})

export const addToCart = async ({ productId, variantId }) => {
   
        const response = await api.post(`/add/${productId}/${variantId}`, {
        quantity: 1
    })

    return response.data
}

