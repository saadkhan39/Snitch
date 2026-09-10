import axios from "axios";

const api = axios.create({
    baseURL:"/api/cart",
    withCredentials: true
})

export const addToCart = async ({ productId, variantId }) => {
    console.log("productId:", productId);
    console.log("variantId:", variantId);

    const response = await api.post(
        `/add/${productId}/${variantId}`,
        {
            quantity: 1
        }
    );

    return response.data;
};

