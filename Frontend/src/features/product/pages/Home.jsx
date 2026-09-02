import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { FiArrowUpRight, FiChevronDown, FiChevronRight, FiHeart, FiMenu, FiPackage, FiSearch, FiShoppingBag, FiUser } from 'react-icons/fi'
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

  const heroImage = products[0]?.images?.[0]?.url
  const featureImage = products[1]?.images?.[0]?.url || heroImage
  const secondaryImage = products[2]?.images?.[0]?.url || heroImage
  const categories = ['All', 'Outerwear', 'Basics', 'Tops', 'Loungewear', 'Accessories']

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-3 py-4 font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-6 sm:py-7">
      <div className="mx-auto max-w-[1180px] rounded-[26px] px-4 py-4 sm:px-7 sm:py-5">
        <header className="flex items-center justify-between border-b border-[#E7E2DC] pb-4">
          <button type="button" aria-label="Open menu" className="rounded-full p-2 transition hover:bg-[#EEEAE5]"><FiMenu className="h-4 w-4" /></button>
          <Link to="/" className="text-[18px] font-bold tracking-[0.1em] text-[#211D1A]">SNITCH</Link>
          <nav className="hidden items-center gap-5 text-[9px] font-semibold text-[#625B55] sm:flex">
            <a href="#browse" className="transition hover:text-[#211D1A]">Blogs</a>
            <a href="#about" className="transition hover:text-[#211D1A]">FAQs</a>
            <Link to="/login" className="transition hover:text-[#211D1A]">Sign in</Link>
          </nav>
          <div className="flex items-center gap-2 sm:hidden">
            <Link to="/login" aria-label="Sign in" className="rounded-full p-2 hover:bg-[#EEEAE5]"><FiUser className="h-4 w-4" /></Link>
            <button type="button" aria-label="Shopping bag" className="rounded-full p-2 hover:bg-[#EEEAE5]"><FiShoppingBag className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto py-3 text-[9px] font-semibold text-[#625B55] [scrollbar-width:none]">
          <button type="button" className="flex shrink-0 items-center gap-2 rounded-full border border-[#E5DFD8] bg-white px-3 py-2">Clothing <FiChevronDown /></button>
          {['New arrivals', 'Sale', 'Search...'].map((item) => <button type="button" key={item} className="shrink-0 rounded-full border border-[#E5DFD8] bg-white px-3 py-2">{item}</button>)}
          <button type="button" aria-label="Search" className="rounded-full border border-[#E5DFD8] bg-white p-2"><FiSearch /></button>
        </div>

        <section className="relative isolate min-h-[340px] overflow-hidden rounded-[10px] bg-[#211D1A] sm:min-h-[410px]">
          {heroImage && <img src={heroImage} alt="Featured collection" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-75" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/20 to-black/5" />
          <div className="flex min-h-[340px] flex-col justify-between p-6 text-white sm:min-h-[410px] sm:p-9">
            <div><p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">Snitch studio / 01</p><h1 className="max-w-xl font-serif text-4xl leading-[0.95] tracking-[-0.055em] sm:text-6xl">Cloudy Styles.</h1><p className="mt-3 max-w-xs text-[10px] leading-5 text-white/80">Discover our wide ranging and timeless wardrobe. Pick your favourite style that makes your personal taste, style and suits your style.</p></div>
            <div className="flex items-end justify-between"><a href="#browse" className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-[9px] font-bold text-[#211D1A] transition hover:bg-[#F1ECE6]">Start shopping <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#211D1A] text-white"><FiArrowUpRight /></span></a><span className="text-[9px] font-semibold text-white/80">Top collection</span></div>
          </div>
        </section>

        <section id="about" className="py-10 text-center sm:py-12">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">The latest edit</p><h2 className="font-serif text-3xl tracking-[-0.05em] sm:text-4xl">Fresh Fashion at Modern Vibes</h2><p className="mx-auto mt-3 max-w-lg text-[10px] leading-5 text-[#625B55]">Our collection is constantly updated with the latest styles, ensuring you&apos;re always on point. Shop now and let your fashion sense shine with the newest arrivals at Snitch.</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-[10px] bg-[#E8E9E5] p-2"><div className="h-56 overflow-hidden rounded-[8px] bg-[#D7D8D4] sm:h-64">{featureImage ? <img src={featureImage} alt="Discover new fashion trends" className="h-full w-full object-cover" /> : <FiPackage className="m-auto h-full w-10 text-[#8A837C]" />}</div><div className="p-2 pt-4"><h3 className="font-serif text-xl italic tracking-[-0.04em]">Discover the unlimitless</h3><p className="mt-1 text-[9px] text-[#625B55]">-Imagining New Fashion Trends</p></div></article>
          <article className="overflow-hidden rounded-[10px] bg-[#E8E9E5] p-5 sm:p-6"><p className="font-serif text-2xl italic leading-none tracking-[-0.05em]">Hold on, new product is coming!</p><p className="mt-3 text-[9px] text-[#625B55]">-Bringing you a new era of simple clothes.</p><div className="mt-8 ml-auto max-w-[190px] overflow-hidden rounded-[14px] border-[8px] border-white bg-[#D7D8D4] shadow-sm">{secondaryImage ? <img src={secondaryImage} alt="New arrival" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3]" />}</div></article>
        </section>

        <section id="browse" className="pt-12"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">Curated for you</p><h2 className="font-serif text-3xl tracking-[-0.05em]">Browse All You Needs.</h2></div><Link to="/login" className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#625B55] sm:flex">View all <FiChevronRight /></Link></div><div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{categories.map((category, index) => <button type="button" key={category} className={`shrink-0 rounded-full border px-4 py-2 text-[9px] font-semibold ${index === 0 ? 'border-[#211D1A] bg-[#211D1A] text-white' : 'border-[#E5DFD8] bg-white text-[#625B55]'}`}>{category}</button>)}</div></section>

        {products.length === 0 ? (
          <section className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#B7B1AA] bg-[#F2EFEA] px-6 py-12 text-center">
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
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const firstImage = product.images?.[0]?.url

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-[10px] border border-[#E5DFD8] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(33,29,26,0.08)]"
                >
                  <div className="relative aspect-[1.08/1] overflow-hidden bg-[#E9E4DE]">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#EAE5E0] text-[#625B55]">
                        <FiPackage className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-[#F8F5F1]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#211D1A] backdrop-blur-sm">
                      New
                    </span>
                    <button type="button" aria-label={`Save ${product.title}`} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 transition group-hover:opacity-100"><FiHeart className="h-3.5 w-3.5" /></button>
                  </div>

                  <div className="space-y-2 p-3">
                    <div>
                      <h3 className="line-clamp-1 font-serif text-base leading-tight tracking-[-0.04em] text-[#211D1A]">
                        {product.title}
                      </h3>
                    </div>

                    <p className="line-clamp-2 min-h-8 text-[9px] leading-4 text-[#625B55]">
                      {product.description || 'No description provided for this listing.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-[#E2DBD1] pt-2">
                      <div>
                        <p className="text-sm font-semibold text-[#211D1A]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <button type="button" aria-label={`Add ${product.title} to bag`} className="rounded-full border border-[#E2DBD1] p-2 transition hover:bg-[#211D1A] hover:text-white"><FiShoppingBag className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
        <footer className="mt-12 border-t border-[#E7E2DC] py-5 text-center text-[9px] text-[#8A837C]">Snitch / timeless pieces for everyday living</footer>
      </div>
    </main>
  )
}

export default Home