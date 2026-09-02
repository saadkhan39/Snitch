import {createProduct, getSellerProducts ,getAllProducts ,getProductById} from "../service/product.service"
import {setSellerProducts,setAllProducts} from "../state/product.slice"
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
      try{
         const data = await getSellerProducts()
        dispatch(setSellerProducts(data.products))
        return data.products
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

    async function handleGetProductById(params) {
        try {
            const data = await getProductById(params)
            return { success: true, data }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch product details. Please try again.'
            return { success: false, error: errorMessage }
        }
    }

  

    return { handleCreateProduct, handleGetSellerProducts ,handleGetAllProducts, handleGetProductById}

     }


