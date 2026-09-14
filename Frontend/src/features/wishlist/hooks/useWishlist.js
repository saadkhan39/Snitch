import { useDispatch, useSelector } from "react-redux"
import {addToWishlist,removeFromWishlist,getWishlist,checkWishlist,} from "../service/wishlist.api";
import {setWishlist,addWishlistItem,removeWishlistItem,} from "../state/wishlist.slice";


export const useWishlist = () => {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist?.items || []
  );



  async function handleGetWishlist() {
    try {
      const data = await getWishlist();

      const products =
        data?.wishlist?.products || [];

      dispatch(setWishlist(products));

      return data;
    } catch (error) {
      console.error(
        "GET WISHLIST ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  }


  async function handleAddToWishlist(productId) {
    try {
      const data = await addToWishlist(productId);

      const product =
        data?.wishlist?.products?.find(
          (item) => item?._id === productId
        );

      if (product) {
        dispatch(addWishlistItem(product));
      } else {
        // Refresh wishlist if product isn't returned
        await handleGetWishlist();
      }

      return data;
    } catch (error) {
      console.error(
        "ADD TO WISHLIST ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  }


  async function handleRemoveFromWishlist(productId) {
    try {
      const data =
        await removeFromWishlist(productId);

      dispatch(removeWishlistItem(productId));

      return data;
    } catch (error) {
      console.error(
        "REMOVE FROM WISHLIST ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  }


  async function handleCheckWishlist(productId) {
    try {
      const data =
        await checkWishlist(productId);

      return data?.isWishlisted || false;
    } catch (error) {
      console.error(
        "CHECK WISHLIST ERROR:",
        error.response?.data || error.message
      );

      return false;
    }
  }

  function isWishlisted(productId) {
    return wishlistItems.some(
      (item) =>
        item?._id?.toString() ===
        productId?.toString()
    );
  }


  return {
    wishlistItems,
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    handleCheckWishlist,
    isWishlisted,
  };
};

