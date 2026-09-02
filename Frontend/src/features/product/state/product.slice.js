import {createSlice} from "@reduxjs/toolkit"

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProduct: [],
        allProducts: []
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProduct = action.payload
        },
        setAllProducts: (state, action) => {
            state.allProducts = action.payload
        }
    }
})

export const { setSellerProducts, setAllProducts } = productSlice.actions
export default productSlice.reducer