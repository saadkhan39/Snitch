import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiPackage } from 'react-icons/fi'
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

const Home = () => {
  const products = useSelector((state) => state.product?.allProducts ?? [])
  const { handleGetAllProducts } = useProduct()

  useEffect(() => {
    handleGetAllProducts()
  }, [])

  return (
    <main className="min-h-screen bg-[#D6D5D3] px-4 py-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[20px] border border-[#CFC7BE] bg-[#F6F3EE] p-5 shadow-[0_10px_30px_rgba(33,29,26,0.04)]">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#625B55]">
            New arrivals
          </p>
          <h1 className="font-serif text-3xl tracking-[-0.04em] text-[#211D1A] sm:text-4xl">
            Shop all products
          </h1>
        </header>

        {products.length === 0 ? (
          <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#B7B1AA] bg-[#F2EFEA] px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAE5E0] text-[#211D1A]">
              <FiPackage className="h-7 w-7" />
            </div>
            <h2 className="mb-2 font-serif text-2xl tracking-[-0.04em] text-[#211D1A]">
              No products available yet
            </h2>
            <p className="max-w-md text-sm text-[#625B55]">
              Fresh drops will appear here once sellers publish their items.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const firstImage = product.images?.[0]?.url

              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-[18px] border border-[#CFC7BE] bg-[#F8F5F1] shadow-[0_12px_30px_rgba(33,29,26,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(33,29,26,0.08)]"
                >
                  <div className="relative h-72 overflow-hidden bg-[#E9E4DE]">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#EAE5E0] text-[#625B55]">
                        <FiPackage className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-[#F8F5F1]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#211D1A] backdrop-blur-sm">
                      New
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="line-clamp-2 font-serif text-[22px] leading-tight tracking-[-0.04em] text-[#211D1A]">
                        {product.title}
                      </h3>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-[#4E4945]">
                      {product.description || 'No description provided for this listing.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-[#E2DBD1] pt-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#625B55]">
                          Price
                        </p>
                        <p className="mt-1 text-xl font-semibold text-[#211D1A]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#625B55]">
                          Images
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#211D1A]">
                          {product.images?.length || 0}
                        </p>
                      </div>
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

export default Home