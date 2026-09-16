import {
  createProduct,
  getAllProducts,
  getProductById,
  getSellerProducts,
  addProductVariant,
} from "../service/product.api";

import {
  setAllProducts,
  setSellerProducts,
} from "../state/product.slice";

import {
  useCallback,
} from "react";

import {
  useDispatch,
} from "react-redux";


export const useProduct = () => {
  const dispatch = useDispatch();


  // =====================================================
  // CREATE PRODUCT
  // =====================================================

  async function handleCreateProduct(formData) {
    try {
      const data =
        await createProduct(formData);

      return {
        success: true,
        data,
      };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Product creation failed. Please try again.";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }


  // =====================================================
  // GET SELLER PRODUCTS
  // =====================================================

  async function handleGetSellerProducts() {
    try {
      const data =
        await getSellerProducts();

      dispatch(
        setSellerProducts(data)
      );

      return data;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch seller products. Please try again.";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }


  // =====================================================
  // GET ALL PRODUCTS + SEARCH
  // =====================================================

  const handleGetAllProducts =
    useCallback(
      async (search = "") => {
        try {
          const products =
            await getAllProducts(search);

          dispatch(
            setAllProducts(products)
          );

          return products;
        } catch (err) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch products. Please try again.";

          return {
            success: false,
            error: errorMessage,
          };
        }
      },
      [dispatch]
    );


  // =====================================================
  // GET PRODUCT BY ID
  // =====================================================

  async function handleGetProductById(
    productId
  ) {
    try {
      const data =
        await getProductById(productId);

      return {
        success: true,
        data,
      };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch product details. Please try again.";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }


  // =====================================================
  // ADD PRODUCT VARIANT
  // =====================================================

  async function handleAddProductVariant(
    productId,
    newProductVariant
  ) {
    const data =
      await addProductVariant(
        productId,
        newProductVariant
      );

    return data;
  }


  // =====================================================
  // RETURN
  // =====================================================

  return {
    handleCreateProduct,
    handleGetSellerProducts,
    handleGetAllProducts,
    handleGetProductById,
    handleAddProductVariant,
  };
};