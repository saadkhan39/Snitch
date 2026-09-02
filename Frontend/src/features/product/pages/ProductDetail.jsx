import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiHeart, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { useProduct } from '../hooks/useProduct'

const ProductDetail = () => {
  const { productId } = useParams()
  const { handleGetProductById } = useProduct()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      const result = await handleGetProductById(productId)
      if (result.success) {
        setProduct(result.data?.product ?? result.data)
      } else {
        setError(result.error)
      }
    }

    loadProduct()
  }, [productId])

   console.log('Product details:', product)
  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-5 font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#625B55] transition hover:text-[#211D1A]"><FiArrowLeft /> Back to collection</Link>

        {error ? (
          <section className="rounded-[10px] border border-dashed border-[#B7B1AA] bg-[#F2EFEA] px-6 py-16 text-center"><FiPackage className="mx-auto mb-4 h-9 w-9 text-[#8A837C]" /><h1 className="font-serif text-3xl">{error}</h1></section>
        ) : !product ? (
          <section className="rounded-[10px] bg-[#E8E9E5] px-6 py-16 text-center text-[10px] uppercase tracking-[0.16em] text-[#625B55]">Loading product details...</section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
                {(product.images ?? []).map((image, index) => <button type="button" key={image.url} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-[5px] border-2 bg-[#E9E4DE] ${selectedImage === index ? 'border-[#211D1A]' : 'border-transparent'}`}><img src={image.url} alt={`${product.title} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}
              </div>
              <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[10px] bg-[#E9E4DE] sm:order-2">{product.images?.[selectedImage]?.url ? <img src={product.images[selectedImage].url} alt={product.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8A837C]"><FiPackage className="h-12 w-12" /></div>}
                {product.images?.length > 1 && <><button type="button" aria-label="Previous product image" onClick={() => setSelectedImage((selectedImage - 1 + product.images.length) % product.images.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#D8D1C8] bg-white/90 text-[#211D1A] shadow-sm transition hover:bg-white"><FiChevronLeft /></button><button type="button" aria-label="Next product image" onClick={() => setSelectedImage((selectedImage + 1) % product.images.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#D8D1C8] bg-white/90 text-[#211D1A] shadow-sm transition hover:bg-white"><FiChevronRight /></button></>}
              </div>
            </div>

            <div className="pt-2 lg:pt-8">
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">Snitch / new arrival</p>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.05em] sm:text-5xl">{product.title}</h1>
              <p className="mt-5 text-2xl font-semibold">{formatPrice(product.price)}</p>
              <p className="mt-6 border-t border-[#E2DBD1] pt-6 text-sm leading-7 text-[#625B55]">{product.description || 'No description provided for this listing.'}</p>
              <div className="mt-8 flex flex-wrap gap-3"><button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-[5px] bg-[#211D1A] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#332F2C]"><FiShoppingBag /> Add to bag</button><button type="button" className="flex-1 rounded-[5px] border border-[#D8D1C8] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#211D1A] transition hover:bg-[#E8E9E5]">Buy now</button><button type="button" aria-label="Save product" className="rounded-[5px] border border-[#D8D1C8] px-5 text-[#211D1A] transition hover:bg-[#E8E9E5]"><FiHeart /></button></div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

const formatPrice = (price) => {
  if (!price) return 'Price not available'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: price.currency || 'INR', maximumFractionDigits: 2 }).format(Number(price.amount ?? 0))
}

export default ProductDetail