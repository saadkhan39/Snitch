import axios from "axios";

const api = axios .create({
    baseURL: "/api/products",
    withCredentials: true,
});

export async function createProduct(formData) {
    const response = await api.post("/", formData)
    return response.data;
}

export async function getSellerProducts() {
    const response = await api.get("/seller")
    return response.data?.products ?? response.data;
}

export async function getAllProducts() {
    const response = await api.get("/")
    return response.data?.products ?? response.data;
}

export async function getProductById(productId) { 
    const response = await api.get(`/detail/${productId}`);
    return response.data;
}
