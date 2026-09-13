import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    items: [],
  },

  reducers: {
    setCart: (state, action) => {
      state.items = action.payload || [];
    },
    clearCart: (state) => {
      state.items = [];
    },
     incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload

            state.items = state.items.map(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    return { ...item, quantity: item.quantity + 1 }
                } else {
                    return item
                }
            })
        },
    decrementCartItem: (state, action) => {
    const { productId, variantId } = action.payload

    state.items = state.items.map(item => {
        if (
            item.product._id === productId &&
            item.variant === variantId
        ) {
            return {
                ...item,
                quantity: Math.max(1, item.quantity - 1)
            }
        } else {
            return item
        }
    })
}

  },
});

export const {
  setCart,
  clearCart,
  incrementCartItem
} = cartSlice.actions;

export default cartSlice.reducer;