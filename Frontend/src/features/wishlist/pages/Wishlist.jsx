import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  FiArrowLeft,
  FiHeart,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
} from "react-router";

import { useWishlist } from "../hooks/useWishlist";
import { useCart } from "../../cart/hooks/useCart";

const Wishlist = () => {
  const navigate = useNavigate();

  const {
    wishlistItems,
    handleGetWishlist,
    handleRemoveFromWishlist,
  } = useWishlist();

  const { handleAddToCart } = useCart();

  const [loading, setLoading] =
    useState(true);

  const [removingId, setRemovingId] =
    useState(null);

  const [addingToCartId, setAddingToCartId] =
    useState(null);

  // -----------------------------------------
  // SIZE MODAL STATE
  // -----------------------------------------

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedSize, setSelectedSize] =
    useState(null);

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  // -----------------------------------------
  // FETCH WISHLIST
  // -----------------------------------------

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);

        await handleGetWishlist();
      } catch (error) {
        console.error(
          "GET WISHLIST ERROR:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // -----------------------------------------
  // REMOVE FROM WISHLIST
  // -----------------------------------------

  const handleRemove = async (
    productId
  ) => {
    try {
      setRemovingId(productId);

      await handleRemoveFromWishlist(
        productId
      );
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error.response?.data ||
          error.message
      );
    } finally {
      setRemovingId(null);
    }
  };

  // -----------------------------------------
  // EXTRACT & SPLIT INDIVIDUAL SIZES
  // -----------------------------------------

  const availableSizes = useMemo(() => {
    if (!selectedProduct?.variants) {
      return [];
    }

    const sizeMap = new Map();

    selectedProduct.variants.forEach(
      (variant) => {
        const rawSize =
          variant?.attributes?.Size ||
          variant?.attributes?.size;

        const stock = Number(
          variant?.stock ?? 0
        );

        if (rawSize && stock > 0) {
          const sizesArray =
            String(rawSize).split(",");

          sizesArray.forEach((s) => {
            const cleanSize =
              s.trim();

            if (!cleanSize) {
              return;
            }

            const key =
              cleanSize.toLowerCase();

            if (!sizeMap.has(key)) {
              sizeMap.set(key, {
                label: cleanSize,
                variant: variant,
              });
            }
          });
        }
      }
    );

    return Array.from(
      sizeMap.values()
    );
  }, [selectedProduct]);

  // -----------------------------------------
  // MODAL HANDLERS
  // -----------------------------------------

  const handleOpenSizeSelector = (
    product
  ) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const handleCloseSizeSelector = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const handleSelectSizeOption = (
    item
  ) => {
    if (
      selectedSize === item.label
    ) {
      setSelectedSize(null);
      setSelectedVariant(null);
    } else {
      setSelectedSize(item.label);
      setSelectedVariant(item.variant);
    }
  };

  // -----------------------------------------
  // MOVE TO CART
  // -----------------------------------------

  const handleMoveToCart = async () => {
    if (
      !selectedProduct ||
      !selectedVariant ||
      !selectedSize
    ) {
      return;
    }

    const productId =
      selectedProduct?._id;

    const variantId =
      selectedVariant?._id;

    if (!productId || !variantId) {
      console.error(
        "Product ID or Variant ID is missing"
      );

      return;
    }

    try {
      setAddingToCartId(productId);

      await handleAddToCart({
        productId,
        variantId,

        selectedAttributes: {
          ...selectedVariant?.attributes,
          size: selectedSize,
        },
      });

      await handleRemoveFromWishlist(
        productId
      );

      handleCloseSizeSelector();
    } catch (error) {
      console.error(
        "MOVE TO CART ERROR:",
        error.response?.data ||
          error.message
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F2]">

        <div className="text-center">

          <div className="mx-auto mb-[1rem] h-px w-[2.5rem] bg-[#211D1A]" />

          <p className="text-[0.625rem] uppercase tracking-[0.25em] text-[#6D665F]">
            Loading wishlist
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen [scrollbar-gutter:stable] bg-[#F8F6F2] text-[#211D1A]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-40 h-[4rem] border-b border-[#E1DBD4] bg-[#F8F6F2]/95 backdrop-blur-md">

        <div className="mx-auto flex h-full max-w-[80rem] items-center justify-between px-[4vw] sm:px-[5vw] lg:px-[3vw]">

          {/* LEFT - BACK */}

          <div className="flex items-center justify-self-start">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="
                group
                flex
                items-center
                gap-[0.5rem]
                text-[0.625rem]
                uppercase
                tracking-[0.2em]
                text-[#514B45]
                transition
                hover:text-[#211D1A]
              "
            >

              <FiArrowLeft
                className="
                  h-[1rem]
                  w-[1rem]
                  transition-transform
                  duration-300
                  group-hover:-translate-x-[0.25rem]
                "
              />

              <span className="hidden sm:block">
                Back
              </span>

            </button>

          </div>

          {/* CENTER - LOGO */}

          <div className="flex items-center justify-center">

            <Link
              to="/"
              className="
                text-[1.1875rem]
                font-bold
                tracking-[0.12em]
                text-[#211D1A]
                transition-opacity
                hover:opacity-70
              "
            >
              SNITCH
            </Link>

          </div>

          {/* RIGHT - CART */}

          <div className="flex items-center justify-self-end">

            <Link
              to="/cart"
              aria-label="Shopping bag"
              className="
                flex
                h-[2rem]
                w-[2rem]
                items-center
                justify-center
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
                transition-all
                hover:border-[#211D1A]
                hover:bg-[#211D1A]
                hover:text-white
              "
            >

              <FiShoppingBag className="h-[1rem] w-[1rem]" />

            </Link>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[100rem] px-[4vw] pb-[4vh] pt-[7rem] sm:px-[5vw] lg:px-[3vw] lg:pt-[8rem]">

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <div className="mb-[2.5rem] flex items-end justify-between border-b border-[#E1DBD4] pb-[1.5rem]">

          <div>

            <p className="mb-[0.75rem] text-[0.5625rem] uppercase tracking-[0.28em] text-[#8A8179]">
              Your curated selection
            </p>

            <h1 className="font-serif text-[2.25rem] leading-none tracking-[-0.02em] sm:text-[2.625rem]">
              Wishlist
            </h1>

          </div>

          <div className="text-right">

            <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#8A8179]">
              Collection
            </p>

            <p className="mt-[0.25rem] text-[0.75rem] tracking-wide">
              {String(
                wishlistItems.length
              ).padStart(2, "0")}{" "}
              {wishlistItems.length === 1
                ? "Item"
                : "Items"}
            </p>

          </div>

        </div>

        {/* =================================================
            EMPTY WISHLIST
        ================================================= */}

        {wishlistItems.length ===
        0 ? (
          <section className="flex min-h-[58vh] items-center justify-center">

            <div className="max-w-[25rem] text-center">

              <div className="mx-auto mb-[1.75rem] flex h-[4rem] w-[4rem] items-center justify-center border border-[#D8D1C8] bg-white">

                <FiHeart className="h-[1.25rem] w-[1.25rem] stroke-[1.2]" />

              </div>

              <p className="mb-[0.75rem] text-[0.5625rem] uppercase tracking-[0.25em] text-[#8A8179]">
                Nothing saved yet
              </p>

              <h2 className="font-serif text-[1.875rem]">
                Your wishlist is empty
              </h2>

              <p className="mx-auto mt-[1rem] max-w-[23rem] text-[0.8125rem] leading-[1.5rem] text-[#6D665F]">
                Keep the pieces you love
                close. Save your favourite
                styles here and return to
                them whenever you're ready.
              </p>

              <Link
                to="/"
                className="
                  mt-[2rem]
                  inline-flex
                  bg-[#211D1A]
                  px-[2rem]
                  py-[1rem]
                  text-[0.625rem]
                  uppercase
                  tracking-[0.2em]
                  text-white
                  transition
                  hover:bg-[#302B27]
                "
              >
                Explore Collection
              </Link>

            </div>

          </section>
        ) : (

          /* =================================================
              WISHLIST PRODUCTS GRID
          ================================================= */

          <section>

            <div className="grid grid-cols-2 gap-x-[1vw] gap-y-[5vh] sm:grid-cols-3 sm:gap-x-[1.5vw] lg:grid-cols-4 lg:gap-x-[1.5vw] lg:gap-y-[7vh]">

              {wishlistItems.map(
                (product) => {

                  const productId =
                    product?._id;

                  const image =
                    product?.images?.[0]
                      ?.url ||
                    product?.images?.[0];

                  const price =
                    product?.price;

                  const isAdding =
                    addingToCartId ===
                    productId;

                  const isRemoving =
                    removingId ===
                    productId;

                  return (
                    <article
                      key={productId}
                      className="group relative"
                    >

                      {/* PRODUCT IMAGE */}

                      <div className="relative">

                        <Link
                          to={`/product/${productId}`}
                          className="block"
                        >

                          <div className="relative aspect-[4/5] overflow-hidden bg-[#EAE5E0]">

                            {image ? (
                              <img
                                src={image}
                                alt={
                                  product?.title ||
                                  "Product"
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition
                                  duration-700
                                  ease-out
                                  group-hover:scale-[1.025]
                                "
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">

                                <span className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#8A8179]">
                                  No Image
                                </span>

                              </div>
                            )}

                          </div>

                        </Link>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              productId
                            )
                          }
                          disabled={
                            isRemoving
                          }
                          aria-label="Remove from wishlist"
                          className="
                            absolute
                            right-[0.75rem]
                            top-[0.75rem]
                            flex
                            h-[2rem]
                            w-[2rem]
                            items-center
                            justify-center
                            border
                            border-[#D8D1C8]
                            bg-[#F8F6F2]/95
                            text-[#211D1A]
                            opacity-0
                            transition
                            duration-300
                            hover:border-[#211D1A]
                            group-hover:opacity-100
                            disabled:opacity-50
                            sm:right-[1rem]
                            sm:top-[1rem]
                          "
                        >

                          <FiX className="h-[0.8125rem] w-[0.8125rem] stroke-[1.4]" />

                        </button>

                        {/* WISHLIST ICON */}

                        <div className="absolute bottom-[0.75rem] left-[0.75rem] flex h-[1.75rem] w-[1.75rem] items-center justify-center bg-[#F8F6F2]/95 sm:bottom-[1rem] sm:left-[1rem]">

                          <FiHeart className="h-[0.75rem] w-[0.75rem] fill-current stroke-[1.3]" />

                        </div>

                      </div>

                      {/* PRODUCT INFO */}

                      <Link
                        to={`/product/${productId}`}
                        className="block pt-[1rem]"
                      >

                        <div className="flex items-start justify-between gap-[0.75rem]">

                          <div className="min-w-0">

                            <h2 className="truncate text-[0.8125rem] font-medium tracking-[-0.01em]">
                              {product?.title}
                            </h2>

                            <p className="mt-[0.25rem] text-[0.5625rem] uppercase tracking-[0.15em] text-[#8A8179]">
                              Ready to wear
                            </p>

                          </div>

                          <p className="shrink-0 text-[0.75rem] text-[#514B45]">
                            {price?.currency ||
                              "INR"}{" "}
                            {price?.amount ||
                              0}
                          </p>

                        </div>

                      </Link>

                      {/* MOVE TO CART */}

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSizeSelector(
                            product
                          )
                        }
                        disabled={isAdding}
                        className="
                          mt-[1rem]
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-[0.5rem]
                          border
                          border-[#211D1A]
                          bg-[#211D1A]
                          px-[1rem]
                          py-[0.75rem]
                          text-[0.5625rem]
                          uppercase
                          tracking-[0.2em]
                          text-white
                          transition
                          hover:bg-[#302B27]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        <FiShoppingBag className="h-[0.875rem] w-[0.875rem]" />

                        Move to Cart

                      </button>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

      </main>

      {/* =================================================
          SIZE SELECTOR MODAL
      ================================================= */}

      {selectedProduct && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-[1.25rem]
          "
          onClick={
            handleCloseSizeSelector
          }
        >

          <div
            className="
              w-full
              max-w-[25rem]
              bg-[#F8F6F2]
              p-[1.5rem]
              sm:p-[2rem]
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-start justify-between border-b border-[#E1DBD4] pb-[1.25rem]">

              <div>

                <p className="mb-[0.5rem] text-[0.5625rem] uppercase tracking-[0.25em] text-[#8A8179]">
                  Select size
                </p>

                <h2 className="font-serif text-[1.5625rem]">
                  {selectedProduct?.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseSizeSelector
                }
                className="
                  flex
                  h-[2rem]
                  w-[2rem]
                  items-center
                  justify-center
                  border
                  border-[#D8D1C8]
                  bg-white
                  transition
                  hover:border-[#211D1A]
                "
              >

                <FiX className="h-[1rem] w-[1rem]" />

              </button>

            </div>

            {/* =================================================
                SIZE OPTIONS
            ================================================= */}

            <div className="pt-[1.5rem]">

              <p className="mb-[0.75rem] text-[0.5625rem] uppercase tracking-[0.2em] text-[#8A8179]">
                Available sizes
              </p>

              <div className="grid grid-cols-4 gap-[0.5rem]">

                {availableSizes.map(
                  (item) => {

                    const isSelected =
                      selectedSize ===
                      item.label;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          handleSelectSizeOption(
                            item
                          )
                        }
                        className={`
                          flex
                          h-[3rem]
                          items-center
                          justify-center
                          border
                          text-[0.625rem]
                          uppercase
                          tracking-[0.15em]
                          transition
                          ${
                            isSelected
                              ? "border-[#211D1A] bg-[#211D1A] text-white"
                              : "border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A]"
                          }
                        `}
                      >
                        {item.label}
                      </button>
                    );
                  }
                )}

              </div>

              {availableSizes.length ===
                0 && (
                <p className="py-[1.5rem] text-center text-[0.625rem] uppercase tracking-[0.15em] text-[#8A8179]">
                  No sizes currently available
                </p>
              )}

            </div>

            {/* =================================================
                SELECTED SIZE
            ================================================= */}

            {selectedSize && (
              <div className="mt-[1.5rem] border-t border-[#E1DBD4] pt-[1.25rem]">

                <div className="mb-[1rem] flex items-center justify-between">

                  <span className="text-[0.5625rem] uppercase tracking-[0.17em] text-[#8A8179]">
                    Selected size
                  </span>

                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em]">
                    {selectedSize}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={
                    handleMoveToCart
                  }
                  disabled={
                    addingToCartId ===
                    selectedProduct?._id
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-[0.5rem]
                    bg-[#211D1A]
                    px-[1.25rem]
                    py-[1rem]
                    text-[0.625rem]
                    uppercase
                    tracking-[0.2em]
                    text-white
                    transition
                    hover:bg-[#302B27]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <FiShoppingBag className="h-[1rem] w-[1rem]" />

                  {addingToCartId ===
                  selectedProduct?._id
                    ? "Adding..."
                    : "Add to Cart"}

                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Wishlist;