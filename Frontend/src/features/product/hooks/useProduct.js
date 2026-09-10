import {  createProduct, getAllProducts, getProductById, getSellerProducts ,addProductVariant} from "../service/product.api"
import { setAllProducts, setSellerProducts } from "../state/product.slice"
import { useDispatch } from "react-redux"

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
      try{
         const data = await getSellerProducts()
          dispatch(setSellerProducts(data))
          return data
      }catch(err){
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch seller products. Please try again.'
        return { success: false, error: errorMessage }
      } 
    }

    async function handleGetAllProducts() {
        try {
            const data = await getAllProducts()
            const products = Array.isArray(data) ? data : data?.products ?? []
            dispatch(setAllProducts(products))
            return { success: true, data: products }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch products. Please try again.'
            return { success: false, error: errorMessage }
        }       
    }

    async function handleGetProductById(productId) {
        try {
            const data = await getProductById(productId)
            return { success: true, data }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch product details. Please try again.'
            return { success: false, error: errorMessage }
        }
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    return { handleCreateProduct, handleGetSellerProducts, handleGetAllProducts, handleGetProductById ,handleAddProductVariant }

}


