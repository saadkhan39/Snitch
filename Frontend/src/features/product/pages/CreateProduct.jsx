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

  /* ── shared input style matching Login/Register ── */
  const inputCls =
    "w-full bg-white/[0.03] text-white px-3 py-2 rounded-t-md border-b border-white/20 focus:border-[#F59E0B] text-sm placeholder-slate-500 focus:outline-none transition-colors duration-200"
  const labelCls = "block text-[11px] font-medium text-slate-300 tracking-wide"

  return (
    <div className="h-screen w-screen bg-[#0D0E13] text-[#E2E8F0] overflow-hidden flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500/30 selection:text-amber-300">

      {/* ── Form Panel (full width) ── */}
      <div className="flex-1 h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 xl:px-16 py-6 bg-[#0D0E13] relative overflow-y-auto lg:overflow-hidden">

        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between mb-5">
          <span className="text-xl font-bold tracking-[0.2em] text-[#F59E0B] font-['Space_Grotesk']">
            SNITCH.
          </span>
          <Link to="/products" className="text-xs text-[#F59E0B] hover:underline">
            ← Products
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">

          {/* Header */}
          <div className="mb-4">
            <span className="block text-[10px] font-bold tracking-[0.2em] text-[#F59E0B] uppercase font-['Space_Grotesk'] mb-1">
              ADMIN — NEW LISTING
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight font-['Space_Grotesk']">
              Create Product
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-3 p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-2 text-amber-300 text-xs">
              <FiCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Title */}
            <div className="space-y-1">
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
            <div className="space-y-1">
              <label htmlFor="description" className={labelCls}>Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Fabric, fit, feel..."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Price row */}
            <div className="flex gap-3">
              <div className="space-y-1 w-[58%]">
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
              <div className="space-y-1 w-[42%]">
                <label htmlFor="priceCurrency" className={labelCls}>Currency</label>
                <select
                  id="priceCurrency"
                  name="priceCurrency"
                  value={form.priceCurrency}
                  onChange={handleChange}
                  className={`${inputCls} cursor-pointer`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0D0E13] text-white">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Product Images</label>
                <span className="text-[10px] text-slate-500 tracking-wide">
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
                  className={`w-full h-20 border border-dashed rounded-md flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer group text-sm
                    ${isDragging
                      ? 'border-[#F59E0B]/60 bg-amber-500/[0.04] text-[#F59E0B]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <FiUploadCloud size={18} className="flex-shrink-0 transition-colors duration-200" />
                  <span className="text-xs tracking-wide">
                    Drag & drop or <span className="text-white underline underline-offset-2">browse</span>
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
                      className="relative group aspect-square rounded overflow-hidden bg-white/[0.04] border border-white/[0.06]"
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
                        <span className="absolute bottom-0.5 left-0.5 text-[7px] font-semibold tracking-wide uppercase bg-[#F59E0B]/90 text-black px-1 py-0.5 rounded-sm">
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
                className="w-full bg-[#F59E0B] hover:bg-[#e08e06] text-black font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] text-sm font-['Space_Grotesk'] tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Publish Product'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Cancel */}
            <div className="text-center">
              <Link
                to="/products"
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Cancel & go back to Products
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProduct