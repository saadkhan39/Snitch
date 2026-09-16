import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",

    initialState: {
        sellerProduct: [],
        allProducts: [],
        searchTerm: "",
    },

    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProduct = action.payload;
        },

        setAllProducts: (state, action) => {
            state.allProducts = action.payload;
        },

        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
    },
});

export const {
    setSellerProducts,
    setAllProducts,
    setSearchTerm,
} = productSlice.actions;

export default productSlice.reducer;