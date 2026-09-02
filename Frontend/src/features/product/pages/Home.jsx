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

const CATEGORIES = [
  'All',
  'Outerwear',
  'Basics',
  'Tops',
  'Loungewear',
  'Accessories',
]

const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-[6px] border border-[#E5DFD8] bg-white">
    <div className="aspect-[1/1.08] animate-pulse bg-[#EAE5E0]" />

    <div className="space-y-2.5 p-4">
      <div className="h-3.5 w-3/4 animate-pulse rounded-[2px] bg-[#EAE5E0]" />

      <div className="h-2.5 w-full animate-pulse rounded-[2px] bg-[#EFEBE5]" />

      <div className="h-2.5 w-1/2 animate-pulse rounded-[2px] bg-[#EFEBE5]" />

      <div className="flex items-center justify-between border-t border-[#E2DBD1] pt-3">
        <div className="h-3.5 w-16 animate-pulse rounded-[2px] bg-[#EAE5E0]" />

        <div className="h-8 w-8 animate-pulse rounded-[4px] bg-[#EAE5E0]" />
      </div>
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
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [wishlist, setWishlist] = useState(() => new Set())

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        await handleGetAllProducts()
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const heroImage = products[0]?.images?.[0]?.url
  const featureImage = products[1]?.images?.[0]?.url || heroImage
  const secondaryImage = products[2]?.images?.[0]?.url || heroImage

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' ||
        product.category === activeCategory

      const matchesSearch =
        !searchTerm.trim() ||
        product.title
          ?.toLowerCase()
          .includes(searchTerm.trim().toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchTerm])

  const clearFilters = () => {
    setActiveCategory('All')
    setSearchTerm('')
  }

  const toggleWishlist = (event, productId) => {
    event.stopPropagation()

    setWishlist((prev) => {
      const next = new Set(prev)

      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }

      return next
    })
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">

      {/* Main container */}
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-7 sm:py-7">

        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between border-b border-[#E1DBD4] pb-4">

          {/* Left */}
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

          {/* Logo */}
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

          {/* Desktop navigation */}
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

            <a
              href="#browse"
              className="transition-colors hover:text-[#211D1A]"
            >
              New
            </a>

            <Link
              to="/login"
              className="transition-colors hover:text-[#211D1A]"
            >
              Sign in
            </Link>

            <button
              type="button"
              aria-label="Shopping bag"
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

          {/* Mobile actions */}
          <div className="flex items-center gap-2 sm:hidden">

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
        </header>


        {/* ================= SHOP BAR ================= */}
        <div className="flex items-center gap-2 border-b border-[#E7E2DC] py-3">

          {/* Categories */}
          <div className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none]">

            <button
              type="button"
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


          {/* Search */}
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
                onChange={(event) => setSearchTerm(event.target.value)}
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


        {/* ================= HERO ================= */}
        <section
          className="
            relative isolate
            mt-5
            min-h-[360px]
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
                absolute inset-0 -z-10
                h-full w-full
                object-cover
                opacity-75
              "
            />
          )}

          <div
            className="
              absolute inset-0 -z-10
              bg-gradient-to-r
              from-black/65
              via-black/30
              to-black/5
            "
          />

          <div
            className="
              flex min-h-[360px]
              flex-col justify-between
              p-6 text-white
              sm:min-h-[470px]
              sm:p-10
            "
          >

            <div>

              <p className="mb-4 text-[8px] font-semibold uppercase tracking-[0.25em] text-white/70">
                Snitch studio / 01
              </p>

              <h1
                className="
                  max-w-2xl
                  font-serif
                  text-[46px]
                  leading-[0.9]
                  tracking-[-0.055em]
                  sm:text-[76px]
                "
              >
                Cloudy
                <br />
                Styles.
              </h1>

              <p className="mt-5 max-w-sm text-[10px] leading-5 text-white/75 sm:text-[11px]">
                Discover a collection of timeless everyday pieces
                designed around modern silhouettes, effortless comfort
                and personal style.
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


        {/* ================= INTRO ================= */}
        <section
          id="about"
          className="py-14 text-center sm:py-16"
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


        {/* ================= EDITORIAL ================= */}
        <section className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">

          {/* Large editorial card */}
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
                Discover the unlimitless
              </h3>

              <p className="mt-1.5 text-[9px] text-[#625B55]">
                — Imagining new fashion trends
              </p>

            </div>

          </article>


          {/* Small editorial card */}
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
                  className="
                    aspect-[4/3]
                    w-full
                    object-cover
                  "
                />
              ) : (
                <div className="aspect-[4/3]" />
              )}

            </div>

          </article>

        </section>


        {/* ================= PRODUCT BROWSE ================= */}
        <section id="browse" className="pt-16">

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


          {/* Category filter */}
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


          {!isLoading && (
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
                    sm:hidden
                  "
                >
                  Clear
                </button>
              )}

            </div>
          )}

        </section>


        {/* ================= PRODUCTS ================= */}
        {isLoading ? (

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}

          </section>

        ) : visibleProducts.length === 0 ? (

          /* Empty state */
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
              <FiPackage className="h-5 w-5" />
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
                : 'Try a different category or clear your search to see everything.'}
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

        ) : (

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {visibleProducts.map((product) => {

              const firstImage = product.images?.[0]?.url
              const isSaved = wishlist.has(product._id)

              return (
                <article
                  key={product._id}
                  onClick={() =>
                    navigate(`/product/${product._id}`)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      navigate(`/product/${product._id}`)
                    }
                  }}
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
                  "
                >

                  {/* Product image */}
                  <div
                    className="
                      relative
                      aspect-[1/1.08]
                      overflow-hidden
                      bg-[#E9E4DE]
                    "
                  >

                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="
                          h-full w-full
                          object-cover
                          transition-transform
                          duration-700
                          group-hover:scale-[1.04]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex h-full
                          items-center justify-center
                          bg-[#EAE5E0]
                          text-[#625B55]
                        "
                      >
                        <FiPackage className="h-8 w-8" />
                      </div>
                    )}


                    {/* New label */}
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


                    {/* Wishlist */}
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
                            : 'border-[#D8D1C8] bg-white/90 text-[#211D1A] opacity-0 group-hover:opacity-100'
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

                  </div>


                  {/* Product info */}
                  <div className="space-y-3 p-4">

                    <div>

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
                        {product.title}
                      </h3>

                      <p
                        className="
                          mt-1.5
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


                    {/* Bottom */}
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

                      <p className="text-[13px] font-bold text-[#211D1A]">
                        {formatPrice(product.price)}
                      </p>

                      <button
                        type="button"
                        aria-label={`Add ${product.title} to bag`}
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="
                          flex h-8 w-8
                          items-center justify-center
                          rounded-[5px]
                          border border-[#D8D1C8]
                          text-[#211D1A]
                          transition-all
                          hover:border-[#211D1A]
                          hover:bg-[#211D1A]
                          hover:text-white
                        "
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


        {/* ================= FOOTER ================= */}
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