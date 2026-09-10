import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
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
} from 'react-icons/fi'
import { useProduct } from '../hooks/useProduct'

const formatPrice = (price) => {
  if (!price) return 'Price not available'

  const amount = Number(price.amount ?? 0)
  const currency = price.currency || 'INR'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getImageUrl = (image) => {
  if (!image) return null

  return (
    image.url ||
    image.thumbnailUrl ||
    image.filePath ||
    image.secure_url ||
    null
  )
}

const getProductImage = (product, index = 0) => {
  if (!Array.isArray(product?.images)) return null

  return getImageUrl(product.images[index])
}

const getProductStock = (product) => {
  if (!product) return 0

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce(
      (total, variant) => total + Number(variant?.stock ?? 0),
      0
    )
  }

  return Number(product.stock ?? 0)
}

const normalizeText = (value) => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const CATEGORIES = [
  'All',
  'Outerwear',
  'Basics',
  'Tops',
  'Loungewear',
  'Accessories',
]

const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-[7px] border border-[#E5DFD8] bg-white">
    <div className="aspect-[4/5] animate-pulse bg-[#EAE5E0]" />

    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded-[2px] bg-[#EAE5E0]" />

      <div className="h-2.5 w-full animate-pulse rounded-[2px] bg-[#EFEBE5]" />

      <div className="h-2.5 w-2/3 animate-pulse rounded-[2px] bg-[#EFEBE5]" />

      <div className="flex items-center justify-between border-t border-[#E2DBD1] pt-3">
        <div className="h-4 w-16 animate-pulse rounded-[2px] bg-[#EAE5E0]" />

        <div className="h-8 w-8 animate-pulse rounded-[4px] bg-[#EAE5E0]" />
      </div>
    </div>
  </div>
)

const ProductImageFallback = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#EAE5E0] text-[#8A837C]">
    <div className="flex flex-col items-center gap-2">
      <FiPackage className="h-8 w-8" />

      <span className="text-[7px] font-bold uppercase tracking-[0.16em]">
        No image
      </span>
    </div>
  </div>
)

