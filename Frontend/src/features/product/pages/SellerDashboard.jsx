import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
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
    <main className="min-h-screen bg-[#E3E1DE] px-4 py-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}
        <header className="mb-6 rounded-[24px] border border-[#CEC8C1] bg-[#F8F6F2] px-6 py-6 shadow-[0_12px_40px_rgba(33,29,26,0.05)] sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#211D1A]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#77716B]">
                  Seller Dashboard
                </p>
              </div>

              <h1 className="font-serif text-4xl leading-none tracking-[-0.055em] sm:text-5xl">
                Your collection
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#716B65]">
                Manage your products, keep your collection organized,
                and bring your best pieces to customers.
              </p>
            </div>

            <Link
              to="/seller/create-product"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#171615] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#2A2826] hover:shadow-[0_8px_20px_rgba(23,22,21,0.18)]"
            >
              <FiPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              Add Product
            </Link>

          </div>
        </header>

        {/* STATS */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">

          <div className="rounded-[18px] border border-[#CEC8C1] bg-[#F8F6F2] p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#77716B]">
                Products
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAE6E0]">
                <FiPackage className="h-4 w-4" />
              </div>
            </div>

            <p className="font-serif text-3xl tracking-[-0.04em]">
              {products.length}
            </p>

            <p className="mt-1 text-[10px] text-[#8A837C]">
              Active listings
            </p>
          </div>

          <div className="rounded-[18px] border border-[#CEC8C1] bg-[#F8F6F2] p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#77716B]">
                Images
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAE6E0]">
                <FiImage className="h-4 w-4" />
              </div>
            </div>

            <p className="font-serif text-3xl tracking-[-0.04em]">
              {totalImages}
            </p>

            <p className="mt-1 text-[10px] text-[#8A837C]">
              Product images
            </p>
          </div>

          <div className="col-span-2 rounded-[18px] border border-[#CEC8C1] bg-[#211D1A] p-5 text-white lg:col-span-1">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
                Status
              </p>

              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B8D8C0]" />
                Active
              </span>
            </div>

            <p className="font-serif text-3xl tracking-[-0.04em]">
              Live
            </p>

            <p className="mt-1 text-[10px] text-white/40">
              Your storefront is active
            </p>
          </div>

        </section>

        {/* PRODUCTS HEADER */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <h2 className="font-serif text-2xl tracking-[-0.04em]">
              Products
            </h2>

            <p className="mt-1 text-[10px] text-[#77716B]">
              {products.length === 0
                ? 'No listings available'
                : `${products.length} listing${products.length > 1 ? 's' : ''} in your collection`}
            </p>
          </div>

          {products.length > 0 && (
            <Link
              to="/seller/create-product"
              className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#625B55] transition hover:text-[#211D1A] sm:flex"
            >
              Add another
              <FiArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <section className="flex min-h-[430px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#B8B1AA] bg-[#F5F2ED] px-6 py-12 text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4CEC7] bg-[#EBE7E1]">
              <FiPackage className="h-7 w-7 text-[#4E4945]" />
            </div>

            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#817A73]">
              Your collection is empty
            </p>

            <h2 className="font-serif text-3xl tracking-[-0.045em]">
              Start selling something beautiful.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#77716B]">
              Create your first product listing and start building
              your collection.
            </p>

            <Link
              to="/seller/create-product"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#211D1A] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#332F2C]"
            >
              <FiShoppingBag className="h-4 w-4" />
              Create Listing
            </Link>

          </section>
        ) : (

          /* PRODUCT GRID */
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => {

              const firstImage = product.images?.[0]?.url

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-[20px] border border-[#CEC8C1] bg-[#F8F6F2] shadow-[0_8px_30px_rgba(33,29,26,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(33,29,26,0.09)]"
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
                        <FiPackage className="h-8 w-8 text-[#918981]" />
                      </div>
                    )}

                    {/* IMAGE OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />

                    {/* STATUS */}
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#F8F6F2]/90 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#617A68]" />
                        Live
                      </span>
                    </div>

                    {/* IMAGE COUNT */}
                    <div className="absolute bottom-3 right-3">
                      <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[8px] font-semibold text-white backdrop-blur-md">
                        <FiImage className="h-3 w-3" />
                        {product.images?.length || 0}
                      </span>
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-5">

                    <div className="mb-4">
                      <div className="mb-1.5 flex items-start justify-between gap-3">

                        <h3 className="line-clamp-2 font-serif text-xl leading-[1.05] tracking-[-0.045em]">
                          {product.title}
                        </h3>

                        <FiArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#9B948C] opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />

                      </div>

                      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#8A837C]">
                        Added {formatDate(product.createdAt)}
                      </p>
                    </div>

                    <p className="mb-5 line-clamp-2 min-h-[40px] text-xs leading-5 text-[#68615B]">
                      {product.description ||
                        'No description provided for this listing.'}
                    </p>

                    {/* FOOTER */}
                    <div className="flex items-end justify-between border-t border-[#E2DDD6] pt-4">

                      <div>
                        <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.15em] text-[#8A837C]">
                          Price
                        </p>

                        <p className="text-sm font-semibold tracking-[-0.02em]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D5CFC8] text-[#5D5751] transition hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white"
                      >
                        <FiArrowUpRight className="h-3.5 w-3.5" />
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