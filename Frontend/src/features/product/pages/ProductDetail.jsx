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

  // Turns the button into "Go to cart" after a successful add
  const [addedToCart, setAddedToCart] =
    useState(false);

  // Drives the brief bag-icon animation in the header
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
              key.toLowerCase() ===
              attributeName.toLowerCase()
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
          key.toLowerCase() ===
          attributeName.toLowerCase()
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

        // Don't allow out-of-stock variants
        if (variantStock <= 0) {
          return false;
        }

        // Current attribute must match
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

        // Other selected attributes must match
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

    // Changing the variant means "Add to cart" should reappear
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
        };

        console.log(
          "Adding to cart:",
          payload
        );

        await handleAddToCart(
          payload
        );

        // Swap the button into "Go to cart" instead of showing a message
        setAddedToCart(true);

        // Briefly pulse the bag icon in the header
        setBagPulse(true);

        setTimeout(() => {
          setBagPulse(false);
        }, 900);

      } catch (err) {
        console.error(
          "Failed to add product to cart:",
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

        <p className="animate-pulse text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
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

        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
          {error || "Product not found"}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mt-5 border border-[#211D1A] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#211D1A] hover:text-white"
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

      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex h-12 items-center justify-between border-b border-[#E1DBD4]">

          <div className="flex items-center gap-3">

            <button
              type="button"
              aria-label="Open menu"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#D8D1C8] bg-white transition hover:border-[#211D1A]"
            >
              <FiMenu className="h-3.5 w-3.5" />
            </button>

            <span className="hidden text-[8px] font-medium uppercase tracking-[0.18em] text-[#8A837C] sm:block">
              Modern essentials
            </span>

          </div>


          <Link
            to="/"
            className="text-[18px] font-bold tracking-[0.13em] transition-opacity hover:opacity-70"
          >
            SNITCH
          </Link>


          <div className="flex items-center gap-4">

            <Link
              to="/"
              className="hidden text-[8px] font-semibold uppercase tracking-[0.14em] text-[#625B55] hover:text-[#211D1A] sm:block"
            >
              Shop
            </Link>

            <Link
              to="/login"
              className="hidden text-[8px] font-semibold uppercase tracking-[0.14em] text-[#625B55] hover:text-[#211D1A] sm:block"
            >
              Sign in
            </Link>

            {/* BAG ICON — pulses + shows a ping badge briefly after an add-to-cart */}
            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() =>
                navigate("/cart")
              }
              className={`relative flex h-8 w-8 items-center justify-center rounded-[4px] border transition-all duration-300 ${
                bagPulse
                  ? "scale-125 border-[#211D1A] bg-[#211D1A] text-white"
                  : "scale-100 border-[#D8D1C8] bg-white text-[#211D1A] hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
              }`}
            >
              <FiShoppingBag
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  bagPulse ? "animate-bounce" : ""
                }`}
              />

              {bagPulse && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B54A42] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#B54A42]" />
                </span>
              )}
            </button>

          </div>

        </header>


        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mt-5 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C] transition hover:text-[#211D1A]"
        >
          <FiArrowLeft className="h-3 w-3" />
          Back to products
        </button>


        {/* =================================================
            PRODUCT AREA
        ================================================= */}

        <div className="grid gap-8 py-6 md:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.8fr)] md:gap-12 lg:gap-16 lg:py-8">


          {/* =================================================
              IMAGE GALLERY
          ================================================= */}

          <section className="flex min-w-0 gap-2.5">


            {/* THUMBNAILS */}

            <div className="hidden w-[58px] shrink-0 flex-col gap-1.5 sm:flex">

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
                    className={`h-[72px] w-[58px] overflow-hidden rounded-[3px] border bg-white transition ${
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

              <div className="group relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[4px] bg-[#EAE5E0]">

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


                {/* IMAGE ARROWS */}

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
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[3px] border border-[#D8D1C8] bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      <FiChevronLeft className="h-3.5 w-3.5" />
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
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[3px] border border-[#D8D1C8] bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}


                {/* IMAGE COUNT */}

                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-[#211D1A]/85 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-white">
                    {selectedImage + 1} /{" "}
                    {images.length}
                  </div>
                )}

              </div>


              {/* MOBILE THUMBNAILS */}

              <div className="mt-2.5 flex gap-1.5 overflow-x-auto sm:hidden">

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
                      className={`h-[58px] w-[46px] shrink-0 overflow-hidden rounded-[3px] border bg-white ${
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

          <section className="flex flex-col md:pt-2">


            {/* TITLE */}

            <div className="flex items-start justify-between gap-4 border-b border-[#E1DBD4] pb-5">

              <div>

                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                  Product detail
                </p>

                <h1 className="mt-2.5 font-serif text-3xl leading-[1.05] tracking-[-0.025em] sm:text-[38px]">
                  {product?.title ||
                    "Untitled product"}
                </h1>

              </div>


              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#D8D1C8] bg-white transition hover:border-[#211D1A] hover:bg-[#EEEAE5]"
              >
                <FiHeart className="h-3.5 w-3.5" />
              </button>

            </div>


            {/* PRICE */}

            <div className="flex items-center justify-between border-b border-[#E1DBD4] py-4">

              <span className="text-base font-semibold sm:text-lg">
                {formatPrice(
                  activePrice
                )}
              </span>

              {stockStatus === "select" && (
                <span className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#8A837C]">
                  Select options
                </span>
              )}

              {stockStatus === "unavailable" && (
                <span className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#B54A42]">
                  Combination unavailable
                </span>
              )}

              {stockStatus === "known" && (
                <span
                  className={`text-[8px] font-semibold uppercase tracking-[0.13em] ${
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
              <div className="border-b border-[#E1DBD4] py-5">

                <div className="mb-5 flex items-center justify-between">

                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                    Select options
                  </p>

                  {selectedVariant && (
                    <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#625B55]">
                      Selected
                    </span>
                  )}

                </div>


                <div className="space-y-5">

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

                          <div className="mb-2.5 flex items-center justify-between">

                            <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                              {
                                attributeName
                              }
                            </span>

                            {selectedAttributes[
                              attributeName
                            ] && (
                              <span className="text-[8px] uppercase tracking-[0.1em] text-[#8A837C]">
                                {
                                  selectedAttributes[
                                    attributeName
                                  ]
                                }
                              </span>
                            )}

                          </div>


                          <div className="flex flex-wrap gap-1.5">

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
                                    className={`min-w-[48px] border px-3.5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${
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


                {/* SELECTION MESSAGE */}

                {hasVariants &&
                  !allAttributesSelected && (
                    <p className="mt-5 border-l-2 border-[#B54A42] pl-3 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#B54A42]">
                      Please select all options
                    </p>
                  )}

                {selectedVariant &&
                  Number(
                    selectedVariant.stock
                  ) > 0 && (
                    <div className="mt-5 flex items-center justify-between border-t border-[#E7E2DC] pt-4">

                      <span className="text-[8px] uppercase tracking-[0.12em] text-[#8A837C]">
                        Variant availability
                      </span>

                      <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#211D1A]">
                        Available
                      </span>

                    </div>
                  )}

              </div>
            )}


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="border-b border-[#E1DBD4] py-5">

              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                About this piece
              </p>

              <p className="mt-2.5 max-w-xl text-[12px] leading-6 text-[#625B55]">
                {product?.description ||
                  "A considered essential for your everyday wardrobe."}
              </p>

            </div>


            {/* =================================================
                SHIPPING
            ================================================= */}

            <div className="py-5">

              <div className="grid gap-2.5 text-[8px] uppercase tracking-[0.11em] text-[#8A837C]">

                <div className="flex items-center justify-between border-b border-[#E7E2DC] pb-2.5">

                  <span>
                    Shipping
                  </span>

                  <span className="text-right text-[#625B55]">
                    Complimentary over INR 15,000
                  </span>

                </div>


                <div className="flex items-center justify-between border-b border-[#E7E2DC] pb-2.5">

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


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="grid gap-2 sm:grid-cols-2">

              {/* ADD TO CART / GO TO CART — swaps state + style once the item is added */}
             <button
  type="button"
  disabled={
    !addedToCart &&
    (!canAddToCart ||
      addingToCart)
  }
  onClick={
    addedToCart
      ? () => navigate("/cart")
      : handleAddProductToCart
  }
  className={`flex h-11 items-center justify-center gap-2 rounded-[3px] text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
    addedToCart
      ? "bg-[#211D1A] hover:bg-[#554D47]"
      : "bg-[#211D1A] hover:bg-[#554D47]"
  }`}
>
  {addedToCart ? (
    <FiCheck className="h-3.5 w-3.5 animate-[bounce_0.6s_ease-in-out_1]" />
  ) : (
    <FiShoppingBag className="h-3.5 w-3.5" />
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
                className="h-11 rounded-[3px] border border-[#211D1A] bg-transparent text-[9px] font-semibold uppercase tracking-[0.14em] text-[#211D1A] transition hover:bg-[#EEEAE5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Buy now
              </button>

            </div>


            {/* SELECTION HELPER */}

            {hasVariants &&
              !selectedVariant &&
              !addedToCart && (
                <p className="mt-3 text-center text-[7px] uppercase tracking-[0.12em] text-[#AAA39B]">
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
