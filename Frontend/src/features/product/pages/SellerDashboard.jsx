import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'
import {
  FiPlus,
  FiPackage,
  FiShoppingBag,
  FiImage,
  FiArrowUpRight,
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

const formatDate = (dateString) => {
  if (!dateString) return 'Recently'

  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const SellerDashboard = () => {
  const navigate = useNavigate()
  const { handleGetSellerProducts } = useProduct()

  const sellerProducts = useSelector(
    (state) => state.product.sellerProduct
  )

  const products = Array.isArray(sellerProducts)
    ? sellerProducts
    : []

  useEffect(() => {
    handleGetSellerProducts()
  }, [])

  const totalImages = products.reduce(
    (total, product) => total + (product.images?.length || 0),
    0
  )

  return (
    <main className="min-h-screen bg-[#E3E1DE] px-[1.5vw] py-[2vh] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-[2vw] lg:px-[3vw]">
      <div className="mx-auto max-w-[87.5vw]">

        {/* HEADER */}
        <header className="mb-[2vh] rounded-[1.5rem] border border-[#CEC8C1] bg-[#F8F6F2] px-[2vw] py-[2vh] shadow-[0_0.75rem_2.5rem_rgba(33,29,26,0.05)]">
          <div className="flex flex-col gap-[2vh] md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-[1vh] flex items-center gap-[0.4vw]">
                <span className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#211D1A]" />

                <p className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-[#77716B]">
                  Seller Dashboard
                </p>
              </div>

              <h1 className="font-serif text-[clamp(2.25rem,3vw,3.125rem)] leading-none tracking-[-0.055em]">
                Your collection
              </h1>

              <p className="mt-[1vh] max-w-[34rem] text-[0.875rem] leading-[1.5rem] text-[#716B65]">
                Manage your products, keep your collection organized,
                and bring your best pieces to customers.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-[0.5vw]">

              {/* HERO BANNER */}
              <Link
                to="/seller/hero"
                className="group inline-flex h-[2.75rem] items-center justify-center gap-[0.5vw] rounded-[0.75rem] border border-[#CEC8C1] bg-[#F1EEE9] px-[1.25vw] text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[#211D1A] transition-all duration-300 hover:bg-[#EAE6E0]"
              >
                <FiImage className="h-[1rem] w-[1rem] transition-transform duration-300 group-hover:scale-110" />
                Hero Banner
              </Link>

              {/* ADD PRODUCT */}
              <Link
                to="/seller/create-product"
                className="group inline-flex h-[2.75rem] items-center justify-center gap-[0.5vw] rounded-[0.75rem] bg-[#171615] px-[1.25vw] text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#2A2826] hover:shadow-[0_0.5rem_1.25rem_rgba(23,22,21,0.18)]"
              >
                <FiPlus className="h-[1rem] w-[1rem] transition-transform duration-300 group-hover:rotate-90" />
                Add Product
              </Link>

            </div>

          </div>
        </header>

        {/* STATS */}
        <section className="mb-[2vh] grid grid-cols-2 gap-[0.75vw] lg:grid-cols-3">

          {/* PRODUCTS */}
          <div className="rounded-[1.125rem] border border-[#CEC8C1] bg-[#F8F6F2] p-[1.25rem]">
            <div className="mb-[2vh] flex items-center justify-between">

              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#77716B]">
                Products
              </p>

              <div className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] bg-[#EAE6E0]">
                <FiPackage className="h-[1rem] w-[1rem]" />
              </div>

            </div>

            <p className="font-serif text-[1.875rem] tracking-[-0.04em]">
              {products.length}
            </p>

            <p className="mt-[0.25rem] text-[0.625rem] text-[#8A837C]">
              Active listings
            </p>
          </div>

          {/* IMAGES */}
          <div className="rounded-[1.125rem] border border-[#CEC8C1] bg-[#F8F6F2] p-[1.25rem]">
            <div className="mb-[2vh] flex items-center justify-between">

              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#77716B]">
                Images
              </p>

              <div className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] bg-[#EAE6E0]">
                <FiImage className="h-[1rem] w-[1rem]" />
              </div>

            </div>

            <p className="font-serif text-[1.875rem] tracking-[-0.04em]">
              {totalImages}
            </p>

            <p className="mt-[0.25rem] text-[0.625rem] text-[#8A837C]">
              Product images
            </p>
          </div>

          {/* STATUS */}
          <div className="col-span-2 rounded-[1.125rem] border border-[#CEC8C1] bg-[#211D1A] p-[1.25rem] text-white lg:col-span-1">

            <div className="mb-[2vh] flex items-center justify-between">

              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-white/50">
                Status
              </p>

              <span className="flex items-center gap-[0.375rem] rounded-full bg-white/10 px-[0.625rem] py-[0.25rem] text-[0.5rem] font-bold uppercase tracking-wider">
                <span className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#B8D8C0]" />
                Active
              </span>

            </div>

            <p className="font-serif text-[1.875rem] tracking-[-0.04em]">
              Live
            </p>

            <p className="mt-[0.25rem] text-[0.625rem] text-white/40">
              Your storefront is active
            </p>

          </div>

        </section>

        {/* PRODUCTS HEADER */}
        <div className="mb-[1vh] flex items-center justify-between px-[0.25vw]">

          <div>
            <h2 className="font-serif text-[1.5rem] tracking-[-0.04em]">
              Products
            </h2>

            <p className="mt-[0.25rem] text-[0.625rem] text-[#77716B]">
              {products.length === 0
                ? 'No listings available'
                : `${products.length} listing${products.length > 1 ? 's' : ''} in your collection`}
            </p>
          </div>

          {products.length > 0 && (
            <Link
              to="/seller/create-product"
              className="hidden items-center gap-[0.375vw] text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[#625B55] transition hover:text-[#211D1A] sm:flex"
            >
              Add another

              <FiArrowUpRight className="h-[0.875rem] w-[0.875rem]" />
            </Link>
          )}

        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <section className="flex min-h-[54vh] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#B8B1AA] bg-[#F5F2ED] px-[2vw] py-[6vh] text-center">

            <div className="mb-[2vh] flex h-[5rem] w-[5rem] items-center justify-center rounded-full border border-[#D4CEC7] bg-[#EBE7E1]">
              <FiPackage className="h-[1.75rem] w-[1.75rem] text-[#4E4945]" />
            </div>

            <p className="mb-[0.5rem] text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-[#817A73]">
              Your collection is empty
            </p>

            <h2 className="font-serif text-[clamp(1.75rem,2.5vw,2.25rem)] tracking-[-0.045em]">
              Start selling something beautiful.
            </h2>

            <p className="mt-[1vh] max-w-[26rem] text-[0.875rem] leading-[1.5rem] text-[#77716B]">
              Create your first product listing and start building
              your collection.
            </p>

            <Link
              to="/seller/create-product"
              className="mt-[3vh] inline-flex items-center gap-[0.5vw] rounded-[0.75rem] bg-[#211D1A] px-[1.25vw] py-[0.75rem] text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#332F2C]"
            >
              <FiShoppingBag className="h-[1rem] w-[1rem]" />
              Create Listing
            </Link>

          </section>
        ) : (

          /* PRODUCT GRID */
          <section className="grid grid-cols-1 gap-[1.25vw] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => {

              const firstImage = product.images?.[0]?.url

              return (
                <article
                  onClick={() =>
                    navigate(`/seller/product/${product._id}`)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()

                      navigate(
                        `/seller/product/${product._id}`
                      )
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  key={product._id}
                  className="group overflow-hidden rounded-[1.25rem] border border-[#CEC8C1] bg-[#F8F6F2] shadow-[0_0.5rem_1.875rem_rgba(33,29,26,0.035)] transition-all duration-300 hover:-translate-y-[0.25rem] hover:shadow-[0_1.125rem_2.5rem_rgba(33,29,26,0.09)]"
                >

                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E5DF]">

                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FiPackage className="h-[2rem] w-[2rem] text-[#918981]" />
                      </div>
                    )}

                    {/* IMAGE OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />

                    {/* STATUS */}
                    <div className="absolute left-[0.75rem] top-[0.75rem]">

                      <span className="inline-flex items-center gap-[0.375rem] rounded-full border border-white/40 bg-[#F8F6F2]/90 px-[0.625rem] py-[0.375rem] text-[0.5rem] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                        <span className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#617A68]" />
                        Live
                      </span>

                    </div>

                    {/* IMAGE COUNT */}
                    <div className="absolute bottom-[0.75rem] right-[0.75rem]">

                      <span className="flex items-center gap-[0.375rem] rounded-full bg-black/55 px-[0.625rem] py-[0.375rem] text-[0.5rem] font-semibold text-white backdrop-blur-md">
                        <FiImage className="h-[0.75rem] w-[0.75rem]" />
                        {product.images?.length || 0}
                      </span>

                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-[1.25rem]">

                    <div className="mb-[2vh]">

                      <div className="mb-[0.375rem] flex items-start justify-between gap-[0.75vw]">

                        <h3 className="line-clamp-2 font-serif text-[1.25rem] leading-[1.05] tracking-[-0.045em]">
                          {product.title}
                        </h3>

                        <FiArrowUpRight className="mt-[0.25rem] h-[1rem] w-[1rem] shrink-0 text-[#9B948C] opacity-0 transition duration-300 group-hover:translate-x-[0.125rem] group-hover:-translate-y-[0.125rem] group-hover:opacity-100" />

                      </div>

                      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-[#8A837C]">
                        Added {formatDate(product.createdAt)}
                      </p>

                    </div>

                    <p className="mb-[2.5vh] line-clamp-2 min-h-[2.5rem] text-[0.75rem] leading-[1.25rem] text-[#68615B]">
                      {product.description ||
                        'No description provided for this listing.'}
                    </p>

                    {/* FOOTER */}
                    <div className="flex items-end justify-between border-t border-[#E2DDD6] pt-[2vh]">

                      <div>

                        <p className="mb-[0.25rem] text-[0.5rem] font-bold uppercase tracking-[0.15em] text-[#8A837C]">
                          Price
                        </p>

                        <p className="text-[0.875rem] font-semibold tracking-[-0.02em]">
                          {formatPrice(product.price)}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()

                          navigate(
                            `/seller/product/${product._id}`
                          )
                        }}
                        className="flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] border border-[#D5CFC8] text-[#5D5751] transition hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
                      >
                        <FiArrowUpRight className="h-[0.875rem] w-[0.875rem]" />
                      </button>

                    </div>

                  </div>

                </article>
              )
            })}

          </section>
        )}

      </div>
    </main>
  )
}

export default SellerDashboard