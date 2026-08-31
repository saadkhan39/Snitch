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
    return response.data;
}