const Home = () => {
  const navigate = useNavigate()

  const products = useSelector(
    (state) => state.product?.allProducts ?? []
  )

  const { handleGetAllProducts } = useProduct()

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [activeCategory, setActiveCategory] = useState('All')

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [wishlist, setWishlist] = useState(() => new Set())

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setLoadError(false)

        await handleGetAllProducts()
      } catch (error) {
        console.error('Failed to load products:', error)

        if (isMounted) {
          setLoadError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  /* ================= HERO IMAGES ================= */

  const heroImage =
    getProductImage(products[0]) ||
    getProductImage(products[1]) ||
    null

  const featureImage =
    getProductImage(products[1]) ||
    getProductImage(products[0]) ||
    null

  const secondaryImage =
    getProductImage(products[2]) ||
    getProductImage(products[1]) ||
    getProductImage(products[0]) ||
    null

  /* ================= FILTER PRODUCTS ================= */

  const visibleProducts = useMemo(() => {
    const query = normalizeText(searchTerm)

    return products.filter((product) => {
      const productCategory = normalizeText(product?.category)

      const matchesCategory =
        activeCategory === 'All' ||
        productCategory === normalizeText(activeCategory)

      const searchableText = [
        product?.title,
        product?.description,
        product?.category,
      ]
        .filter(Boolean)
        .join(' ')

      const matchesSearch =
        !query ||
        normalizeText(searchableText).includes(query)

      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchTerm])

  /* ================= FILTER HELPERS ================= */

  const clearFilters = () => {
    setActiveCategory('All')
    setSearchTerm('')
  }

  const handleCategoryShortcut = (category) => {
    setActiveCategory(category)

    requestAnimationFrame(() => {
      document
        .getElementById('browse')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    })
  }

  /* ================= WISHLIST ================= */

  const toggleWishlist = (event, productId) => {
    event.preventDefault()
    event.stopPropagation()

    setWishlist((previous) => {
      const next = new Set(previous)

      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }

      return next
    })
  }

  /* ================= PRODUCT CLICK ================= */

  const openProduct = (productId) => {
    navigate(`/product/${productId}`)
  }

  const handleProductKeyDown = (event, productId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProduct(productId)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">

      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-7 sm:py-7">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="sticky top-0 z-30 -mx-4 border-b border-[#E1DBD4]/90 bg-[#F8F6F2]/95 px-4 pb-4 backdrop-blur-md sm:-mx-7 sm:px-7">

          <div className="flex items-center justify-between">

            {/* LEFT */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                aria-label="Open menu"
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-[5px]
                  border border-[#D8D1C8]
                  bg-white
                  transition-all duration-200
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiMenu className="h-4 w-4" />
              </button>

              <span className="hidden text-[8px] font-medium uppercase tracking-[0.18em] text-[#8A837C] sm:block">
                Modern essentials
              </span>

            </div>

            {/* LOGO */}

            <Link
              to="/"
              className="
                absolute left-1/2
                -translate-x-1/2
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

            {/* DESKTOP NAV */}

            <nav className="hidden items-center gap-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#625B55] sm:flex">

              <a
                href="#browse"
                className="transition-colors hover:text-[#211D1A]"
              >
                Shop
              </a>

              <a
                href="#about"
                className="transition-colors hover:text-[#211D1A]"
              >
                About
              </a>

              <button
                type="button"
                onClick={() => handleCategoryShortcut('All')}
                className="transition-colors hover:text-[#211D1A]"
              >
                New
              </button>

              <Link
                to="/login"
                className="transition-colors hover:text-[#211D1A]"
              >
                Sign in
              </Link>

              <button
                type="button"
                aria-label="Shopping bag"
                onClick={() => navigate('/cart')}
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-[5px]
                  border border-[#D8D1C8]
                  bg-white
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#211D1A]
                  hover:text-white
                "
              >
                <FiShoppingBag className="h-3.5 w-3.5" />
              </button>

            </nav>

            {/* MOBILE ACTIONS */}

            <div className="ml-auto flex items-center gap-2 sm:hidden">

              <Link
                to="/login"
                aria-label="Sign in"
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-[5px]
                  border border-[#D8D1C8]
                  bg-white
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiUser className="h-4 w-4" />
              </Link>

              <button
                type="button"
                aria-label="Shopping bag"
                onClick={() => navigate('/cart')}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-[5px]
                  border border-[#D8D1C8]
                  bg-white
                  transition-all
                  hover:border-[#211D1A]
                  hover:bg-[#EEEAE5]
                "
              >
                <FiShoppingBag className="h-4 w-4" />
              </button>

            </div>

          </div>

        </header>


        {/* =====================================================
            SHOP BAR
        ===================================================== */}

        <div className="flex items-center gap-2 border-b border-[#E7E2DC] py-3">

          <div className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none]">

            <button
              type="button"
              onClick={() => handleCategoryShortcut('All')}
              className="
                flex shrink-0
                items-center gap-2
                rounded-[5px]
                border border-[#D8D1C8]
                bg-white
                px-3.5 py-2
                text-[9px]
                font-semibold
                text-[#625B55]
                transition-all
                hover:border-[#211D1A]
                hover:text-[#211D1A]
              "
            >
              Clothing

              <FiChevronDown className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => handleCategoryShortcut('All')}
              className="
                shrink-0
                rounded-[5px]
                border border-[#D8D1C8]
                bg-white
                px-3.5 py-2
                text-[9px]
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
              onClick={() => handleCategoryShortcut('All')}
              className="
                shrink-0
                rounded-[5px]
                border border-[#D8D1C8]
                bg-white
                px-3.5 py-2
                text-[9px]
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

          {searchOpen ? (

            <div
              className="
                flex shrink-0
                items-center gap-2
                rounded-[5px]
                border border-[#211D1A]
                bg-white
                px-3
                py-2
              "
            >

              <FiSearch className="h-3.5 w-3.5 text-[#625B55]" />

              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search products"
                className="
                  w-28
                  bg-transparent
                  text-[9px]
                  font-semibold
                  text-[#211D1A]
                  outline-none
                  placeholder:text-[#A39C93]
                  sm:w-44
                "
              />

              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchTerm('')
                }}
              >
                <FiX className="h-3.5 w-3.5 text-[#625B55]" />
              </button>

            </div>

          ) : (

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="
                flex h-8 w-8
                shrink-0
                items-center justify-center
                rounded-[5px]
                border border-[#D8D1C8]
                bg-white
                transition-all
                hover:border-[#211D1A]
                hover:bg-[#211D1A]
                hover:text-white
              "
            >
              <FiSearch className="h-3.5 w-3.5" />
            </button>

          )}

        </div>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative isolate
            mt-5
            min-h-[370px]
            overflow-hidden
            rounded-[7px]
            bg-[#211D1A]
            sm:min-h-[470px]
          "
        >

          {heroImage && (
            <img
              src={heroImage}
              alt="Featured collection"
              className="
                absolute inset-0 -z-20
                h-full w-full
                object-cover
                opacity-70
                transition-transform
                duration-[1200ms]
                hover:scale-[1.02]
              "
            />
          )}

          <div className="absolute inset-0 -z-10 bg-black/45" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

          <div className="flex min-h-[370px] flex-col justify-between p-6 text-white sm:min-h-[470px] sm:p-10">

            <div>

              <div className="mb-5 flex items-center gap-2">

                <span className="h-px w-7 bg-white/60" />

                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-white/70">
                  Snitch studio / 01
                </p>

              </div>

              <h1
                className="
                  max-w-2xl
                  font-serif
                  text-[48px]
                  leading-[0.88]
                  tracking-[-0.055em]
                  sm:text-[78px]
                "
              >
                Cloudy
                <br />
                Styles.
              </h1>

              <p className="mt-5 max-w-sm text-[10px] leading-5 text-white/75 sm:text-[11px]">
                Discover timeless everyday pieces designed around
                modern silhouettes, effortless comfort and personal
                style.
              </p>

            </div>


            <div className="flex items-end justify-between">

              <a
                href="#browse"
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-[5px]
                  border border-white
                  bg-white
                  px-4 py-2
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-[#211D1A]
                  transition-all
                  hover:bg-[#F1ECE6]
                "
              >
                Start shopping

                <span
                  className="
                    flex h-6 w-6
                    items-center justify-center
                    rounded-[4px]
                    bg-[#211D1A]
                    text-white
                    transition-transform
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                >
                  <FiArrowUpRight className="h-3.5 w-3.5" />
                </span>

              </a>

              <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:block">
                Top collection
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            INTRO
        ===================================================== */}

        <section
          id="about"
          className="scroll-mt-20 py-14 text-center sm:py-16"
        >

          <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.25em] text-[#8A837C]">
            The latest edit
          </p>

          <h2
            className="
              font-serif
              text-[32px]
              tracking-[-0.05em]
              sm:text-[42px]
            "
          >
            Fresh Fashion at
            <br className="sm:hidden" />
            {' '}Modern Vibes
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-[10px] leading-5 text-[#625B55] sm:text-[11px]">
            Our collection is constantly updated with the latest
            styles, ensuring you are always on point. Discover pieces
            that fit naturally into your wardrobe.
          </p>

        </section>


        {/* =====================================================
            EDITORIAL
        ===================================================== */}

        <section className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">

          <article
            className="
              overflow-hidden
              rounded-[7px]
              border border-[#E1DBD4]
              bg-[#E8E9E5]
              p-2
            "
          >

            <div
              className="
                h-64
                overflow-hidden
                rounded-[5px]
                bg-[#D7D8D4]
                sm:h-[330px]
              "
            >

              {featureImage ? (
                <img
                  src={featureImage}
                  alt="Discover new fashion trends"
                  className="
                    h-full w-full
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                  "
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FiPackage className="h-10 w-10 text-[#8A837C]" />
                </div>
              )}

            </div>

            <div className="px-2 pb-3 pt-5">

              <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#8A837C]">
                Editorial / 01
              </p>

              <h3 className="font-serif text-2xl italic tracking-[-0.04em]">
                Discover the limitless
              </h3>

              <p className="mt-1.5 text-[9px] text-[#625B55]">
                — Imagining new fashion trends
              </p>

            </div>

          </article>


          <article
            className="
              flex
              min-h-[390px]
              flex-col
              overflow-hidden
              rounded-[7px]
              border border-[#E1DBD4]
              bg-[#E8E9E5]
              p-6
              sm:min-h-0
            "
          >

            <div>

              <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.2em] text-[#8A837C]">
                Coming soon
              </p>

              <h3
                className="
                  max-w-[280px]
                  font-serif
                  text-[30px]
                  italic
                  leading-[0.95]
                  tracking-[-0.05em]
                "
              >
                Hold on, new product is coming!
              </h3>

              <p className="mt-4 max-w-[240px] text-[9px] leading-4 text-[#625B55]">
                — Bringing you a new era of simple clothes.
              </p>

            </div>

            <div
              className="
                mt-auto
                ml-auto
                w-full
                max-w-[210px]
                overflow-hidden
                rounded-[5px]
                border-[6px]
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
                  <FiPackage className="h-7 w-7 text-[#8A837C]" />
                </div>
              )}

            </div>

          </article>

        </section>


        {/* =====================================================
            PRODUCT BROWSE
        ===================================================== */}

        <section
          id="browse"
          className="scroll-mt-20 pt-16"
        >

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.24em] text-[#8A837C]">
                Curated for you
              </p>

              <h2
                className="
                  font-serif
                  text-[32px]
                  tracking-[-0.05em]
                  sm:text-[38px]
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
                gap-2
                border-b
                border-[#BDB6AE]
                pb-1
                text-[8px]
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

              <FiChevronRight className="h-3 w-3" />
            </button>

          </div>


          {/* CATEGORY FILTER */}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">

            {CATEGORIES.map((category) => {

              const isActive = category === activeCategory

              return (
                <button
                  type="button"
                  key={category}
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    shrink-0
                    rounded-[5px]
                    border
                    px-4 py-2.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    transition-all
                    ${
                      isActive
                        ? 'border-[#211D1A] bg-[#211D1A] text-white'
                        : 'border-[#D8D1C8] bg-white text-[#625B55] hover:border-[#211D1A] hover:text-[#211D1A]'
                    }
                  `}
                >
                  {category}
                </button>
              )
            })}

          </div>


          {/* RESULTS INFO */}

          {!isLoading && !loadError && (
            <div className="mt-4 flex items-center justify-between">

              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8A837C]">
                {visibleProducts.length}{' '}
                {visibleProducts.length === 1
                  ? 'piece'
                  : 'pieces'}{' '}
                found
              </p>

              {(activeCategory !== 'All' || searchTerm) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    text-[8px]
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


        {/* =====================================================
            LOADING
        ===================================================== */}

        {isLoading && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}

          </section>
        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {!isLoading && loadError && (
          <section
            className="
              mt-6
              flex min-h-[320px]
              flex-col
              items-center
              justify-center
              rounded-[7px]
              border
              border-dashed
              border-[#B7B1AA]
              bg-[#F2EFEA]
              px-6
              text-center
            "
          >

            <div
              className="
                mb-5
                flex h-12 w-12
                items-center justify-center
                rounded-[5px]
                border border-[#D8D1C8]
                bg-white
              "
            >
              <FiPackage className="h-5 w-5" />
            </div>

            <h2 className="font-serif text-2xl tracking-[-0.04em]">
              Something went wrong
            </h2>

            <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#625B55]">
              We couldn't load the collection right now. Please try
              again.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="
                mt-6
                rounded-[5px]
                border border-[#211D1A]
                bg-[#211D1A]
                px-5 py-2.5
                text-[8px]
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


        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!isLoading &&
          !loadError &&
          visibleProducts.length === 0 && (

            <section
              className="
                mt-6
                flex min-h-[320px]
                flex-col
                items-center
                justify-center
                rounded-[7px]
                border
                border-dashed
                border-[#B7B1AA]
                bg-[#F2EFEA]
                px-6 py-12
                text-center
              "
            >

              <div
                className="
                  mb-5
                  flex h-12 w-12
                  items-center justify-center
                  rounded-[5px]
                  border border-[#D8D1C8]
                  bg-white
                  text-[#211D1A]
                "
              >
                <FiSearch className="h-5 w-5" />
              </div>

              <h2
                className="
                  mb-2
                  font-serif
                  text-2xl
                  tracking-[-0.04em]
                "
              >
                {products.length === 0
                  ? 'No products available yet'
                  : 'Nothing matches those filters'}
              </h2>

              <p className="max-w-md text-[10px] leading-5 text-[#625B55]">
                {products.length === 0
                  ? 'Fresh drops will appear here once sellers publish their items.'
                  : 'Try another search or category to explore the collection.'}
              </p>

              {products.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-6
                    rounded-[5px]
                    border border-[#211D1A]
                    bg-[#211D1A]
                    px-5 py-2.5
                    text-[8px]
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


        {/* =====================================================
            PRODUCT GRID
        ===================================================== */}

        {!isLoading &&
          !loadError &&
          visibleProducts.length > 0 && (

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {visibleProducts.map((product) => {

                const firstImage = getProductImage(product)

                const stock = getProductStock(product)

                const isSaved = wishlist.has(product._id)

                const isOutOfStock = stock <= 0

                const hasVariants =
                  Array.isArray(product.variants) &&
                  product.variants.length > 0

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
                      rounded-[7px]
                      border border-[#E1DBD4]
                      bg-white
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[#CFC7BE]
                      hover:shadow-[0_14px_35px_rgba(33,29,26,0.07)]
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
                          alt={product.title || 'Product'}
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
                          absolute inset-x-0 bottom-0
                          h-24
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
                          left-3 top-3
                          rounded-[4px]
                          border border-white/60
                          bg-[#F8F5F1]/90
                          px-2.5 py-1.5
                          text-[7px]
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
                            bottom-3 left-3
                            rounded-[4px]
                            bg-[#211D1A]/90
                            px-2.5 py-1.5
                            text-[7px]
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
                            bottom-3 left-3
                            rounded-[4px]
                            border border-white/60
                            bg-white/90
                            px-2.5 py-1.5
                            text-[7px]
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


                      {/* WISHLIST */}

                      <button
                        type="button"
                        aria-label={
                          isSaved
                            ? `Remove ${product.title} from wishlist`
                            : `Save ${product.title}`
                        }
                        onClick={(event) =>
                          toggleWishlist(event, product._id)
                        }
                        className={`
                          absolute
                          right-3 top-3
                          flex h-8 w-8
                          items-center justify-center
                          rounded-[5px]
                          border
                          transition-all
                          ${
                            isSaved
                              ? 'border-[#211D1A] bg-[#211D1A] text-white opacity-100'
                              : 'border-[#D8D1C8] bg-white/90 text-[#211D1A] opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                          }
                        `}
                      >
                        <FiHeart
                          className={`
                            h-3.5 w-3.5
                            ${isSaved ? 'fill-current' : ''}
                          `}
                        />
                      </button>


                      {/* IMAGE COUNT */}

                      {product.images?.length > 1 && (
                        <span
                          className="
                            absolute
                            bottom-3 right-3
                            rounded-[4px]
                            bg-black/55
                            px-2 py-1
                            text-[7px]
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

                    <div className="space-y-3 p-4">

                      <div>

                        <div className="mb-1.5 flex items-start justify-between gap-3">

                          <h3
                            className="
                              line-clamp-1
                              font-serif
                              text-[17px]
                              leading-tight
                              tracking-[-0.04em]
                              text-[#211D1A]
                            "
                          >
                            {product.title || 'Untitled product'}
                          </h3>

                        </div>


                        <p
                          className="
                            line-clamp-2
                            min-h-8
                            text-[9px]
                            leading-4
                            text-[#625B55]
                          "
                        >
                          {product.description ||
                            'No description provided for this listing.'}
                        </p>

                      </div>


                      {/* PRODUCT META */}

                      <div className="flex items-center gap-2">

                        {product.category && (
                          <span
                            className="
                              rounded-[3px]
                              bg-[#F2EEE9]
                              px-2 py-1
                              text-[7px]
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
                              rounded-[3px]
                              bg-[#F2EEE9]
                              px-2 py-1
                              text-[7px]
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
                          pt-3
                        "
                      >

                        <div>

                          <p className="text-[13px] font-bold text-[#211D1A]">
                            {formatPrice(product.price)}
                          </p>

                          {!isOutOfStock && (
                            <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-[#8A837C]">
                              In stock
                            </p>
                          )}

                        </div>


                        <button
                          type="button"
                          disabled={isOutOfStock}
                          aria-label={`Add ${product.title} to bag`}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()

                            if (!isOutOfStock) {
                              openProduct(product._id)
                            }
                          }}
                          className={`
                            flex h-9 w-9
                            items-center justify-center
                            rounded-[5px]
                            border
                            transition-all
                            ${
                              isOutOfStock
                                ? 'cursor-not-allowed border-[#E2DBD1] bg-[#F2EFEA] text-[#A39C93]'
                                : 'border-[#D8D1C8] text-[#211D1A] hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white'
                            }
                          `}
                        >
                          <FiShoppingBag className="h-3.5 w-3.5" />
                        </button>

                      </div>

                    </div>

                  </article>
                )
              })}

            </section>
          )}


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="
            mt-16
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-[#E1DBD4]
            py-6
            sm:flex-row
          "
        >

          <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
            SNITCH
          </p>

          <p className="text-center text-[8px] text-[#8A837C]">
            Timeless pieces for everyday living
          </p>

          <p className="text-[8px] text-[#8A837C]">
            © {new Date().getFullYear()}
          </p>

        </footer>

      </div>
    </main>
  )
}

export default Home