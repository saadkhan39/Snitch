import React, { useEffect, useState } from "react";

import {
  FiArrowLeft,
  FiHeart,
  FiSearch,
  FiX,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";

import { useProduct } from "../hooks/useProduct";
import { useWishlist } from "../../wishlist/hooks/useWishlist";

/* =========================================================
   HELPERS
========================================================= */

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

const getProductImage = (product) => {
  if (!Array.isArray(product?.images)) {
    return null;
  }

  return getImageUrl(product.images[0]);
};

const getProductStock = (product) => {
  if (!product) return 0;

  if (
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    return product.variants.reduce(
      (total, variant) =>
        total + Number(variant?.stock ?? 0),
      0
    );
  }

  return Number(product.stock ?? 0);
};

/* =========================================================
   COMPONENT
========================================================= */

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery =
    searchParams.get("q")?.trim() || "";

  const { handleGetAllProducts } = useProduct();

  const {
    wishlistItems = [],
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
  } = useWishlist();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);

        const result =
          await handleGetAllProducts(searchQuery);

        if (!isMounted) return;

        setProducts(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load search results:",
          error
        );

        if (isMounted) {
          setProducts([]);
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, handleGetAllProducts]);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    if (handleGetWishlist) {
      handleGetWishlist();
    }
  }, [handleGetWishlist]);

  /* =========================================================
     WISHLIST CHECK
  ========================================================= */

  const isProductWishlisted = (productId) => {
    if (!productId) return false;

    if (wishlistItems instanceof Set) {
      return wishlistItems.has(productId);
    }

    if (Array.isArray(wishlistItems)) {
      return wishlistItems.some((item) => {
        const id =
          item?.product?._id ||
          item?.product?.id ||
          item?._id ||
          item?.id ||
          item?.productId;

        return (
          String(id) === String(productId)
        );
      });
    }

    return false;
  };

  /* =========================================================
     WISHLIST ACTION
  ========================================================= */

  const handleWishlistClick = async (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = product?._id;

    if (!productId) return;

    const isSaved =
      isProductWishlisted(productId);

    try {
      if (isSaved) {
        if (handleRemoveFromWishlist) {
          await handleRemoveFromWishlist(
            productId
          );
        }
      } else {
        if (handleAddToWishlist) {
          await handleAddToWishlist(
            productId
          );
        }
      }

      if (handleGetWishlist) {
        await handleGetWishlist();
      }
    } catch (error) {
      console.error(
        "Wishlist action failed:",
        error
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    const query = String(
      formData.get("search") || ""
    ).trim();

    if (!query) {
      navigate("/search");
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  /* =========================================================
     CLEAR
  ========================================================= */

  const handleClear = () => {
    navigate("/search");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#211D1A]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-[#E1DBD4]
          bg-[#F8F6F2]/95
          backdrop-blur-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[4.5rem]
            max-w-[96rem]
            items-center
            justify-between
            px-4
            sm:px-7
            lg:px-12
          "
        >

          {/* LEFT */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              group
              flex
              items-center
              gap-2
              text-[0.625rem]
              font-semibold
              uppercase
              tracking-[0.1em]
              text-[#625B55]
              transition-colors
              hover:text-[#211D1A]
            "
          >
            <FiArrowLeft
              className="
                h-4
                w-4
                transition-transform
                duration-200
                group-hover:-translate-x-1
              "
            />

            <span className="hidden sm:block">
              Back
            </span>
          </button>

          {/* LOGO */}

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

          {/* RIGHT */}

          <Link
            to="/"
            className="
              text-[0.625rem]
              font-semibold
              uppercase
              tracking-[0.1em]
              text-[#625B55]
              transition-colors
              hover:text-[#211D1A]
            "
          >
            Home
          </Link>
        </div>
      </header>

      {/* =====================================================
          SEARCH BAR
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[40rem]
          px-4
          pb-8
          pt-7
          sm:px-7
          sm:pb-10
          sm:pt-9
          lg:px-12
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-5
            border-b
            border-[#211D1A]
            pb-3
          "
        >

          <form
            onSubmit={handleSearch}
            className="
              flex
              min-w-0
              flex-1
              items-center
            "
          >

            <FiSearch
              className="
                mr-3
                h-4
                w-4
                shrink-0
                text-[#625B55]
              "
            />

            <input
              key={searchQuery}
              type="search"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search products"
              autoComplete="off"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[0.8rem]
                font-medium
                text-[#211D1A]
                outline-none
                placeholder:text-[#9B928A]
                sm:text-[0.875rem]
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="
                  ml-3
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  text-[#817970]
                  transition-colors
                  hover:text-[#211D1A]
                "
              >
                <FiX className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              className="
                ml-3
                hidden
                shrink-0
                text-[0.625rem]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[#211D1A]
                transition-opacity
                hover:opacity-50
                sm:block
              "
            >
              Search
            </button>
          </form>

         
        </div>
      </section>

      {/* =====================================================
          RESULTS HEADER
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[96rem]
          px-4
          sm:px-7
          lg:px-12
        "
      >

        <div
          className="
            mb-7
            flex
            items-end
            justify-between
            gap-4
          "
        >

          <div>
            <p
              className="
                mb-2
                text-[0.5625rem]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#9A9188]
              "
            >
              {searchQuery
                ? "Search results"
                : "Discover"}
            </p>

            <h1
              className="
                font-serif
                text-[1.8rem]
                font-normal
                leading-none
                tracking-[-0.04em]
                sm:text-[2.5rem]
              "
            >
              {searchQuery
                ? `${searchQuery}`
                : "All products"}
            </h1>
          </div>

          {!isLoading &&
            !loadError &&
            products.length > 0 && (
              <span
                className="
                  pb-0.5
                  text-[0.5625rem]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-[#8A8178]
                "
              >
                {products.length}{" "}
                {products.length === 1
                  ? "item"
                  : "items"}
              </span>
            )}
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {isLoading && (
          <div
            className="
              grid
              grid-cols-2
              gap-x-3
              gap-y-10
              sm:grid-cols-3
              sm:gap-x-5
              lg:grid-cols-4
              lg:gap-x-6
            "
          >
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div key={index}>
                  <div
                    className="
                      aspect-[3/4]
                      animate-pulse
                      bg-[#EDE9E3]
                    "
                  />

                  <div
                    className="
                      mt-4
                      h-2.5
                      w-3/5
                      animate-pulse
                      bg-[#E3DED7]
                    "
                  />

                  <div
                    className="
                      mt-2
                      h-2.5
                      w-1/3
                      animate-pulse
                      bg-[#E3DED7]
                    "
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!isLoading && loadError && (
          <div
            className="
              flex
              min-h-[20rem]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <p
              className="
                mb-3
                text-[0.5625rem]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#9A9188]
              "
            >
              Search
            </p>

            <h2
              className="
                font-serif
                text-[2rem]
                tracking-[-0.035em]
              "
            >
              Something went wrong
            </h2>

            <p
              className="
                mt-3
                max-w-[23rem]
                text-[0.6875rem]
                leading-[1.7]
                text-[#817970]
              "
            >
              We couldn't load the products.
              Please try again.
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-6
                border
                border-[#211D1A]
                px-6
                py-3
                text-[0.5625rem]
                font-semibold
                uppercase
                tracking-[0.1em]
                transition-all
                hover:bg-[#211D1A]
                hover:text-[#F8F6F2]
              "
            >
              Try again
            </button>
          </div>
        )}

        {/* ===================================================
            EMPTY SEARCH
        =================================================== */}

        {!isLoading &&
          !loadError &&
          !searchQuery && (
            <div
              className="
                flex
                min-h-[18rem]
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <FiSearch
                className="
                  mb-5
                  h-5
                  w-5
                  text-[#8A8178]
                "
              />

              <h2
                className="
                  font-serif
                  text-[2rem]
                  tracking-[-0.035em]
                "
              >
                Find something you love.
              </h2>

              <p
                className="
                  mt-3
                  text-[0.6875rem]
                  text-[#817970]
                "
              >
                Search our latest collection.
              </p>
            </div>
          )}

        {/* ===================================================
            NO RESULTS
        =================================================== */}

        {!isLoading &&
          !loadError &&
          searchQuery &&
          products.length === 0 && (
            <div
              className="
                flex
                min-h-[18rem]
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <p
                className="
                  mb-3
                  text-[0.5625rem]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-[#9A9188]
                "
              >
                No results
              </p>

              <h2
                className="
                  font-serif
                  text-[2rem]
                  tracking-[-0.035em]
                "
              >
                Nothing found.
              </h2>

              <p
                className="
                  mt-3
                  max-w-[25rem]
                  text-[0.6875rem]
                  leading-[1.7]
                  text-[#817970]
                "
              >
                We couldn't find anything
                matching{" "}
                <span className="text-[#211D1A]">
                  "{searchQuery}"
                </span>
                .
              </p>

              <button
                type="button"
                onClick={handleClear}
                className="
                  mt-6
                  border
                  border-[#211D1A]
                  px-6
                  py-3
                  text-[0.5625rem]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  transition-all
                  hover:bg-[#211D1A]
                  hover:text-[#F8F6F2]
                "
              >
                Clear search
              </button>
            </div>
          )}

        {/* ===================================================
            PRODUCT GRID
        =================================================== */}

        {!isLoading &&
          !loadError &&
          products.length > 0 && (
            <div
              className="
                grid
                grid-cols-2
                gap-x-3
                gap-y-12
                sm:grid-cols-3
                sm:gap-x-5
                sm:gap-y-14
                lg:grid-cols-4
                lg:gap-x-6
                lg:gap-y-16
              "
            >
              {products.map((product) => {
                const productId =
                  product?._id;

                const image =
                  getProductImage(product);

                const stock =
                  getProductStock(product);

                const isSaved =
                  isProductWishlisted(
                    productId
                  );

                return (
                  <article
                    key={productId}
                    className="
                      group
                      min-w-0
                    "
                  >

                    {/* PRODUCT IMAGE */}

                    <div
                      onClick={() =>
                        navigate(
                          `/product/${productId}`
                        )
                      }
                      className="
                        relative
                        aspect-[3/4]
                        cursor-pointer
                        overflow-hidden
                        bg-[#EEEAE4]
                      "
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={
                            product?.title ||
                            "Product"
                          }
                          loading="lazy"
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-[1.035]
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-[0.5625rem]
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-[#8A8178]
                          "
                        >
                          No image
                        </div>
                      )}

                      {/* WISHLIST */}

                      <button
                        type="button"
                        aria-label={
                          isSaved
                            ? `Remove ${product?.title} from wishlist`
                            : `Save ${product?.title} to wishlist`
                        }
                        aria-pressed={isSaved}
                        onClick={(event) =>
                          handleWishlistClick(
                            event,
                            product
                          )
                        }
                        className={`
                          absolute
                          right-3
                          top-3
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-[5px]
                          border
                          transition-all
                          duration-200
                          ${
                            isSaved
                              ? "border-white bg-white opacity-100"
                              : "border-[#D8D1C8] bg-[#F8F6F2]/95 opacity-0 sm:group-hover:opacity-100"
                          }
                        `}
                      >
                        <FiHeart
                          className={`
                            h-4
                            w-4
                            transition-all
                            duration-200
                            ${
                              isSaved
                                ? "fill-red-500 text-red-500"
                                : "fill-white text-[#211D1A]"
                            }
                          `}
                        />
                      </button>

                      {/* OUT OF STOCK */}

                      {stock <= 0 && (
                        <span
                          className="
                            absolute
                            bottom-3
                            left-3
                            bg-[#211D1A]
                            px-2.5
                            py-1.5
                            text-[0.5rem]
                            font-semibold
                            uppercase
                            tracking-[0.1em]
                            text-[#F8F6F2]
                          "
                        >
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="pt-3">

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <h2
                          className="
                            min-w-0
                            truncate
                            text-[0.625rem]
                            font-semibold
                            uppercase
                            tracking-[0.055em]
                            text-[#211D1A]
                            sm:text-[0.6875rem]
                          "
                        >
                          {product?.title ||
                            "Untitled product"}
                        </h2>

                        <span
                          className="
                            shrink-0
                            text-[0.625rem]
                            font-medium
                            text-[#211D1A]
                            sm:text-[0.6875rem]
                          "
                        >
                          {formatPrice(
                            product?.price
                          )}
                        </span>
                      </div>

                      {product?.description && (
                        <p
                          className="
                            mt-1.5
                            line-clamp-2
                            text-[0.5625rem]
                            leading-[1.55]
                            text-[#817970]
                          "
                        >
                          {
                            product.description
                          }
                        </p>
                      )}

                      {Array.isArray(
                        product?.images
                      ) &&
                        product.images.length >
                          1 && (
                          <p
                            className="
                              mt-2
                              text-[0.5rem]
                              font-medium
                              uppercase
                              tracking-[0.1em]
                              text-[#A39C93]
                            "
                          >
                            {
                              product.images
                                .length
                            }{" "}
                            images
                          </p>
                        )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
};

export default Search;

