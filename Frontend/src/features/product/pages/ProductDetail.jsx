import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiHeart, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { useProduct } from '../hooks/useProduct'

const ProductDetail = () => {
  const { productId } = useParams()
  const { handleGetProductById } = useProduct()
  const [product, setProduct] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
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

  const variants = product?.variants ?? []

  const attributeOptions = useMemo(() => {
    const options = {}

    variants.forEach((variant) => {
      Object.entries(toAttributes(variant.attributes)).forEach(([key, value]) => {
        const optionKey = Object.keys(options).find((existingKey) => normalize(existingKey) === normalize(key)) ?? key
        options[optionKey] ??= []

        splitValues(value).forEach((option) => {
          if (!options[optionKey].some((existing) => normalize(existing) === normalize(option))) {
            options[optionKey].push(option)
          }
        })
      })
    })

    const parentAttributes = toAttributes(product?.attributes)
    Object.entries(parentAttributes).forEach(([key, value]) => {
      const optionKey = Object.keys(options).find((existingKey) => normalize(existingKey) === normalize(key)) ?? key
      options[optionKey] ??= []
      splitValues(value).forEach((option) => {
        if (!options[optionKey].some((existing) => normalize(existing) === normalize(option))) {
          options[optionKey].push(option)
        }
      })
    })

    const colorKey = Object.keys(options).find((key) => normalize(key) === 'color')
    const titleColor = colorKey ? findColorInTitle(product?.title) : null
    if (colorKey && titleColor && !options[colorKey].some((option) => normalize(option) === normalize(titleColor))) {
      options[colorKey].unshift(titleColor)
    }

    return options
  }, [product, variants])

  const selectedVariant = useMemo(() => {
    if (!Object.keys(selectedAttributes).length) return null

    return variants.find((variant) => {
      const attributes = toAttributes(variant.attributes)
      const parentAttributes = toAttributes(product?.attributes)
      return Object.entries(selectedAttributes).every(([key, value]) => (
        splitValues(findAttributeValue(attributes, key) ?? findAttributeValue(parentAttributes, key)).some((option) => normalize(option) === normalize(value))
      ))
    }) ?? null
  }, [product, selectedAttributes, variants])

  const defaultAttributes = useMemo(() => {
    const colorKey = Object.keys(attributeOptions).find((key) => normalize(key) === 'color')
    const titleColor = findColorInTitle(product?.title)
    return colorKey && titleColor ? { [colorKey]: titleColor } : {}
  }, [attributeOptions, product])

  const displayedProduct = useMemo(() => {
    if (!product) return null

    return {
      ...product,
      ...selectedVariant,
      images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
      price: selectedVariant?.price?.amount !== undefined ? selectedVariant.price : product.price,
      title: selectedVariant?.title || product.title,
      description: selectedVariant?.description || product.description,
    }
  }, [product, selectedVariant])

  const displayedStock = selectedVariant?.stock ?? product?.stock

  useEffect(() => {
    setSelectedAttributes({})
    setSelectedImage(0)
  }, [productId])

  useEffect(() => {
    setSelectedImage(0)
  }, [selectedVariant])

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
                {(displayedProduct.images ?? []).map((image, index) => <button type="button" key={image._id ?? image.url} onClick={() => setSelectedImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-[5px] border-2 bg-[#E9E4DE] ${selectedImage === index ? 'border-[#211D1A]' : 'border-transparent'}`}><img src={image.url} alt={`${displayedProduct.title} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}
              </div>
              <div className="relative order-1 aspect-4/5 overflow-hidden rounded-[10px] bg-[#E9E4DE] sm:order-2">{displayedProduct.images?.[selectedImage]?.url ? <img src={displayedProduct.images[selectedImage].url} alt={displayedProduct.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8A837C]"><FiPackage className="h-12 w-12" /></div>}
                {displayedProduct.images?.length > 1 && <><button type="button" aria-label="Previous product image" onClick={() => setSelectedImage((selectedImage - 1 + displayedProduct.images.length) % displayedProduct.images.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#D8D1C8] bg-white/90 text-[#211D1A] shadow-sm transition hover:bg-white"><FiChevronLeft /></button><button type="button" aria-label="Next product image" onClick={() => setSelectedImage((selectedImage + 1) % displayedProduct.images.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[5px] border border-[#D8D1C8] bg-white/90 text-[#211D1A] shadow-sm transition hover:bg-white"><FiChevronRight /></button></>}
              </div>
            </div>

            <div className="pt-2 lg:pt-8">
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">Snitch / new arrival</p>
              <h1 className="font-serif text-4xl leading-none tracking-tighter sm:text-5xl">{displayedProduct.title}</h1>
              <p className="mt-5 text-2xl font-semibold">{formatPrice(displayedProduct.price)}</p>
              <p className="mt-6 border-t border-[#E2DBD1] pt-6 text-sm leading-7 text-[#625B55]">{displayedProduct.description || 'No description provided for this listing.'}</p>
              {Object.keys(attributeOptions).length > 0 && <div className="mt-8 space-y-5 border-t border-[#E2DBD1] pt-6">{Object.entries(attributeOptions).map(([key, options]) => <div key={key}><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]">{key}</p><div className="flex flex-wrap gap-2">{options.map((option) => { const isSelected = selectedAttributes[key] ? normalize(selectedAttributes[key]) === normalize(option) : normalize(defaultAttributes[key]) === normalize(option); return <button type="button" key={`${key}-${option}`} onClick={() => setSelectedAttributes((current) => ({ ...current, [key]: option }))} className={`rounded-[5px] border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${isSelected ? 'border-[#211D1A] bg-[#211D1A] text-white' : 'border-[#D8D1C8] bg-white hover:border-[#211D1A]'}`}>{option}</button> })}</div>{normalize(key) === 'size' && displayedStock !== undefined && <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.14em] ${Number(displayedStock) <= 20 ? 'text-[#B42318]' : 'text-[#217346]'}`}>{displayedStock > 0 ? `${displayedStock} in stock` : 'Out of stock'}</p>}</div>)}<button type="button" onClick={() => setSelectedAttributes({})} className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A837C] transition hover:text-[#211D1A]">Use default product values</button></div>}
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

const toAttributes = (attributes) => {
  if (!attributes) return {}
  if (typeof attributes === 'string') {
    try {
      return JSON.parse(attributes)
    } catch {
      return {}
    }
  }
  if (attributes instanceof Map) return Object.fromEntries(attributes)
  return attributes
}

const findAttributeValue = (attributes, key) => {
  const entry = Object.entries(attributes).find(([attributeKey]) => normalize(attributeKey) === normalize(key))
  return entry?.[1]
}

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const splitValues = (value) => {
  if (Array.isArray(value)) return value.flatMap(splitValues)
  return String(value ?? '').split(',').map((option) => option.trim()).filter(Boolean)
}

const findColorInTitle = (title) => {
  const colors = ['black', 'white', 'brown', 'beige', 'biege', 'blue', 'green', 'grey', 'gray', 'red', 'yellow', 'orange', 'pink', 'purple', 'khaki']
  return colors.find((color) => new RegExp(`\\b${color}\\b`, 'i').test(title ?? '')) ?? null
}

export default ProductDetail