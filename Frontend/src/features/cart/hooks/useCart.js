import {
  addItem,
  getCart,
  deleteItem,
  incrementCartItem,
  decrementCartItem
} from "../service/cart.api";

import { useDispatch } from "react-redux";

import { setCart } from "../state/cart.slice";


export const useCart = () => {

  const dispatch = useDispatch();


  // ============================================
  // GET CART
  // ============================================

  async function handleGetCart() {

    try {

      const data = await getCart();

      const items =
        data?.cart?.items || [];

      dispatch(
        setCart(items)
      );

      return data;

    } catch (error) {

      console.error(
        "GET CART ERROR:",
        error.response?.data ||
        error.message
      );

      throw error;
    }
  }

  // ============================================
  // ADD TO CART
  // ============================================

  async function handleAddToCart({
    productId,
    variantId,
    selectedAttributes,
  }) {

    try {

      const data = await addItem({
        productId,
        variantId,
        selectedAttributes,
      });

      await handleGetCart();

      return data;

    } catch (error) {

      console.error(
        "ADD TO CART ERROR:",
        error.response?.data ||
        error.message
      );

      throw error;
    }
  }

  // ============================================
  // DELETE CART ITEM
  // ============================================

  async function handleDeleteItem(itemId) {

    try {

      const data =
        await deleteItem(itemId);

      // Refresh cart after deleting
      await handleGetCart();

      return data;

    } catch (error) {

      console.error(
        "DELETE CART ITEM ERROR:",
        error.response?.data ||
        error.message
      );

      throw error;
    }
  }

  // ============================================
  // INCREASE CART ITEM
  // ============================================
 async function handleIncrementCartItem({
  productId,
  variantId,
}) {
  try {
    const data = await incrementCartItem({
      productId,
      variantId,
    });

    await handleGetCart();

    return data;
  } catch (error) {
    console.error(
      "INCREMENT CART ITEM ERROR:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
}

  // ============================================
  // DECREASE CART ITEM
  // ============================================
async function handleDecrementCartItem({ productId, variantId }) {
  try {
    const data = await decrementCartItem({
      productId,
      variantId,
    });

    await handleGetCart();

    return data;
  } catch (error) {
    console.error(
      "DECREMENT CART ITEM ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
}

  return {
    handleAddToCart,
    handleGetCart,
    handleDeleteItem,
    handleIncrementCartItem,
    handleDecrementCartItem
  };
};

