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

export async function createProductVariant(productId, variant) {
    const formData = new FormData()

    formData.append('stock', String(variant.stock ?? 0))
    formData.append('priceAmount', String(variant.price?.amount ?? ''))
    formData.append('priceCurrency', variant.price?.currency || 'INR')
    formData.append('attributes', JSON.stringify(variant.attributes || {}))

    for (const image of variant.images || []) {
        if (image.file) {
            formData.append('variantImages', image.file)
        }
    }

    const response = await api.post(`/${productId}/variants`, formData)
    return response.data
}


