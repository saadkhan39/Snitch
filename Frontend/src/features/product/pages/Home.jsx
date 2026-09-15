import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

import {
  FiArrowUpRight,
  FiChevronDown,
  FiChevronRight,
  FiHeart,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import { useProduct } from "../hooks/useProduct";
import { useWishlist } from "../../wishlist/hooks/useWishlist";
import useHero from "../../hero/hooks/useHero";

const formatPrice = (price) => {
  if (!price) return "Price not available";

  const amount = Number(price.amount ?? 0);
  const currency = price.currency || "INR";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getImageUrl = (image) => {
  if (!image) return null;

  return (
    image.url ||
    image.thumbnailUrl ||
    image.filePath ||
    image.secure_url ||
    null
  );
};

const getProductImage = (product, index = 0) => {
  if (!Array.isArray(product?.images)) return null;

  return getImageUrl(product.images[index]);
};

const getProductStock = (product) => {
  if (!product) return 0;

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce(
      (total, variant) => total + Number(variant?.stock ?? 0),
      0,
    );
  }

  return Number(product.stock ?? 0);
};

const normalizeText = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const CATEGORIES = [
  "All",
  "Outerwear",
  "Basics",
  "Tops",
  "Loungewear",
  "Accessories",
];

const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-[0.4375rem] border border-[#E5DFD8] bg-white">
    <div className="aspect-[4/5] animate-pulse bg-[#EAE5E0]" />

    <div className="space-y-[0.75rem] p-[1rem]">
      <div className="h-[1rem] w-3/4 animate-pulse rounded-[0.125rem] bg-[#EAE5E0]" />

      <div className="h-[0.625rem] w-full animate-pulse rounded-[0.125rem] bg-[#EFEBE5]" />

      <div className="h-[0.625rem] w-2/3 animate-pulse rounded-[0.125rem] bg-[#EFEBE5]" />

      <div className="flex items-center justify-between border-t border-[#E2DBD1] pt-[0.75rem]">
        <div className="h-[1rem] w-[4rem] animate-pulse rounded-[0.125rem] bg-[#EAE5E0]" />

        <div className="h-[2rem] w-[2rem] animate-pulse rounded-[0.25rem] bg-[#EAE5E0]" />
      </div>
    </div>
  </div>
);

const ProductImageFallback = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#EAE5E0] text-[#8A837C]">
    <div className="flex flex-col items-center gap-[0.5rem]">
      <FiPackage className="h-[2rem] w-[2rem]" />

      <span className="text-[0.4375rem] font-bold uppercase tracking-[0.16em]">
        No image
      </span>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  /*
    =====================================================
    WISHLIST
    =====================================================
  */

  const {
    wishlistItems,
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    isWishlisted,
  } = useWishlist();

  useEffect(() => {
    handleGetWishlist();
  }, []);

  /*
    =====================================================
    PRODUCTS
    =====================================================
  */

  const products = useSelector((state) => state.product?.allProducts ?? []);

  const { handleGetAllProducts } = useProduct();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  /*
    =====================================================
    HERO
    =====================================================
  */

  const {
    hero,
    isLoading: isHeroLoading,
    error: heroError,
    handleGetActiveHero,
  } = useHero();

  const [heroIndex, setHeroIndex] = useState(0);

  /*
    =====================================================
    HERO IMAGES FROM SELLER
    =====================================================
  */

  const heroImages = useMemo(() => {
    if (!Array.isArray(hero?.images)) {
      return [];
    }

    return hero.images.map((image) => getImageUrl(image)).filter(Boolean);
  }, [hero]);

  /*
    =====================================================
    LOAD HERO
    =====================================================
  */

  useEffect(() => {
    handleGetActiveHero();
  }, [handleGetActiveHero]);

  /*
    =====================================================
    RESET HERO SLIDER
    =====================================================
  */

  useEffect(() => {
    setHeroIndex(0);
  }, [heroImages.length]);

  /*
    =====================================================
    AUTO HERO SLIDER
    =====================================================
  */

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setHeroIndex((previousIndex) => {
        return (previousIndex + 1) % heroImages.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  /*
    =====================================================
    PRODUCT LOAD
    =====================================================
  */

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);

        await handleGetAllProducts();
      } catch (error) {
        console.error("Failed to load products:", error);

        if (isMounted) {
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
    =====================================================
    PRODUCT EDITORIAL IMAGES
    =====================================================
  */

  const featureImage =
    getProductImage(products[1]) || getProductImage(products[0]) || null;

  const secondaryImage =
    getProductImage(products[2]) ||
    getProductImage(products[1]) ||
    getProductImage(products[0]) ||
    null;

  /*
    =====================================================
    FILTER PRODUCTS
    =====================================================
  */

  const visibleProducts = useMemo(() => {
    const query = normalizeText(searchTerm);

    return products.filter((product) => {
      const productCategory = normalizeText(product?.category);

      const matchesCategory =
        activeCategory === "All" ||
        productCategory === normalizeText(activeCategory);

      const searchableText = [
        product?.title,
        product?.description,
        product?.category,
      ]
        .filter(Boolean)
        .join(" ");

      const matchesSearch =
        !query || normalizeText(searchableText).includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  /*
    =====================================================
    FILTER HELPERS
    =====================================================
  */

  const clearFilters = () => {
    setActiveCategory("All");
    setSearchTerm("");
  };

  const handleCategoryShortcut = (category) => {
    setActiveCategory(category);

    requestAnimationFrame(() => {
      document.getElementById("browse")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  /*
    =====================================================
    CHECK WISHLIST
    =====================================================
  */

  const isProductSaved = (productId) => {
    if (!productId || !wishlistItems) {
      return false;
    }

    if (typeof isWishlisted === "function") {
      try {
        return Boolean(isWishlisted(productId));
      } catch (error) {
        console.warn("isWishlisted check failed:", error);
      }
    }

    if (wishlistItems instanceof Set) {
      return wishlistItems.has(productId);
    }

    if (Array.isArray(wishlistItems)) {
      return wishlistItems.some((item) => {
        const itemProductId =
          item?.product?._id ||
          item?.product?.id ||
          item?.product ||
          item?._id ||
          item?.id;

        return String(itemProductId) === String(productId);
      });
    }

    if (typeof wishlistItems === "object") {
      if (wishlistItems[productId]) {
        return true;
      }

      if (Array.isArray(wishlistItems.items)) {
        return wishlistItems.items.some((item) => {
          const itemProductId =
            item?.product?._id ||
            item?.product?.id ||
            item?.product ||
            item?._id ||
            item?.id;

          return String(itemProductId) === String(productId);
        });
      }

      if (Array.isArray(wishlistItems.products)) {
        return wishlistItems.products.some((item) => {
          const itemProductId =
            item?.product?._id ||
            item?.product?.id ||
            item?._id ||
            item?.id ||
            item;

          return String(itemProductId) === String(productId);
        });
      }
    }

    return false;
  };

  /*
    =====================================================
    WISHLIST HANDLER
    =====================================================
  */

  const handleWishlistClick = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = product?._id;

    if (!productId) {
      console.error("Wishlist error: product ID is missing");
      return;
    }

    const isSaved = isProductSaved(productId);

    try {
      if (isSaved) {
        await handleRemoveFromWishlist(productId);
      } else {
        await handleAddToWishlist(productId);
      }

      await handleGetWishlist();
    } catch (error) {
      console.error("Wishlist action failed:", error);
    }
  };

  /*
    =====================================================
    PRODUCT CLICK
    =====================================================
  */

  const openProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleProductKeyDown = (event, productId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct(productId);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">
      <div className="mx-auto max-w-[77.5rem] px-[1rem] py-[1.25rem] sm:px-[1.75rem] sm:py-[1.75rem]">
        {/* HEADER */}

        <header
          className="
            fixed
            left-0
            right-0
            top-0
            z-30
            border-b
            border-[#E1DBD4]/90
            bg-[#F8F6F2]/95
            px-[1rem]
            pb-[1rem]
            pt-[1rem]
            backdrop-blur-md
            sm:px-[1.75rem]
          "
        >
          <div
            className="
              mx-auto
              grid
              w-full
              max-w-[100rem]
              grid-cols-3
              items-center
            "
          >
            {/* LEFT */}

            <div className="flex items-center gap-[0.75rem] justify-self-start">
              <button
                type="button"
                aria-label="Open menu"
                className="
                  flex
                  h-[2.25rem]
                  w-[2.25rem]
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  transition-all
                  duration-200
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiMenu className="h-[1rem] w-[1rem]" />
              </button>

              <span
                className="
                  hidden
                  text-[0.5rem]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#8A837C]
                  sm:block
                "
              >
                Modern essentials
              </span>
            </div>

            {/* CENTER LOGO */}

            <div className="flex items-center justify-center">
              <Link
                to="/"
                aria-label="SNITCH home"
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

            {/* DESKTOP NAV */}

            <nav
              className="
                hidden
                items-center
                justify-self-end
                gap-[1.5rem]
                text-[0.5625rem]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-[#625B55]
                sm:flex
              "
            >
              <button
                type="button"
                onClick={() => {
                  document.getElementById("browse")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="transition-colors hover:text-[#211D1A]"
              >
                SHOP
              </button>

              <Link
                to="/login"
                className="transition-colors hover:text-[#211D1A]"
              >
                Sign in
              </Link>

              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => navigate("/wishlist")}
                className="
                  flex
                  h-[2rem]
                  w-[2rem]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#211D1A]
                  hover:text-white
                "
              >
                <FiHeart className="h-[0.875rem] w-[0.875rem]" />
              </button>

              <button
                type="button"
                aria-label="Shopping bag"
                onClick={() => navigate("/cart")}
                className="
                  flex
                  h-[2rem]
                  w-[2rem]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#211D1A]
                  hover:text-white
                "
              >
                <FiShoppingBag className="h-[0.875rem] w-[0.875rem]" />
              </button>
            </nav>

            {/* MOBILE ACTIONS */}

            <div
              className="
                flex
                items-center
                gap-[0.5rem]
                justify-self-end
                sm:hidden
              "
            >
              <Link
                to="/login"
                aria-label="Sign in"
                className="
                  flex
                  h-[2.25rem]
                  w-[2.25rem]
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiUser className="h-[1rem] w-[1rem]" />
              </Link>

              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => navigate("/wishlist")}
                className="
                  flex
                  h-[2.25rem]
                  w-[2.25rem]
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiHeart className="h-[1rem] w-[1rem]" />
              </button>

              <button
                type="button"
                aria-label="Shopping bag"
                onClick={() => navigate("/cart")}
                className="
                  flex
                  h-[2.25rem]
                  w-[2.25rem]
                  items-center
                  justify-center
                  rounded-[0.3125rem]
                  border
                  border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiShoppingBag className="h-[1rem] w-[1rem]" />
              </button>
            </div>
          </div>
        </header>

        {/* HEADER SPACER */}

        <div className="h-[4.5625rem] sm:h-[4.8125rem]" />

        {/* SHOP BAR */}

        <div
          className="
            flex
            items-center
            gap-[0.5rem]
            border-b
            border-[#E7E2DC]
            py-[0.75rem]
          "
        >
          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-[0.5rem]
              overflow-x-auto
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <button
              type="button"
              onClick={() => handleCategoryShortcut("All")}
              className="
                flex
                shrink-0
                items-center
                gap-[0.5rem]
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
                px-[0.875rem]
                py-[0.5rem]
                text-[0.5625rem]
                font-semibold
                text-[#625B55]
                transition-all
                hover:border-[#211D1A]
                hover:text-[#211D1A]
              "
            >
              Clothing
              <FiChevronDown className="h-[0.75rem] w-[0.75rem]" />
            </button>

            <button
              type="button"
              onClick={() => handleCategoryShortcut("All")}
              className="
                shrink-0
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
                px-[0.875rem]
                py-[0.5rem]
                text-[0.5625rem]
                font-semibold
                text-[#625B55]
                transition-all
                hover:border-[#211D1A]
                hover:text-[#211D1A]
              "
            >
              New arrivals
            </button>

            <button
              type="button"
              onClick={() => handleCategoryShortcut("All")}
              className="
                shrink-0
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
                px-[0.875rem]
                py-[0.5rem]
                text-[0.5625rem]
                font-semibold
                text-[#625B55]
                transition-all
                hover:border-[#211D1A]
                hover:text-[#211D1A]
              "
            >
              Sale
            </button>
          </div>

          {/* SEARCH */}

          <div
            className="
              flex
              w-[9.0625rem]
              shrink-0
              items-center
              gap-[0.5rem]
              rounded-[0.3125rem]
              border
              border-[#D8D1C8]
              bg-white
              px-[0.75rem]
              py-[0.5rem]
              sm:w-[13.75rem]
              lg:w-[15.625rem]
            "
          >
            <FiSearch className="h-[0.875rem] w-[0.875rem] shrink-0 text-[#625B55]" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[0.5625rem]
                font-semibold
                text-[#211D1A]
                outline-none
                placeholder:text-[#A39C93]
              "
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="
                  flex
                  shrink-0
                  items-center
                  justify-center
                  text-[#625B55]
                  transition-colors
                  hover:text-[#211D1A]
                "
              >
                <FiX className="h-[0.875rem] w-[0.875rem]" />
              </button>
            )}
          </div>
        </div>

       

{/* PREMIUM HERO */}
<section
  className="
    relative
    mt-[1.25rem]
    h-[68vh]
    min-h-[520px]
    overflow-hidden
    rounded-[0.25rem]
    bg-[#171512]
    sm:h-[78vh]
    sm:min-h-[620px]
    lg:h-[82vh]
  "
>
  {/* HERO IMAGES */}
  {isHeroLoading ? (
    <div className="absolute inset-0 animate-pulse bg-[#24211B]" />
  ) : heroImages.length > 0 ? (
    <div className="absolute inset-0">
      {heroImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`Snitch collection ${index + 1}`}
          className={`
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
            transition-opacity
            duration-[1600ms]
            ease-in-out
            ${
              index === heroIndex
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />
      ))}

      {/* VERY LIGHT IMAGE OVERLAY */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-black/10
        "
      />

      {/* BOTTOM READABILITY */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[45%]
          bg-gradient-to-t
          from-black/65
          via-black/20
          to-transparent
        "
      />

      {/* SUBTLE SIDE VIGNETTE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-black/20
          via-transparent
          to-transparent
        "
      />
    </div>
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-[#24211B]">
      <div className="text-center">
        <FiPackage className="mx-auto h-8 w-8 text-[#8C8574]" />

        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#8C8574]">
          {heroError ? "Hero unavailable" : "No hero banner yet"}
        </p>
      </div>
    </div>
  )}

  {/* HERO CONTENT */}
  <div
    className="
      relative
      z-10
      flex
      h-full
      flex-col
      justify-between
      px-5
      py-6
      sm:px-8
      sm:py-8
      lg:px-12
      lg:py-10
    "
  >
    {/* TOP LABEL */}
    <div className="flex items-start justify-between">
      <div>
        <p
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-[0.22em]
            text-white/75
            sm:text-[10px]
          "
        >
          The New Collection
        </p>

        <div className="mt-2 h-px w-8 bg-[#555555]" />
      </div>

      {/* SLIDE NUMBER */}
      {heroImages.length > 1 && (
        <div
          className="
            flex
            items-center
            gap-2
            text-[9px]
            uppercase
            tracking-[0.15em]
            text-white/70
          "
        >
          <span className="text-white">
            {String(heroIndex + 1).padStart(2, "0")}
          </span>

          <span className="text-white/35">/</span>

          <span>
            {String(heroImages.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>

    {/* BOTTOM CONTENT */}
    <div
      className="
        flex
        flex-col
        gap-8
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      {/* TEXT */}
      <div className="max-w-[650px]">
        <p
          className="
            mb-3
            text-[9px]
            uppercase
            tracking-[0.22em]
            text-[#585757]
            sm:text-[10px]
          "
        >
          Modern essentials
        </p>

       <h1
  className="
    font-sans
    text-[2.75rem]
    font-semibold
    leading-[0.8]
    tracking-[-0.055em]
    text-[#F8F4EA]
    sm:text-[5rem]
    lg:text-[6.25rem]
  "
>
  Made for
  <br />
  <span className="font-light">
    every moment.
  </span>
</h1>

        <p
          className="
            mt-5
            max-w-[380px]
            text-[11px]
            leading-[1.6]
            text-white/65
            sm:text-[12px]
          "
        >
          Refined silhouettes, considered details and
          effortless pieces made for every day.
        </p>

        {/* CTA */}
       <a
  href="#browse"
  className="
    group
    mt-7
    inline-flex
    items-center
    gap-3
    border
    border-white/60
    px-5
    py-3
    text-[0.60rem]
    font-bold
    uppercase
    tracking-[0.18em]
    text-white
    transition-all
    duration-300
    hover:border-white
    hover:bg-white
    hover:text-[#171512]
  "
>
  Shop collection

  <FiArrowUpRight
    className="
      h-3.5
      w-3.5
      transition-transform
      duration-300
     
    "
  />
</a>
      </div>

      {/* SLIDER CONTROLS */}
      {heroImages.length > 1 && (
        <div className="flex items-center gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setHeroIndex(index)}
              className="group flex items-center py-2"
            >
              <span
                className={`
                  block
                  h-[1px]
                  transition-all
                  duration-500
                  ${
                    index === heroIndex
                      ? "w-10 bg-[#555555]"
                      : "w-5 bg-white/35 group-hover:w-7 group-hover:bg-white/70"
                  }
                `}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
</section>


        {/* INTRO */}

        <section
          id="about"
          className="scroll-mt-[5rem] py-[3.5rem] text-center sm:py-[4rem]"
        >
          <p className="mb-[0.75rem] text-[0.5rem] font-bold uppercase tracking-[0.25em] text-[#8A837C]">
            The latest edit
          </p>

          <h2
            className="
              font-serif
              text-[2rem]
              tracking-[-0.05em]
              sm:text-[2.625rem]
            "
          >
            Fresh Fashion at
            <br className="sm:hidden" /> Modern Vibes
          </h2>

          <p className="mx-auto mt-[1rem] max-w-[32rem] text-[0.625rem] leading-[1.25rem] text-[#625B55] sm:text-[0.6875rem]">
            Our collection is constantly updated with the latest styles,
            ensuring you are always on point. Discover pieces that fit naturally
            into your wardrobe.
          </p>
        </section>

        {/* EDITORIAL */}

        <section className="grid gap-[0.75rem] sm:grid-cols-[1.15fr_0.85fr]">
          <article
            className="
              overflow-hidden
              rounded-[0.4375rem]
              border border-[#E1DBD4]
              bg-[#E8E9E5]
              p-[0.5rem]
            "
          >
            <div
              className="
                h-[16rem]
                overflow-hidden
                rounded-[0.3125rem]
                bg-[#D7D8D4]
                sm:h-[20.625rem]
              "
            >
              {featureImage ? (
                <img
                  src={featureImage}
                  alt="Discover new fashion trends"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                  "
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FiPackage className="h-[2.5rem] w-[2.5rem] text-[#8A837C]" />
                </div>
              )}
            </div>

            <div className="px-[0.5rem] pb-[0.75rem] pt-[1.25rem]">
              <p className="mb-[0.5rem] text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#8A837C]">
                Editorial / 01
              </p>

              <h3 className="font-serif text-[1.5rem] italic tracking-[-0.04em]">
                Discover the limitless
              </h3>

              <p className="mt-[0.375rem] text-[0.5625rem] text-[#625B55]">
                — Imagining new fashion trends
              </p>
            </div>
          </article>

          <article
            className="
              flex
              min-h-[24.375rem]
              flex-col
              overflow-hidden
              rounded-[0.4375rem]
              border
              border-[#E1DBD4]
              bg-[#E8E9E5]
              p-[1.5rem]
              sm:min-h-0
            "
          >
            <div>
              <p className="mb-[0.75rem] text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#8A837C]">
                Coming soon
              </p>

              <h3
                className="
                  max-w-[17.5rem]
                  font-serif
                  text-[1.875rem]
                  italic
                  leading-[0.95]
                  tracking-[-0.05em]
                "
              >
                Hold on, new product is coming!
              </h3>

              <p className="mt-[1rem] max-w-[15rem] text-[0.5625rem] leading-[1rem] text-[#625B55]">
                — Bringing you a new era of simple clothes.
              </p>
            </div>

            <div
              className="
                mt-auto
                ml-auto
                w-full
                max-w-[13.125rem]
                overflow-hidden
                rounded-[0.3125rem]
                border-[0.375rem]
                border-white
                bg-[#D7D8D4]
              "
            >
              {secondaryImage ? (
                <img
                  src={secondaryImage}
                  alt="New arrival"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center">
                  <FiPackage className="h-[1.75rem] w-[1.75rem] text-[#8A837C]" />
                </div>
              )}
            </div>
          </article>
        </section>

        {/* PRODUCT BROWSE */}

        <section id="browse" className="scroll-mt-[5rem] pt-[4rem]">
          <div className="flex flex-col justify-between gap-[1.25rem] sm:flex-row sm:items-end">
            <div>
              <p className="mb-[0.5rem] text-[0.5rem] font-bold uppercase tracking-[0.24em] text-[#8A837C]">
                Curated for you
              </p>

              <h2
                className="
                  font-serif
                  text-[2rem]
                  tracking-[-0.05em]
                  sm:text-[2.375rem]
                "
              >
                Browse All You Need.
              </h2>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="
                hidden
                items-center
                gap-[0.5rem]
                border-b
                border-[#BDB6AE]
                pb-[0.25rem]
                text-[0.5rem]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#625B55]
                transition-all
                hover:border-[#211D1A]
                hover:text-[#211D1A]
                sm:flex
              "
            >
              Reset filters
              <FiChevronRight className="h-[0.75rem] w-[0.75rem]" />
            </button>
          </div>

          {/* CATEGORY FILTER */}

          <div className="mt-[1.5rem] flex gap-[0.5rem] overflow-x-auto pb-[0.5rem] [scrollbar-width:none]">
            {CATEGORIES.map((category) => {
              const isActive = category === activeCategory;

              return (
                <button
                  type="button"
                  key={category}
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    shrink-0
                    rounded-[0.3125rem]
                    border
                    px-[1rem]
                    py-[0.625rem]
                    text-[0.5rem]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    transition-all
                    ${
                      isActive
                        ? "border-[#211D1A] bg-[#211D1A] text-white"
                        : "border-[#D8D1C8] bg-white text-[#625B55] hover:border-[#211D1A] hover:text-[#211D1A]"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* RESULTS INFO */}

          {!isLoading && !loadError && (
            <div className="mt-[1rem] flex items-center justify-between">
              <p className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#8A837C]">
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1 ? "piece" : "pieces"} found
              </p>

              {(activeCategory !== "All" || searchTerm) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    text-[0.5rem]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[#625B55]
                    hover:text-[#211D1A]
                  "
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </section>

        {/* LOADING */}

        {isLoading && (
          <section className="mt-[1.5rem] grid gap-[1rem] sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </section>
        )}

        {/* ERROR */}

        {!isLoading && loadError && (
          <section
            className="
              mt-[1.5rem]
              flex
              min-h-[20rem]
              flex-col
              items-center
              justify-center
              rounded-[0.4375rem]
              border
              border-dashed
              border-[#B7B1AA]
              bg-[#F2EFEA]
              px-[1.5rem]
              text-center
            "
          >
            <div
              className="
                mb-[1.25rem]
                flex
                h-[3rem]
                w-[3rem]
                items-center
                justify-center
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
              "
            >
              <FiPackage className="h-[1.25rem] w-[1.25rem]" />
            </div>

            <h2 className="font-serif text-[1.5rem] tracking-[-0.04em]">
              Something went wrong
            </h2>

            <p className="mt-[0.5rem] max-w-[24rem] text-[0.625rem] leading-[1.25rem] text-[#625B55]">
              We couldn't load the collection right now. Please try again.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="
                mt-[1.5rem]
                rounded-[0.3125rem]
                border
                border-[#211D1A]
                bg-[#211D1A]
                px-[1.25rem]
                py-[0.625rem]
                text-[0.5rem]
                font-bold
                uppercase
                tracking-[0.12em]
                text-white
                transition-all
                hover:bg-[#3A342F]
              "
            >
              Try again
            </button>
          </section>
        )}

        {/* EMPTY STATE */}

        {!isLoading && !loadError && visibleProducts.length === 0 && (
          <section
            className="
              mt-[1.5rem]
              flex
              min-h-[20rem]
              flex-col
              items-center
              justify-center
              rounded-[0.4375rem]
              border
              border-dashed
              border-[#B7B1AA]
              bg-[#F2EFEA]
              px-[1.5rem]
              py-[3rem]
              text-center
            "
          >
            <div
              className="
                mb-[1.25rem]
                flex
                h-[3rem]
                w-[3rem]
                items-center
                justify-center
                rounded-[0.3125rem]
                border
                border-[#D8D1C8]
                bg-white
                text-[#211D1A]
              "
            >
              <FiSearch className="h-[1.25rem] w-[1.25rem]" />
            </div>

            <h2
              className="
                mb-[0.5rem]
                font-serif
                text-[1.5rem]
                tracking-[-0.04em]
              "
            >
              {products.length === 0
                ? "No products available yet"
                : "Nothing matches those filters"}
            </h2>

            <p className="max-w-[26rem] text-[0.625rem] leading-[1.25rem] text-[#625B55]">
              {products.length === 0
                ? "Fresh drops will appear here once sellers publish their items."
                : "Try another search or category to explore the collection."}
            </p>

            {products.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-[1.5rem]
                  rounded-[0.3125rem]
                  border
                  border-[#211D1A]
                  bg-[#211D1A]
                  px-[1.25rem]
                  py-[0.625rem]
                  text-[0.5rem]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-white
                  transition-all
                  hover:bg-[#3A342F]
                "
              >
                Clear filters
              </button>
            )}
          </section>
        )}

        {/* PRODUCT GRID */}

        {!isLoading && !loadError && visibleProducts.length > 0 && (
          <section className="mt-[1.5rem] grid gap-[1rem] sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => {
              const firstImage = getProductImage(product);

              const stock = getProductStock(product);

              const isSaved = isProductSaved(product._id);

              const isOutOfStock = stock <= 0;

              const hasVariants =
                Array.isArray(product.variants) && product.variants.length > 0;

              return (
                <article
                  key={product._id}
                  onClick={() => openProduct(product._id)}
                  onKeyDown={(event) =>
                    handleProductKeyDown(event, product._id)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${product.title}`}
                  className="
                    group
                    cursor-pointer
                    overflow-hidden
                    rounded-[0.4375rem]
                    border
                    border-[#E1DBD4]
                    bg-white
                    transition-all
                    duration-300
                    hover:-translate-y-[0.25rem]
                    hover:border-[#CFC7BE]
                    hover:shadow-[0_0.875rem_2.1875rem_rgba(33,29,26,0.07)]
                    focus:outline-none
                    focus:ring-1
                    focus:ring-[#211D1A]
                  "
                >
                  {/* PRODUCT IMAGE */}

                  <div
                    className="
                      relative
                      aspect-[4/5]
                      overflow-hidden
                      bg-[#E9E4DE]
                    "
                  >
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.title || "Product"}
                        loading="lazy"
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-700
                          group-hover:scale-[1.035]
                        "
                      />
                    ) : (
                      <ProductImageFallback />
                    )}

                    {/* IMAGE GRADIENT */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-[6rem]
                        bg-gradient-to-t
                        from-black/20
                        to-transparent
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    />

                    {/* NEW LABEL */}

                    <span
                      className="
                        absolute
                        left-[0.75rem]
                        top-[0.75rem]
                        rounded-[0.25rem]
                        border
                        border-white/60
                        bg-[#F8F5F1]/90
                        px-[0.625rem]
                        py-[0.375rem]
                        text-[0.4375rem]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#211D1A]
                        backdrop-blur-sm
                      "
                    >
                      New
                    </span>

                    {/* STOCK LABEL */}

                    {isOutOfStock ? (
                      <span
                        className="
                          absolute
                          bottom-[0.75rem]
                          left-[0.75rem]
                          rounded-[0.25rem]
                          bg-[#211D1A]/90
                          px-[0.625rem]
                          py-[0.375rem]
                          text-[0.4375rem]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-white
                        "
                      >
                        Sold out
                      </span>
                    ) : stock <= 5 ? (
                      <span
                        className="
                          absolute
                          bottom-[0.75rem]
                          left-[0.75rem]
                          rounded-[0.25rem]
                          border
                          border-white/60
                          bg-white/90
                          px-[0.625rem]
                          py-[0.375rem]
                          text-[0.4375rem]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[#211D1A]
                          backdrop-blur-sm
                        "
                      >
                        Only {stock} left
                      </span>
                    ) : null}

                    {/* WISHLIST BUTTON */}

                    <button
                      type="button"
                      aria-label={
                        isSaved
                          ? `Remove ${product.title} from wishlist`
                          : `Add ${product.title} to wishlist`
                      }
                      aria-pressed={isSaved}
                      onClick={(event) => handleWishlistClick(event, product)}
                      className="
                        absolute
                        right-[0.75rem]
                        top-[0.75rem]
                        flex
                        h-[2rem]
                        w-[2rem]
                        shrink-0
                        items-center
                        justify-center
                        rounded-[0.3125rem]
                        border
                        border-[#D8D1C8]
                        bg-white
                        text-[#211D1A]
                        transition-all
                        duration-200
                      "
                    >
                      <FiHeart
                        className={`
                          h-[0.875rem]
                          w-[0.875rem]
                          transition-all
                          duration-200
                          ${isSaved ? "fill-current" : ""}
                        `}
                      />
                    </button>

                    {/* IMAGE COUNT */}

                    {product.images?.length > 1 && (
                      <span
                        className="
                          absolute
                          bottom-[0.75rem]
                          right-[0.75rem]
                          rounded-[0.25rem]
                          bg-black/55
                          px-[0.5rem]
                          py-[0.25rem]
                          text-[0.4375rem]
                          font-semibold
                          text-white
                          backdrop-blur-sm
                        "
                      >
                        {product.images.length} photos
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="space-y-[0.75rem] p-[1rem]">
                    <div>
                      <div className="mb-[0.375rem] flex items-start justify-between gap-[0.75rem]">
                        <h3
                          className="
                            line-clamp-1
                            font-serif
                            text-[1.0625rem]
                            leading-tight
                            tracking-[-0.04em]
                            text-[#211D1A]
                          "
                        >
                          {product.title || "Untitled product"}
                        </h3>
                      </div>

                      <p
                        className="
                          line-clamp-2
                          min-h-[2rem]
                          text-[0.5625rem]
                          leading-[1rem]
                          text-[#625B55]
                        "
                      >
                        {product.description ||
                          "No description provided for this listing."}
                      </p>
                    </div>

                    {/* PRODUCT META */}

                    <div className="flex items-center gap-[0.5rem]">
                      {product.category && (
                        <span
                          className="
                            rounded-[0.1875rem]
                            bg-[#F2EEE9]
                            px-[0.5rem]
                            py-[0.25rem]
                            text-[0.4375rem]
                            font-bold
                            uppercase
                            tracking-[0.1em]
                            text-[#625B55]
                          "
                        >
                          {product.category}
                        </span>
                      )}

                      {hasVariants && (
                        <span
                          className="
                            rounded-[0.1875rem]
                            bg-[#F2EEE9]
                            px-[0.5rem]
                            py-[0.25rem]
                            text-[0.4375rem]
                            font-bold
                            uppercase
                            tracking-[0.1em]
                            text-[#625B55]
                          "
                        >
                          {product.variants.length} variants
                        </span>
                      )}
                    </div>

                    {/* BOTTOM */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-[#E2DBD1]
                        pt-[0.75rem]
                      "
                    >
                      <div>
                        <p className="text-[0.8125rem] font-bold text-[#211D1A]">
                          {formatPrice(product.price)}
                        </p>

                        {!isOutOfStock && (
                          <p className="mt-[0.125rem] text-[0.4375rem] font-semibold uppercase tracking-[0.08em] text-[#8A837C]">
                            In stock
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        aria-label={`Shop ${product.title}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (!isOutOfStock) {
                            openProduct(product._id);
                          }
                        }}
                        className={`
                          flex
                          h-[2.25rem]
                          items-center
                          justify-center
                          rounded-[0.3125rem]
                          border
                          px-[1rem]
                          text-[0.5rem]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          transition-all
                          ${
                            isOutOfStock
                              ? "cursor-not-allowed border-[#E2DBD1] bg-[#F2EFEA] text-[#A39C93]"
                              : "border-[#211D1A] bg-[#211D1A] text-white hover:bg-[#3A342F]"
                          }
                        `}
                      >
                        {isOutOfStock ? "SOLD OUT" : "SHOP NOW"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* FOOTER */}

        <footer
          className="
            mt-[4rem]
            flex
            flex-col
            items-center
            justify-between
            gap-[0.75rem]
            border-t
            border-[#E1DBD4]
            py-[1.5rem]
            sm:flex-row
          "
        >
          <p className="text-[0.5rem] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
            SNITCH
          </p>

          <p className="text-center text-[0.5rem] text-[#8A837C]">
            Timeless pieces for everyday living
          </p>

          <p className="text-[0.5rem] text-[#8A837C]">
            © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Home;