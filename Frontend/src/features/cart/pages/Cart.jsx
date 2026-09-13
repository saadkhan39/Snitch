import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSelector } from "react-redux";

import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import { useNavigate } from "react-router";

import { useCart } from "../hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();

  // ============================================
  // CART PULSE
  // ============================================

  const [bagPulse, setBagPulse] = useState(false);

  // ============================================
  // DELETE POPUP
  // ============================================

  const [deleteItemId, setDeleteItemId] = useState(null);

  // ============================================
  // CART ITEMS
  // ============================================

  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const {
    handleGetCart,
    handleDeleteItem,
    handleIncrementCartItem,
    handleDecrementCartItem,
  } = useCart();

  // ============================================
  // FETCH CART
  // ============================================

  useEffect(() => {
    handleGetCart();
  }, []);

  // ============================================
  // DELETE ITEM
  // ============================================

  const handleDelete = async () => {
    if (!deleteItemId) {
      return;
    }

    try {
      await handleDeleteItem(deleteItemId);

      setDeleteItemId(null);
    } catch (error) {
      console.error(
        "DELETE CART ITEM ERROR:",
        error.response?.data || error.message
      );
    }
  };

  // ============================================
  // MOVE TO WISHLIST
  // ============================================

  const handleMoveToWishlist = () => {
    if (!deleteItemId) {
      return;
    }

    // Wishlist API will be connected here.
    console.log(
      "MOVE TO WISHLIST:",
      deleteItemId
    );

    setDeleteItemId(null);
  };

  // ============================================
  // INCREASE CART ITEM
  // ============================================

  const handleIncreaseQuantity = async (item) => {
    try {
      await handleIncrementCartItem({
        productId: item?.product?._id,
        variantId: item?.variant,
      });
    } catch (error) {
      console.error(
        "INCREASE QUANTITY ERROR:",
        error.response?.data || error.message
      );
    }
  };

  // ============================================
  // DECREASE CART ITEM
  // ============================================

  const handleDecreaseQuantity = async (item) => {
    try {
      await handleDecrementCartItem({
        productId: item?.product?._id,
        variantId: item?.variant,
      });
    } catch (error) {
      console.error(
        "DECREASE QUANTITY ERROR:",
        error.response?.data || error.message
      );
    }
  };

  // ============================================
  // FIND VARIANT
  // ============================================

  const getVariant = (item) => {
    const product = item?.product;

    if (
      !product?.variants ||
      !item?.variant
    ) {
      return null;
    }

    return (
      product.variants.find(
        (variant) =>
          String(variant._id) ===
          String(item.variant)
      ) || null
    );
  };

  // ============================================
  // GET IMAGE
  // ============================================

  const getItemImage = (item) => {
    const variant = getVariant(item);
    const product = item?.product;

    if (
      variant?.images &&
      variant.images.length > 0
    ) {
      return variant.images[0]?.url;
    }

    if (
      product?.images &&
      product.images.length > 0
    ) {
      return product.images[0]?.url;
    }

    return "";
  };

  // ============================================
  // GET PRICE
  // ============================================

  const getItemPrice = (item) => {
    const variant = getVariant(item);

    if (
      variant?.price?.amount != null
    ) {
      return Number(
        variant.price.amount
      );
    }

    if (
      item?.price?.amount != null
    ) {
      return Number(
        item.price.amount
      );
    }

    if (
      item?.product?.price?.amount != null
    ) {
      return Number(
        item.product.price.amount
      );
    }

    return 0;
  };

  // ============================================
  // FORMAT PRICE
  // ============================================

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  // ============================================
  // GET ATTRIBUTE VALUE
  // ============================================

  const getAttributeValue = (
    item,
    attributeName
  ) => {
    const selectedAttributes =
      item?.selectedAttributes;

    if (!selectedAttributes) {
      return null;
    }

    let attributes;

    if (
      selectedAttributes instanceof Map
    ) {
      attributes =
        Object.fromEntries(
          selectedAttributes
        );
    } else {
      attributes =
        selectedAttributes;
    }

    if (
      !attributes ||
      typeof attributes !== "object"
    ) {
      return null;
    }

    const key =
      Object.keys(attributes).find(
        (key) =>
          key
            .toLowerCase()
            .trim() ===
          attributeName
            .toLowerCase()
            .trim()
      );

    if (!key) {
      return null;
    }

    return attributes[key]
      ?.toString()
      .trim();
  };

  // ============================================
  // SUBTOTAL
  // ============================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const price =
          getItemPrice(item);

        const quantity =
          Number(item?.quantity) || 0;

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [cartItems]);

  // ============================================
  // TOTAL ITEMS
  // ============================================

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        return (
          total +
          (Number(item?.quantity) || 0)
        );
      },
      0
    );
  }, [cartItems]);

  // ============================================
  // CART BUTTON CLICK
  // ============================================

  const handleCartButtonClick = () => {
    setBagPulse(true);

    setTimeout(() => {
      setBagPulse(false);
    }, 900);

    navigate("/cart");
  };

  // ============================================
  // EMPTY CART
  // ============================================

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F6F2] text-[#211D1A]">

        {/* ======================================
            FIXED HEADER
        ====================================== */}

        <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-[#E1DBD4] bg-[#F8F6F2]">

          <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">

            {/* BACK BUTTON */}

            <button
              onClick={() =>
                navigate(-1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#D8D1C8] bg-white transition hover:border-[#211D1A]"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>

            {/* LOGO */}

            <button
              onClick={() =>
                navigate("/")
              }
              className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold tracking-[0.16em]"
            >
              SNITCH
            </button>

            {/* CART BUTTON */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={
                handleCartButtonClick
              }
              className={`relative flex h-8 w-8 items-center justify-center rounded-[4px] border transition-all duration-300 ${
                bagPulse
                  ? "scale-125 border-[#211D1A] bg-[#211D1A] text-white"
                  : "scale-100 border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
              }`}
            >
              <FiShoppingBag
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  bagPulse
                    ? "animate-bounce"
                    : ""
                }`}
              />

              {bagPulse && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B54A42] opacity-75" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B54A42]" />
                </span>
              )}

              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B4603C] px-1 font-['Plus_Jakarta_Sans'] text-[7px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

          </div>

        </header>

        {/* ======================================
            EMPTY CART
        ====================================== */}

        <section className="flex min-h-screen items-center justify-center px-5 pt-[72px]">

          <div className="flex max-w-[430px] flex-col items-center text-center">

            <div className="mb-6 flex h-16 w-16 items-center justify-center border border-[#D8D1C8] bg-white">
              <FiShoppingBag className="h-5 w-5 text-[#625B55]" />
            </div>

            <p className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A837C]">
              Your shopping bag
            </p>

            <h1 className="mt-3 font-serif text-[36px] tracking-[-0.025em]">
              Your bag is empty.
            </h1>

            <p className="mt-3 font-['Plus_Jakarta_Sans'] text-[11px] leading-5 text-[#8A837C]">
              Explore our latest collection and
              discover something made for you.
            </p>

            <button
              onClick={() =>
                navigate("/")
              }
              className="mt-7 h-11 bg-[#211D1A] px-9 font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#4D4742]"
            >
              Continue shopping
            </button>

          </div>

        </section>

      </main>
    );
  }

  // ============================================
  // CART PAGE
  // ============================================

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#211D1A]">

      {/* ========================================
          FIXED HEADER
      ======================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-[#E1DBD4] bg-[#F8F6F2]">

        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* BACK */}

          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex h-9 w-9 items-center justify-center border border-[#D8D1C8] bg-white transition hover:border-[#211D1A]"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>

          {/* LOGO */}

          <button
            onClick={() =>
              navigate("/")
            }
            className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold tracking-[0.16em]"
          >
            SNITCH
          </button>

          {/* CART BUTTON */}

          <button
            type="button"
            aria-label="Shopping bag"
            onClick={
              handleCartButtonClick
            }
            className={`relative flex h-8 w-8 items-center justify-center rounded-[4px] border transition-all duration-300 ${
              bagPulse
                ? "scale-125 border-[#211D1A] bg-[#211D1A] text-white"
                : "scale-100 border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
            }`}
          >

            <FiShoppingBag
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                bagPulse
                  ? "animate-bounce"
                  : ""
              }`}
            />

            {bagPulse && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B54A42] opacity-75" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B54A42]" />

              </span>
            )}

            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B4603C] px-1 font-['Plus_Jakarta_Sans'] text-[7px] font-bold text-white">
                {totalItems}
              </span>
            )}

          </button>

        </div>

      </header>

      {/* ========================================
          MAIN
      ======================================== */}

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-[104px] sm:px-8 lg:px-10 lg:pt-[120px]">

        {/* ======================================
            TITLE
        ====================================== */}

        <div className="border-b border-[#E1DBD4] pb-7">

          <p className="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.22em] text-[#8A837C]">
            Shopping bag
          </p>

          <div className="mt-2 flex items-end justify-between">

            <h1 className="font-serif text-[38px] leading-none tracking-[-0.03em] sm:text-[48px]">
              Your Bag
            </h1>

            <span className="pb-1 font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}
            </span>

          </div>

        </div>

        {/* ======================================
            GRID
        ====================================== */}

        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">

          {/* ====================================
              CART ITEMS
          ==================================== */}

          <section>

            <div className="font-['Plus_Jakarta_Sans']">

              {cartItems.map(
                (item, index) => {

                  const product =
                    item?.product;

                  const image =
                    getItemImage(item);

                  const price =
                    getItemPrice(item);

                  const quantity =
                    Number(
                      item?.quantity
                    ) || 0;

                  const color =
                    getAttributeValue(
                      item,
                      "Color"
                    );

                  const size =
                    getAttributeValue(
                      item,
                      "Size"
                    );

                  return (
                    <article
                      key={
                        item?._id ||
                        `${product?._id}-${item?.variant}-${index}`
                      }
                      className="group flex gap-4 border-b border-[#E1DBD4] py-6 first:pt-0 sm:gap-6"
                    >

                      {/* PRODUCT IMAGE */}

                      <button
                        onClick={() =>
                          navigate(
                            `/product/${product?._id}`
                          )
                        }
                        className="h-[185px] w-[135px] shrink-0 overflow-hidden bg-[#EAE5E0] sm:h-[230px] sm:w-[175px]"
                      >

                        {image ? (
                          <img
                            src={image}
                            alt={
                              product?.title ||
                              "Product"
                            }
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FiShoppingBag className="h-5 w-5 text-[#AAA39B]" />
                          </div>
                        )}

                      </button>

                      {/* PRODUCT DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col">

                        {/* TOP */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                              SNITCH
                            </p>

                            <h2 className="mt-2 font-serif text-[22px] leading-tight tracking-[-0.02em] sm:text-[26px]">
                              {product?.title ||
                                "Product"}
                            </h2>

                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteItemId(
                                item?._id
                              )
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8D1C8] text-[#8A837C] transition hover:border-[#211D1A] hover:text-[#211D1A]"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>

                        {/* DESCRIPTION */}

                        <p className="mt-2 line-clamp-2 max-w-[500px] text-[10px] leading-5 text-[#8A837C]">
                          {product?.description}
                        </p>

                        {/* ATTRIBUTES */}

                        <div className="mt-4 flex flex-wrap gap-2">

                          {color && (
                            <div className="border border-[#D8D1C8] bg-white px-3 py-2">

                              <span className="text-[7px] uppercase tracking-[0.12em] text-[#8A837C]">
                                Color
                              </span>

                              <span className="ml-2 text-[8px] font-semibold uppercase tracking-[0.08em]">
                                {color}
                              </span>

                            </div>
                          )}

                          {size && (
                            <div className="border border-[#D8D1C8] bg-white px-3 py-2">

                              <span className="text-[7px] uppercase tracking-[0.12em] text-[#8A837C]">
                                Size
                              </span>

                              <span className="ml-2 text-[8px] font-semibold uppercase tracking-[0.08em]">
                                {size}
                              </span>

                            </div>
                          )}

                        </div>

                        {/* PRICE */}

                        <div className="mt-4">

                          <span className="text-[13px] font-semibold">
                            {formatPrice(
                              price
                            )}
                          </span>

                        </div>

                        {/* BOTTOM */}

                        <div className="mt-auto flex items-end justify-between gap-4 pt-5">

                          {/* QUANTITY */}

                          <div>

                            <p className="mb-2 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
                              Quantity
                            </p>

                            <div className="flex h-8 border border-[#D8D1C8] bg-white">

                              {/* MINUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDecreaseQuantity(
                                    item
                                  )
                                }
                                className="flex w-8 items-center justify-center transition hover:bg-[#EEEAE5]"
                              >
                                <FiMinus className="h-3 w-3" />
                              </button>

                              {/* QUANTITY */}

                              <span className="flex min-w-[34px] items-center justify-center border-x border-[#D8D1C8] text-[9px] font-semibold">
                                {quantity}
                              </span>

                              {/* PLUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleIncreaseQuantity(
                                    item
                                  )
                                }
                                className="flex w-8 items-center justify-center transition hover:bg-[#EEEAE5]"
                              >
                                <FiPlus className="h-3 w-3" />
                              </button>

                            </div>

                          </div>

                          {/* ITEM TOTAL */}

                          <div className="text-right">

                            <p className="mb-2 text-[7px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
                              Total
                            </p>

                            <p className="text-[13px] font-semibold">
                              {formatPrice(
                                price *
                                quantity
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>

          {/* ====================================
              SUMMARY
          ==================================== */}

          <aside className="lg:sticky lg:top-[96px] lg:self-start">

            <div className="border border-[#E1DBD4] bg-white p-6 sm:p-7">

              {/* SUMMARY HEADER */}

              <div className="flex items-center justify-between">

                <p className="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                  Order summary
                </p>

                <span className="font-['Plus_Jakarta_Sans'] text-[8px] uppercase tracking-[0.1em] text-[#8A837C]">
                  {totalItems} items
                </span>

              </div>

              {/* SUMMARY LINES */}

              <div className="mt-7 space-y-4 border-b border-[#E1DBD4] pb-6">

                {/* SUBTOTAL */}

                <div className="flex items-center justify-between">

                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8A837C]">
                    Subtotal
                  </span>

                  <span className="text-[11px] font-semibold">
                    {formatPrice(
                      subtotal
                    )}
                  </span>

                </div>

                {/* SHIPPING */}

                <div className="flex items-center justify-between">

                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8A837C]">
                    Shipping
                  </span>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.08em]">
                    Free
                  </span>

                </div>

              </div>

              {/* TOTAL */}

              <div className="flex items-end justify-between py-6">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                    Total
                  </p>

                  <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-[#8A837C]">
                    Inclusive of all taxes
                  </p>

                </div>

                <p className="text-[20px] font-semibold tracking-[-0.02em]">
                  {formatPrice(
                    subtotal
                  )}
                </p>

              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                className="flex h-12 w-full items-center justify-center bg-[#211D1A] font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#4D4742]"
              >
                Proceed to checkout
              </button>

              {/* CONTINUE SHOPPING */}

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="mt-2 flex h-12 w-full items-center justify-center border border-[#211D1A] bg-transparent font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.17em] text-[#211D1A] transition hover:bg-[#EEEAE5]"
              >
                Continue shopping
              </button>

              {/* INFO */}

              <div className="mt-6 border-t border-[#E1DBD4] pt-5">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 h-1.5 w-1.5" />

                  <p className="text-[8px] leading-4 text-[#8A837C]">
                    Free shipping is available
                    on your order. Your final
                    shipping charges will be
                    calculated at checkout.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

      {/* ========================================
          REMOVE / WISHLIST POPUP
      ======================================== */}

      {deleteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211D1A]/40 px-5">

          <div className="w-full max-w-[400px] border border-[#D8D1C8] bg-[#F8F6F2] p-7 shadow-xl">

            {/* POPUP HEADER */}

            <div className="flex items-start justify-between">

              <div>

                <p className="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                  Shopping bag
                </p>

                <h2 className="mt-2 font-serif text-[28px] leading-tight tracking-[-0.02em]">
                  What would you like to do?
                </h2>

              </div>

              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setDeleteItemId(null)
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8D1C8] bg-white text-[18px] text-[#8A837C] transition hover:border-[#211D1A] hover:text-[#211D1A]"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* MESSAGE */}

            <p className="mt-4 font-['Plus_Jakarta_Sans'] text-[10px] leading-5 text-[#8A837C]">
              You can remove this item from your
              bag or save it to your wishlist for
              later.
            </p>

            {/* ACTIONS */}

            <div className="mt-7 space-y-2">

              {/* MOVE TO WISHLIST */}

              <button
                type="button"
                onClick={
                  handleMoveToWishlist
                }
                className="flex h-11 w-full items-center justify-center border border-[#211D1A] bg-white font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.15em] text-[#211D1A] transition hover:bg-[#EEEAE5]"
              >
                Move to Wishlist
              </button>

              {/* REMOVE FROM BAG */}

              <button
                type="button"
                onClick={
                  handleDelete
                }
                className="flex h-11 w-full items-center justify-center bg-[#211D1A] font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#4D4742]"
              >
                Remove from Bag
              </button>

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setDeleteItemId(null)
                }
                className="flex h-10 w-full items-center justify-center font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C] transition hover:text-[#211D1A]"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
};

export default Cart;

