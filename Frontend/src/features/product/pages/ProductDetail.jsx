import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMenu,
  FiShoppingBag,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import { useProduct } from "../hooks/useProduct";
import { useCart } from "../../cart/hooks/useCart";
import { useWishlist } from "../../wishlist/hooks/useWishlist";

// =========================================================
// FORMAT PRICE
// =========================================================

const formatPrice = (price) => {
  if (!price) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: price.currency || "INR",
    maximumFractionDigits: 0,
  }).format(Number(price.amount || 0));
};

// =========================================================
// NORMALIZE ATTRIBUTES
// =========================================================

const normalizeAttributes = (attributes) => {
  if (!attributes) {
    return {};
  }

  if (attributes instanceof Map) {
    return Object.fromEntries(attributes);
  }

  if (
    typeof attributes === "object" &&
    !Array.isArray(attributes)
  ) {
    return attributes;
  }

  return {};
};

// =========================================================
// SPLIT ATTRIBUTE VALUES
// =========================================================

const splitAttributeValues = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (typeof value !== "string") {
    return [String(value)];
  }

  return value
    .split(/[,.|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

// =========================================================
// GET IMAGE URL
// =========================================================

const getImageUrl = (image) => {
  return (
    image?.url ||
    image?.thumbnailUrl ||
    image?.filePath ||
    ""
  );
};

// =========================================================
// PRODUCT DETAIL
// =========================================================

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const {
    handleGetProductById,
  } = useProduct();

  const {
    handleAddToCart,
  } = useCart();

  const {
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    isWishlisted,
  } = useWishlist();

  const wishlisted = isWishlisted(productId);

  // =======================================================
  // WISHLIST
  // =======================================================

  const handleWishlist = async () => {
    if (!productId) {
      return;
    }

    try {
      if (wishlisted) {
        await handleRemoveFromWishlist(productId);
      } else {
        await handleAddToWishlist(productId);
      }
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error
      );
    }
  };

  useEffect(() => {
    handleGetWishlist();
  }, [productId]);

  // =======================================================
  // STATE
  // =======================================================

  const [product, setProduct] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [selectedAttributes, setSelectedAttributes] =
    useState({});

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [addedToCart, setAddedToCart] =
    useState(false);

  const [bagPulse, setBagPulse] =
    useState(false);

  // =======================================================
  // FETCH PRODUCT
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      if (!productId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await handleGetProductById(productId);

        const productData =
          response?.data?.product ||
          response?.data ||
          response?.product ||
          response ||
          null;

        if (!mounted) {
          return;
        }

        if (!productData) {
          setError("Product not found.");
          setProduct(null);
          return;
        }

        setProduct(productData);
        setSelectedImage(0);
        setSelectedAttributes({});
        setAddedToCart(false);
      } catch (err) {
        console.error(
          "Failed to fetch product:",
          err
        );

        if (mounted) {
          setProduct(null);

          setError(
            err?.response?.data?.message ||
              "Unable to load product."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // =======================================================
  // ALL ATTRIBUTE NAMES
  // =======================================================

  const attributeNames = useMemo(() => {
    if (
      !product ||
      !Array.isArray(product.variants)
    ) {
      return [];
    }

    const names = new Map();

    product.variants.forEach((variant) => {
      const attributes =
        normalizeAttributes(
          variant?.attributes
        );

      Object.keys(attributes).forEach(
        (key) => {
          const normalized =
            key.trim().toLowerCase();

          if (!names.has(normalized)) {
            names.set(
              normalized,
              key.trim()
            );
          }
        }
      );
    });

    return Array.from(
      names.values()
    );
  }, [product]);

  // =======================================================
  // GET ATTRIBUTE VALUES
  // =======================================================

  const getAttributeValues = (
    attributeName
  ) => {
    if (
      !product ||
      !Array.isArray(product.variants)
    ) {
      return [];
    }

    const values = new Map();

    product.variants.forEach(
      (variant) => {
        const attributes =
          normalizeAttributes(
            variant?.attributes
          );

        const actualKey =
          Object.keys(attributes).find(
            (key) =>
              key.toLowerCase().trim() ===
              attributeName
                .toLowerCase()
                .trim()
          );

        if (!actualKey) {
          return;
        }

        const attributeValues =
          splitAttributeValues(
            attributes[actualKey]
          );

        attributeValues.forEach(
          (value) => {
            const cleanValue =
              value.trim();

            const normalized =
              cleanValue.toLowerCase();

            if (!values.has(normalized)) {
              values.set(
                normalized,
                cleanValue
              );
            }
          }
        );
      }
    );

    return Array.from(
      values.values()
    );
  };

  // =======================================================
  // GET VALUES FROM VARIANT
  // =======================================================

  const getVariantAttributeValues = (
    variant,
    attributeName
  ) => {
    const attributes =
      normalizeAttributes(
        variant?.attributes
      );

    const actualKey =
      Object.keys(attributes).find(
        (key) =>
          key.toLowerCase().trim() ===
          attributeName
            .toLowerCase()
            .trim()
      );

    if (!actualKey) {
      return [];
    }

    return splitAttributeValues(
      attributes[actualKey]
    );
  };

  // =======================================================
  // FIND SELECTED VARIANT
  // =======================================================

  const selectedVariant = useMemo(() => {
    if (
      !product ||
      !Array.isArray(product.variants) ||
      product.variants.length === 0
    ) {
      return null;
    }

    if (
      attributeNames.length === 0
    ) {
      return product.variants[0];
    }

    const allSelected =
      attributeNames.every(
        (attributeName) =>
          selectedAttributes[
            attributeName
          ]
      );

    if (!allSelected) {
      return null;
    }

    return (
      product.variants.find(
        (variant) => {
          return attributeNames.every(
            (attributeName) => {
              const selectedValue =
                selectedAttributes[
                  attributeName
                ];

              const variantValues =
                getVariantAttributeValues(
                  variant,
                  attributeName
                );

              return variantValues.some(
                (variantValue) =>
                  variantValue
                    .trim()
                    .toLowerCase() ===
                  String(
                    selectedValue
                  )
                    .trim()
                    .toLowerCase()
              );
            }
          );
        }
      ) || null
    );
  }, [
    product,
    attributeNames,
    selectedAttributes,
  ]);

  // =======================================================
  // CHECK ATTRIBUTE AVAILABILITY
  // =======================================================

  const isAttributeValueAvailable = (
    attributeName,
    value
  ) => {
    if (
      !product ||
      !Array.isArray(product.variants)
    ) {
      return false;
    }

    return product.variants.some(
      (variant) => {
        if (!variant) {
          return false;
        }

        const variantStock =
          Number(
            variant.stock || 0
          );

        if (variantStock <= 0) {
          return false;
        }

        const currentValues =
          getVariantAttributeValues(
            variant,
            attributeName
          );

        const currentMatches =
          currentValues.some(
            (variantValue) =>
              variantValue
                .trim()
                .toLowerCase() ===
              String(value)
                .trim()
                .toLowerCase()
          );

        if (!currentMatches) {
          return false;
        }

        return Object.entries(
          selectedAttributes
        ).every(
          ([
            selectedAttribute,
            selectedValue,
          ]) => {
            if (
              selectedAttribute ===
              attributeName
            ) {
              return true;
            }

            const variantValues =
              getVariantAttributeValues(
                variant,
                selectedAttribute
              );

            return variantValues.some(
              (variantValue) =>
                variantValue
                  .trim()
                  .toLowerCase() ===
                String(
                  selectedValue
                )
                  .trim()
                  .toLowerCase()
            );
          }
        );
      }
    );
  };

  // =======================================================
  // SELECT ATTRIBUTE
  // =======================================================

  const handleAttributeSelect = (
    attributeName,
    value
  ) => {
    setSelectedAttributes(
      (previous) => ({
        ...previous,
        [attributeName]: value,
      })
    );

    setSelectedImage(0);
    setAddedToCart(false);
  };

  // =======================================================
  // HAS VARIANTS
  // =======================================================

  const hasVariants =
    Array.isArray(product?.variants) &&
    product.variants.length > 0;

  // =======================================================
  // HAS ATTRIBUTES
  // =======================================================

  const hasAttributes =
    attributeNames.length > 0;

  // =======================================================
  // ALL ATTRIBUTES SELECTED
  // =======================================================

  const allAttributesSelected =
    !hasAttributes ||
    attributeNames.every(
      (attributeName) =>
        selectedAttributes[
          attributeName
        ]
    );

  // =======================================================
  // ACTIVE PRICE
  // =======================================================

  const activePrice =
    selectedVariant?.price ||
    product?.price ||
    null;

  // =======================================================
  // ACTIVE STOCK
  // =======================================================

  const activeStock =
    selectedVariant?.stock ??
    (
      hasVariants
        ? 0
        : product?.stock ?? 0
    );

  // =======================================================
  // STOCK STATUS
  // =======================================================

  const stockStatus = (() => {
    if (
      hasVariants &&
      !allAttributesSelected
    ) {
      return "select";
    }

    if (
      hasVariants &&
      allAttributesSelected &&
      !selectedVariant
    ) {
      return "unavailable";
    }

    return "known";
  })();

  // =======================================================
  // ACTIVE IMAGES
  // =======================================================

  const activeProductImages =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : product?.images || [];

  // =======================================================
  // FORMAT IMAGES
  // =======================================================

  const productImages =
    activeProductImages
      .map((image) => ({
        url: getImageUrl(image),
      }))
      .filter(
        (image) => image.url
      );

  // =======================================================
  // FALLBACK IMAGE
  // =======================================================

  const images =
    productImages.length > 0
      ? productImages
      : [
          {
            url:
              "/snitch_editorial_warm.png",
          },
        ];

  // =======================================================
  // RESET IMAGE WHEN VARIANT CHANGES
  // =======================================================

  useEffect(() => {
    setSelectedImage(0);
    setAddedToCart(false);
  }, [
    selectedVariant?._id,
  ]);

  // =======================================================
  // CAN ADD TO CART
  // =======================================================

  const canAddToCart =
    stockStatus === "known" &&
    Number(activeStock) > 0 &&
    allAttributesSelected &&
    (
      !hasVariants ||
      selectedVariant !== null
    );

  // =======================================================
  // ADD TO CART
  // =======================================================

  const handleAddProductToCart =
    async () => {
      if (
        !canAddToCart ||
        addingToCart
      ) {
        return;
      }

      try {
        setAddingToCart(true);

        const payload = {
          productId:
            product?._id,

          variantId:
            selectedVariant?._id ||
            null,

          quantity: 1,

          selectedAttributes: {
            ...selectedAttributes,
          },
        };

        console.log(
          "ADDING TO CART:",
          payload
        );

        console.log(
          "SELECTED ATTRIBUTES:",
          selectedAttributes
        );

        await handleAddToCart(
          payload
        );

        setAddedToCart(true);
        setBagPulse(true);

        setTimeout(() => {
          setBagPulse(false);
        }, 900);
      } catch (err) {
        console.error(
          "FAILED TO ADD PRODUCT TO CART:",
          err
        );
      } finally {
        setAddingToCart(false);
      }
    };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">
        <p className="animate-pulse text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
          Retrieving product...
        </p>
      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">
        <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
          {error || "Product not found"}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mt-[1.25rem] border border-[#211D1A] px-[1.25rem] py-[0.75rem] text-[0.5625rem] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#211D1A] hover:text-white"
        >
          Go back
        </button>
      </main>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="min-h-screen bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">

      {/* =================================================
          FIXED HEADER
      ================================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[4rem] border-b border-[#E1DBD4] bg-[#F8F6F2]/95 backdrop-blur-md">

        <div className="mx-auto flex h-full max-w-[73.75rem] items-center justify-between px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">

          {/* LEFT */}

          <div className="flex items-center gap-[0.75rem]">

            <button
              type="button"
              aria-label="Open menu"
              className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.25rem] border border-[#D8D1C8] bg-white transition hover:border-[#211D1A]"
            >
              <FiMenu className="h-[0.875rem] w-[0.875rem]" />
            </button>

            <span className="hidden text-[0.5rem] font-medium uppercase tracking-[0.18em] text-[#8A837C] sm:block">
              Modern essentials
            </span>

          </div>

          {/* LOGO */}

          <Link
            to="/"
            className="text-[1.125rem] font-bold tracking-[0.13em] transition-opacity hover:opacity-70"
          >
            SNITCH
          </Link>

          {/* RIGHT */}

          <div className="flex items-center gap-[0.75rem]">

            

            {/* WISHLIST */}

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                navigate("/wishlist")
              }
              className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.25rem] border border-[#D8D1C8] bg-white text-[#211D1A] transition-all duration-300 hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
            >
              <FiHeart className="h-[0.875rem] w-[0.875rem]" />
            </button>

            {/* SHOPPING BAG */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() =>
                navigate("/cart")
              }
              className={`relative flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.25rem] border transition-all duration-300 ${
                bagPulse
                  ? "scale-125 border-[#211D1A] bg-[#211D1A] text-white"
                  : "scale-100 border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
              }`}
            >

              <FiShoppingBag
                className={`h-[0.875rem] w-[0.875rem] transition-transform duration-300 ${
                  bagPulse
                    ? "animate-bounce"
                    : ""
                }`}
              />

              {bagPulse && (
                <span className="absolute -right-[0.25rem] -top-[0.25rem] flex h-[0.625rem] w-[0.625rem]">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B54A42] opacity-75" />

                  <span className="relative inline-flex h-[0.625rem] w-[0.625rem] rounded-full bg-[#B54A42]" />

                </span>
              )}

            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          PAGE CONTAINER
      ================================================= */}

      <div className="mx-auto max-w-[73.75rem] px-[1rem] pb-[1.25rem] pt-[4.25rem] sm:px-[1.5rem] lg:px-[2rem]">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mt-[0.75rem] flex items-center gap-[0.5rem] text-[0.5rem] font-semibold uppercase tracking-[0.15em] text-[#8A837C] transition hover:text-[#211D1A]"
        >
          <FiArrowLeft className="h-[0.75rem] w-[0.75rem]" />
          Back to products
        </button>

        {/* =================================================
            PRODUCT AREA
        ================================================= */}

        <div className="grid gap-[2rem] py-[1.5rem] md:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.8fr)] md:gap-[3rem] lg:gap-[4rem] lg:py-[2rem]">

          {/* =================================================
              IMAGE GALLERY
          ================================================= */}

          <section className="flex min-w-0 gap-[0.625rem]">

            {/* THUMBNAILS */}

            <div className="hidden w-[3.625rem] shrink-0 flex-col gap-[0.375rem] sm:flex">

              {images.map(
                (image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        index
                      )
                    }
                    className={`h-[4.5rem] w-[3.625rem] overflow-hidden rounded-[0.1875rem] border bg-white transition ${
                      selectedImage ===
                      index
                        ? "border-[#211D1A]"
                        : "border-[#E1DBD4] hover:border-[#8A837C]"
                    }`}
                  >

                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                  </button>
                )
              )}

            </div>

            {/* MAIN IMAGE */}

            <div className="min-w-0 flex-1">

              <div className="group relative mx-auto aspect-[4/5] w-full max-w-[27.5rem] overflow-hidden rounded-[0.25rem] bg-[#EAE5E0]">

                <img
                  src={
                    images[
                      selectedImage
                    ]?.url ||
                    images[0]?.url
                  }
                  alt={
                    product?.title ||
                    "Product"
                  }
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          (previous) =>
                            previous ===
                            0
                              ? images.length - 1
                              : previous - 1
                        )
                      }
                      aria-label="Previous image"
                      className="absolute left-[0.5rem] top-1/2 flex h-[2rem] w-[2rem] -translate-y-1/2 items-center justify-center rounded-[0.1875rem] border border-[#D8D1C8] bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      <FiChevronLeft className="h-[0.875rem] w-[0.875rem]" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          (previous) =>
                            previous ===
                            images.length - 1
                              ? 0
                              : previous + 1
                        )
                      }
                      aria-label="Next image"
                      className="absolute right-[0.5rem] top-1/2 flex h-[2rem] w-[2rem] -translate-y-1/2 items-center justify-center rounded-[0.1875rem] border border-[#D8D1C8] bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      <FiChevronRight className="h-[0.875rem] w-[0.875rem]" />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-[0.75rem] right-[0.75rem] bg-[#211D1A]/85 px-[0.625rem] py-[0.375rem] text-[0.4375rem] font-semibold uppercase tracking-[0.12em] text-white">
                    {selectedImage + 1} /{" "}
                    {images.length}
                  </div>
                )}

              </div>

              {/* MOBILE THUMBNAILS */}

              <div className="mt-[0.625rem] flex gap-[0.375rem] overflow-x-auto sm:hidden">

                {images.map(
                  (image, index) => (
                    <button
                      key={`${image.url}-mobile-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                      className={`h-[3.625rem] w-[2.875rem] shrink-0 overflow-hidden rounded-[0.1875rem] border bg-white ${
                        selectedImage ===
                        index
                          ? "border-[#211D1A]"
                          : "border-[#E1DBD4]"
                      }`}
                    >

                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                    </button>
                  )
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <section className="flex flex-col md:pt-[0.5rem]">

            {/* TITLE */}

            <div className="flex items-start justify-between gap-[1rem] border-b border-[#E1DBD4] pb-[1.25rem]">

              <div>

                <p className="text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                  Product detail
                </p>

                <h1 className="mt-[0.625rem] font-serif text-[1.875rem] leading-[1.05] tracking-[-0.025em] sm:text-[2.375rem]">
                  {product?.title ||
                    "Untitled product"}
                </h1>

              </div>

              <button
                type="button"
                onClick={handleWishlist}
                aria-label={
                  wishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className="flex h-[2rem] w-[2rem] shrink-0 items-center justify-center rounded-[0.25rem] border border-[#D8D1C8] bg-white transition hover:border-[#211D1A] hover:bg-[#EEEAE5]"
              >
                <FiHeart
                  className={`h-[0.875rem] w-[0.875rem] transition ${
                    wishlisted
                      ? "fill-current"
                      : ""
                  }`}
                />
              </button>

            </div>

            {/* PRICE */}

            <div className="flex items-center justify-between border-b border-[#E1DBD4] py-[1rem]">

              <span className="text-[1rem] font-semibold sm:text-[1.125rem]">
                {formatPrice(
                  activePrice
                )}
              </span>

              {stockStatus ===
                "select" && (
                <span className="text-[0.5rem] font-semibold uppercase tracking-[0.13em] text-[#8A837C]">
                  Select options
                </span>
              )}

              {stockStatus ===
                "unavailable" && (
                <span className="text-[0.5rem] font-semibold uppercase tracking-[0.13em] text-[#B54A42]">
                  Combination unavailable
                </span>
              )}

              {stockStatus ===
                "known" && (
                <span
                  className={`text-[0.5rem] font-semibold uppercase tracking-[0.13em] ${
                    Number(activeStock) > 0
                      ? "text-[#8A837C]"
                      : "text-[#B54A42]"
                  }`}
                >
                  {Number(activeStock) > 0
                    ? `${activeStock} In stock`
                    : "Out of stock"}
                </span>
              )}

            </div>

            {/* =================================================
                VARIANTS
            ================================================= */}

            {hasAttributes && (
              <div className="border-b border-[#E1DBD4] py-[1.25rem]">

                <div className="mb-[1.25rem] flex items-center justify-between">

                  <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                    Select options
                  </p>

                  {selectedVariant && (
                    <span className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#625B55]">
                      Selected
                    </span>
                  )}

                </div>

                <div className="space-y-[1.25rem]">

                  {attributeNames.map(
                    (attributeName) => {
                      const values =
                        getAttributeValues(
                          attributeName
                        );

                      return (
                        <div
                          key={
                            attributeName
                          }
                        >

                          <div className="mb-[0.625rem] flex items-center justify-between">

                            <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em]">
                              {
                                attributeName
                              }
                            </span>

                            {selectedAttributes[
                              attributeName
                            ] && (
                              <span className="text-[0.5rem] uppercase tracking-[0.1em] text-[#8A837C]">
                                {
                                  selectedAttributes[
                                    attributeName
                                  ]
                                }
                              </span>
                            )}

                          </div>

                          <div className="flex flex-wrap gap-[0.375rem]">

                            {values.map(
                              (value) => {
                                const selected =
                                  selectedAttributes[
                                    attributeName
                                  ] ===
                                  value;

                                const available =
                                  isAttributeValueAvailable(
                                    attributeName,
                                    value
                                  );

                                return (
                                  <button
                                    key={`${attributeName}-${value}`}
                                    type="button"
                                    disabled={
                                      !available
                                    }
                                    onClick={() =>
                                      handleAttributeSelect(
                                        attributeName,
                                        value
                                      )
                                    }
                                    className={`min-w-[3rem] border px-[0.875rem] py-[0.625rem] text-[0.5625rem] font-semibold uppercase tracking-[0.1em] transition ${
                                      selected
                                        ? "border-[#211D1A] bg-[#211D1A] text-white"
                                        : available
                                        ? "border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A]"
                                        : "cursor-not-allowed border-[#E7E2DC] bg-[#F4F1ED] text-[#B8B1AA] line-through"
                                    }`}
                                  >
                                    {value}
                                  </button>
                                );
                              }
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {hasVariants &&
                  !allAttributesSelected && (
                    <p className="mt-[1.25rem] border-l-2 border-[#B54A42] pl-[0.75rem] text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#B54A42]">
                      Please select all options
                    </p>
                  )}

                {selectedVariant &&
                  Number(
                    selectedVariant.stock
                  ) > 0 && (
                    <div className="mt-[1.25rem] flex items-center justify-between border-t border-[#E7E2DC] pt-[1rem]">

                      <span className="text-[0.5rem] uppercase tracking-[0.12em] text-[#8A837C]">
                        Variant availability
                      </span>

                      <span className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#211D1A]">
                        Available
                      </span>

                    </div>
                  )}

              </div>
            )}

            {/* DESCRIPTION */}

            <div className="border-b border-[#E1DBD4] py-[1.25rem]">

              <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                About this piece
              </p>

              <p className="mt-[0.625rem] max-w-xl text-[0.75rem] leading-[1.5rem] text-[#625B55]">
                {product?.description ||
                  "A considered essential for your everyday wardrobe."}
              </p>

            </div>

            {/* SHIPPING */}

            <div className="py-[1.25rem]">

              <div className="grid gap-[0.625rem] text-[0.5rem] uppercase tracking-[0.11em] text-[#8A837C]">

                <div className="flex items-center justify-between border-b border-[#E7E2DC] pb-[0.625rem]">

                  <span>
                    Shipping
                  </span>

                  <span className="text-right text-[#625B55]">
                    Complimentary over INR 15,000
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-[#E7E2DC] pb-[0.625rem]">

                  <span>
                    Returns
                  </span>

                  <span className="text-right text-[#625B55]">
                    Within 14 days
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span>
                    Authenticity
                  </span>

                  <span className="text-right text-[#625B55]">
                    100% guaranteed
                  </span>

                </div>

              </div>

            </div>

            {/* ACTION BUTTONS */}

            <div className="grid gap-[0.5rem] sm:grid-cols-2">

              <button
                type="button"
                disabled={
                  !addedToCart &&
                  (
                    !canAddToCart ||
                    addingToCart
                  )
                }
                onClick={
                  addedToCart
                    ? () =>
                        navigate(
                          "/cart"
                        )
                    : handleAddProductToCart
                }
                className={`flex h-[2.75rem] items-center justify-center gap-[0.5rem] rounded-[0.1875rem] text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                  addedToCart
                    ? "bg-[#211D1A] hover:bg-[#554D47]"
                    : "bg-[#211D1A] hover:bg-[#554D47]"
                }`}
              >

                {addedToCart ? (
                  <FiCheck className="h-[0.875rem] w-[0.875rem] animate-[bounce_0.6s_ease-in-out_1]" />
                ) : (
                  <FiShoppingBag className="h-[0.875rem] w-[0.875rem]" />
                )}

                {addingToCart
                  ? "Adding..."
                  : addedToCart
                  ? "Go to cart"
                  : "Add to cart"}

              </button>

              <button
                type="button"
                disabled={
                  !canAddToCart
                }
                className="h-[2.75rem] rounded-[0.1875rem] border border-[#211D1A] bg-transparent text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[#211D1A] transition hover:bg-[#EEEAE5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy now
              </button>

            </div>

            {hasVariants &&
              !selectedVariant &&
              !addedToCart && (
                <p className="mt-[0.75rem] text-center text-[0.4375rem] uppercase tracking-[0.12em] text-[#AAA39B]">
                  Select color and size to continue
                </p>
              )}

          </section>

        </div>

      </div>

    </main>
  );
};

export default ProductDetail;