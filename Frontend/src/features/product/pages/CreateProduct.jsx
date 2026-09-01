import React, { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import { FiUploadCloud, FiX, FiChevronRight, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { useProduct } from '../hooks/useProduct'

const MAX_IMAGES = 7
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
  })
  const [images, setImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const addFiles = useCallback(
    (files) => {
      const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
      const slots = MAX_IMAGES - images.length
      if (slots <= 0) return
      const toAdd = valid.slice(0, slots).map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        url: URL.createObjectURL(f),
      }))
      setImages((prev) => [...prev, ...toAdd])
    },
    [images.length]
  )

  const removeImage = (id) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter((i) => i.id !== id)
    })
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = useCallback(
    (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) },
    [addFiles]
  )
  const handleFileInput = (e) => { addFiles(e.target.files); e.target.value = '' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim()) return setError('Please enter a product title.')
    if (!form.priceAmount || Number(form.priceAmount) <= 0)
      return setError('Please enter a valid price.')
    if (images.length === 0) return setError('Please upload at least one product image.')

    setLoading(true)

    const formDataToSend = new FormData()
    formDataToSend.append('title', form.title.trim())
    formDataToSend.append('description', form.description.trim())
    formDataToSend.append('priceAmount', form.priceAmount)
    formDataToSend.append('priceCurrency', form.priceCurrency)
    images.forEach((img) => {
      formDataToSend.append('images', img.file)
    })

    const result = await handleCreateProduct(formDataToSend)
    setLoading(false)

    if (result.success) {
      setSuccess('Product published successfully!')
      setForm({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR',
      })
      // Revoke URLs and clear images state
      images.forEach((img) => URL.revokeObjectURL(img.url))
      setImages([])
    } else {
      setError(result.error || 'Failed to create product.')
    }
  }

  const inputCls =
    "h-[34px] w-full rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none transition placeholder:text-[#AAA39B] focus:border-[#211D1A] focus:ring-1 focus:ring-[#211D1A]/10"
  const labelCls = "mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"

  return (
    <main className="h-screen w-full overflow-hidden bg-[#D6D5D3] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex h-full w-full">

      {/* ── Form Panel (full width) ── */}
      <section className="flex h-full w-full flex-col justify-center overflow-y-auto bg-[#dbd8d8] px-5 py-6 sm:px-10 md:px-14 lg:px-8 xl:px-16">

        {/* Mobile header */}
        <div className="mx-auto mb-6 flex w-full max-w-[420px] items-center justify-between">
          <span className="text-[18px] font-bold tracking-[0.3em] text-[#211D1A]">
            SNITCH
          </span>
          <Link to="/products" className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#211D1A] hover:underline">
            Products
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px]">

          {/* Header */}
          <div className="mb-5">
            <span className="mb-2 block text-[7px] font-bold uppercase tracking-[0.28em] text-[#131212]">
              New listing
            </span>
            <h1 className="font-serif text-[30px] leading-none tracking-[-0.03em] text-[#211D1A]">
              Create your product
            </h1>
            <div className="mt-3 h-[2px] w-7 bg-[#211D1A]" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[9px] text-red-600">
              <FiAlertCircle className="h-3 w-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-[9px] text-green-700">
              <FiCheck className="h-3 w-3 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelCls}>Product Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Washed Oversized Tee"
                required
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelCls}>Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Fabric, fit, feel..."
                rows={2}
                className={`${inputCls} resize-none p-2`}
              />
            </div>

            {/* Price row */}
            <div className="flex gap-3">
              <div className="w-[58%]">
                <label htmlFor="priceAmount" className={labelCls}>Price</label>
                <input
                  id="priceAmount"
                  name="priceAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div className="w-[42%]">
                <label htmlFor="priceCurrency" className={labelCls}>Currency</label>
                <select
                  id="priceCurrency"
                  name="priceCurrency"
                  value={form.priceCurrency}
                  onChange={handleChange}
                  className={`${inputCls} cursor-pointer`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-[#F8F6F2] text-[#211D1A]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>Product Images</label>
                <span className="text-[9px] tracking-wide text-[#AAA29A]">
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>

              {/* Drop Zone */}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-[5px] border border-dashed text-sm transition-all duration-200 group
                    ${isDragging
                      ? 'border-[#211D1A]/60 bg-[#211D1A]/5 text-[#211D1A]'
                      : 'border-[#CFC7BE] bg-[#F8F6F2] text-[#9A928A] hover:border-[#211D1A]/50 hover:text-[#625B55]'
                    }`}
                >
                  <FiUploadCloud size={18} className="shrink-0 transition-colors duration-200" />
                  <span className="text-xs tracking-wide">
                    Drag & drop or <span className="text-[#211D1A] underline underline-offset-2">browse</span>
                    {' '}— up to {MAX_IMAGES} images
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </button>
              )}

              {/* Thumbnails */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2]"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 text-white"
                        aria-label="Remove"
                      >
                        <FiX size={9} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 rounded-sm bg-[#211D1A]/90 px-1 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-white">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="mt-0.5 flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#131212] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:bg-[#2B2927] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Publish Product'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-[#D8D1C8]" />
              <span className="text-[7px] uppercase tracking-[0.15em] text-[#AAA29A]">or</span>
              <div className="h-px flex-1 bg-[#D8D1C8]" />
            </div>

            {/* Cancel */}
            <div className="text-center">
              <Link
                to="/products"
                className="text-[10px] font-bold text-[#211D1A] transition-colors hover:text-[#211D1A]"
              >
                Cancel & go back to Products
              </Link>
            </div>

          </form>
        </div>
      </section>
      </div>
    </main>
  )
}

export default CreateProduct