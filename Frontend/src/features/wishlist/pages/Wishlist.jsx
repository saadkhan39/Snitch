import React, { useEffect, useState, useMemo } from "react";
import {
  FiArrowLeft,
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router";
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

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);

  // -----------------------------------------
  // SIZE MODAL STATE
  // -----------------------------------------
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        await handleGetWishlist();
      } catch (error) {
        console.error(
          "GET WISHLIST ERROR:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await handleRemoveFromWishlist(productId);
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setRemovingId(null);
    }
  };

  // -----------------------------------------
  // EXTRACT & SPLIT INDIVIDUAL SIZES (FIXED)
  // -----------------------------------------
  const availableSizes = useMemo(() => {
    if (!selectedProduct?.variants) return [];

    const sizeMap = new Map();

    selectedProduct.variants.forEach((variant) => {
      const rawSize = variant?.attributes?.Size || variant?.attributes?.size;
      const stock = Number(variant?.stock ?? 0);

      if (rawSize && stock > 0) {
        // Split comma-separated string (e.g., "M,L,XL" -> ["M", "L", "XL"])
        const sizesArray = String(rawSize).split(",");

        sizesArray.forEach((s) => {
          const cleanSize = s.trim();
          if (!cleanSize) return;

          const key = cleanSize.toLowerCase();

          // Map each individual size to its parent variant
          if (!sizeMap.has(key)) {
            sizeMap.set(key, {
              label: cleanSize,
              variant: variant,
            });
          }
        });
      }
    });

    return Array.from(sizeMap.values());
  }, [selectedProduct]);

  // -----------------------------------------
  // MODAL HANDLERS
  // -----------------------------------------
  const handleOpenSizeSelector = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const handleCloseSizeSelector = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedVariant(null);
  };

  const handleSelectSizeOption = (item) => {
    if (selectedSize === item.label) {
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
    if (!selectedProduct || !selectedVariant || !selectedSize) return;

    const productId = selectedProduct?._id;
    const variantId = selectedVariant?._id;

    if (!productId || !variantId) {
      console.error("Product ID or Variant ID is missing");
      return;
    }

    try {
      setAddingToCartId(productId);

      await handleAddToCart({
        productId,
        variantId,
        selectedAttributes: {
          ...selectedVariant?.attributes,
          size: selectedSize, // Pass specific selected size string
        },
      });

      await handleRemoveFromWishlist(productId);
      handleCloseSizeSelector();
    } catch (error) {
      console.error(
        "MOVE TO CART ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F2]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-px w-10 bg-[#211D1A]" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#6D665F]">
            Loading wishlist
          </p>
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen [scrollbar-gutter:stable] bg-[#F8F6F2] text-[#211D1A]">
    {/* HEADER */}
    <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-[#E1DBD4] bg-[#F8F6F2]">

        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">

  

    {/* LEFT - BACK */}
    <div className="flex items-center justify-self-start">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="
          group
          flex
          items-center
          gap-2
          text-[10px]
          uppercase
          tracking-[0.2em]
          text-[#514B45]
          transition
          hover:text-[#211D1A]
        "
      >
        <FiArrowLeft
          className="
            h-4 w-4
            transition-transform
            duration-300
            group-hover:-translate-x-1
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
          text-[19px]
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
          h-8
          w-8
          items-center
          justify-center
          rounded-[5px]
          border
          border-[#D8D1C8]
          bg-white
          transition-all
          hover:border-[#211D1A]
          hover:bg-[#211D1A]
          hover:text-white
        "
      >
        <FiShoppingBag className="h-4 w-4" />
      </Link>
    </div>

  </div>
</header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        
        {/* PAGE HEADING */}
        <div className="mb-10 flex items-end justify-between border-b border-[#E1DBD4] pb-6">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#8A8179]">
              Your curated selection
            </p>
            <h1 className="font-serif text-[36px] leading-none tracking-[-0.02em] sm:text-[42px]">
              Wishlist
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#8A8179]">
              Collection
            </p>
            <p className="mt-1 text-xs tracking-wide">
              {String(wishlistItems.length).padStart(2, "0")}{" "}
              {wishlistItems.length === 1 ? "Item" : "Items"}
            </p>
          </div>
        </div>

        {/* EMPTY WISHLIST */}
        {wishlistItems.length === 0 ? (
          <section className="flex min-h-[58vh] items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center border border-[#D8D1C8] bg-white">
                <FiHeart className="h-5 w-5 stroke-[1.2]" />
              </div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.25em] text-[#8A8179]">
                Nothing saved yet
              </p>
              <h2 className="font-serif text-[30px]">Your wishlist is empty</h2>
              <p className="mx-auto mt-4 max-w-sm text-[13px] leading-6 text-[#6D665F]">
                Keep the pieces you love close. Save your favourite styles here
                and return to them whenever you're ready.
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex bg-[#211D1A] px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#302B27]"
              >
                Explore Collection
              </Link>
            </div>
          </section>
        ) : (
          /* WISHLIST PRODUCTS GRID */
          <section>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
              {wishlistItems.map((product) => {
                const productId = product?._id;
                const image = product?.images?.[0]?.url || product?.images?.[0];
                const price = product?.price;
                const isAdding = addingToCartId === productId;
                const isRemoving = removingId === productId;

                return (
                  <article key={productId} className="group relative">
                    <div className="relative">
                      <Link to={`/product/${productId}`} className="block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#EAE5E0]">
                          {image ? (
                            <img
                              src={image}
                              alt={product?.title || "Product"}
                              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A8179]">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(productId)}
                        disabled={isRemoving}
                        aria-label="Remove from wishlist"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-[#D8D1C8] bg-[#F8F6F2]/95 text-[#211D1A] opacity-0 transition duration-300 hover:border-[#211D1A] group-hover:opacity-100 disabled:opacity-50 sm:right-4 sm:top-4"
                      >
<FiX className="h-[13px] w-[13px] stroke-[1.4]" />
                      </button>

                      <div className="absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center bg-[#F8F6F2]/95 sm:bottom-4 sm:left-4">
                        <FiHeart className="h-[12px] w-[12px] fill-current stroke-[1.3]" />
                      </div>
                    </div>

                    <Link to={`/product/${productId}`} className="block pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-[13px] font-medium tracking-[-0.01em]">
                            {product?.title}
                          </h2>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#8A8179]">
                            Ready to wear
                          </p>
                        </div>
                        <p className="shrink-0 text-[12px] text-[#514B45]">
                          {price?.currency || "INR"} {price?.amount || 0}
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenSizeSelector(product)}
                      disabled={isAdding}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-[#211D1A] bg-[#211D1A] px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-[#302B27] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiShoppingBag className="h-3.5 w-3.5" />
                      Move to Cart
                    </button>

                    
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* SIZE SELECTOR MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
          onClick={handleCloseSizeSelector}
        >
          <div
            className="w-full max-w-md bg-[#F8F6F2] p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#E1DBD4] pb-5">
              <div>
                <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-[#8A8179]">
                  Select size
                </p>
                <h2 className="font-serif text-[25px]">
                  {selectedProduct?.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseSizeSelector}
                className="flex h-8 w-8 items-center justify-center border border-[#D8D1C8] bg-white transition hover:border-[#211D1A]"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {/* SIZE OPTIONS */}
            <div className="pt-6">
              <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-[#8A8179]">
                Available sizes
              </p>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((item) => {
                  const isSelected = selectedSize === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectSizeOption(item)}
                      className={`flex h-12 items-center justify-center border text-[10px] uppercase tracking-[0.15em] transition ${
                        isSelected
                          ? "border-[#211D1A] bg-[#211D1A] text-white"
                          : "border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {availableSizes.length === 0 && (
                <p className="py-6 text-center text-[10px] uppercase tracking-[0.15em] text-[#8A8179]">
                  No sizes currently available
                </p>
              )}
            </div>

            {/* SELECTED SIZE SUMMARY & SUBMIT */}
            {selectedSize && (
              <div className="mt-6 border-t border-[#E1DBD4] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.17em] text-[#8A8179]">
                    Selected size
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em]">
                    {selectedSize}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleMoveToCart}
                  disabled={addingToCartId === selectedProduct?._id}
                  className="flex w-full items-center justify-center gap-2 bg-[#211D1A] px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#302B27] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiShoppingBag className="h-4 w-4" />
                  {addingToCartId === selectedProduct?._id
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