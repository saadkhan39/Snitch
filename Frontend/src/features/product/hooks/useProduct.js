import {createProduct, getSellerProducts} from "../service/product.service"
import {setSellerProduct} from "../state/product.slice"
import {useDispatch} from "react-redux" 

export const useProduct = () => {
    const dispatch = useDispatch()  

    async function handleCreateProduct(formData) {
        try {
            const data = await createProduct(formData)
            return { success: true, data }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Product creation failed. Please try again.'
            return { success: false, error: errorMessage }
        }
    }

    async function handleGetSellerProducts() {
        try {
            const data = await getSellerProducts()
            const products = Array.isArray(data) ? data : data?.products ?? []
            dispatch(setSellerProduct(products))
            return { success: true, data: products }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch seller products. Please try again.'
            return { success: false, error: errorMessage }
        }       
    }

    return { handleCreateProduct, handleGetSellerProducts }
}

