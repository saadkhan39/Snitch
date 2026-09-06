import React, { useEffect, useState } from 'react'
import { useProduct } from '../hooks/useProduct';
import { Link, useParams } from 'react-router';
import { FiArrowLeft, FiImage, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi';

const SellerProductDetail = () => {
  const [ product, setProduct ] = useState(null);
  const [ localVariants, setLocalVariants ] = useState([]);
  const [ isAddingVariant, setIsAddingVariant ] = useState(false);
  const [ loading, setLoading ] = useState(true);

  // UI state for inputs to maintain focus
  const [ attributeInputs, setAttributeInputs ] = useState([ { key: '', value: '' } ]);

  // New variant state
  const [ newVariant, setNewVariant ] = useState({
    images: [],
    stock: 0,
    attributes: {}, // Strictly an object
    price: { amount: '', currency: 'INR' }
  });

  const { productId } = useParams();
  const { handleGetProductById, handleCreateProductVariant } = useProduct();

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const result = await handleGetProductById(productId);
      if (!result.success) {
        throw new Error(result.error);
      }

      const prod = result.data?.product || result.data;
      setProduct(prod);
      // Initialize variants locally
      if (prod?.variants) {
        setLocalVariants(prod.variants);
      }
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductDetails();
  }, [ productId ]);

  // Handlers for modifying existing variant stock natively
  const handleStockChange = (index, newStock) => {
    const updatedVariants = [ ...localVariants ];
    updatedVariants[ index ] = { ...updatedVariants[ index ], stock: Number(newStock) };
    setLocalVariants(updatedVariants);
  };

  // Handlers for New Variant Form
  const handleAddNewVariant = async () => {
    // Validate required at least one attribute to be filled
    const hasValidAttribute = attributeInputs.some(attr => attr.key.trim() && attr.value.trim());
    if (!hasValidAttribute) {
      alert("At least one valid attribute is required.");
      return;
    }

    // Maps preview URL so the variant list can display the image locally
    const cleanImages = newVariant.images.map(img => ({ url: img.previewUrl, file: img.file }));

    // Attributes is already an object in newVariant, just use it safely
    const cleanAttributes = { ...newVariant.attributes };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined // price is optional
    };

    setLocalVariants([ ...localVariants, variantToSave ]);
    setIsAddingVariant(false);

    console.log('Variant data being submitted:', variantToSave);
    const result = await handleCreateProductVariant(productId, variantToSave)
    console.log('Variant creation response:', result);
    if (!result.success) {
      alert(result.error)
      return
    }

    // Reset form
    // Note: should ideally revoke old object URLs as well to prevent memory leaks if it were a long-lived SPA
    setAttributeInputs([ { key: '', value: '' } ]);
    setNewVariant({
      images: [],
      stock: 0,
      attributes: {},
      price: { amount: '', currency: 'INR' }
    });
  };

  

  const handleAddAttribute = () => {
    setAttributeInputs(prev => [ ...prev, { key: '', value: '' } ]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedInputs = [ ...attributeInputs ];
    updatedInputs[ index ][ field ] = value;
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleRemoveAttribute = (index) => {
    const updatedInputs = attributeInputs.filter((_, i) => i !== index);
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 7 - newVariant.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`You can only upload up to 7 images. ${filesToAdd.length} added.`);
    }

    const newImageObjects = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setNewVariant(prev => ({
      ...prev,
      images: [ ...prev.images, ...newImageObjects ]
    }));

    // Clear the input so identical files can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = newVariant.images[ index ];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const updatedImages = newVariant.images.filter((_, i) => i !== index);
    setNewVariant(prev => ({ ...prev, images: updatedImages }));
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#E3E1DE] font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-[0.16em] text-[#625B55]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="flex min-h-screen items-center justify-center bg-[#E3E1DE] font-['Plus_Jakarta_Sans',sans-serif] text-[10px] uppercase tracking-[0.16em] text-[#625B55]">Product not found</div>;
  }

  

  return (
    <main className="min-h-screen bg-[#E3E1DE] px-4 py-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-350">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/seller/dashboard" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#625B55] transition hover:text-[#211D1A]"><FiArrowLeft /> Back to collection</Link>
          <span className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#77716B] sm:flex"><FiPackage /> Product inventory</span>
        </header>

        {/* Base Product Info */}
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
            {/* Gallery placeholder */}
            <div className="order-1 aspect-4/5 overflow-hidden rounded-[10px] bg-[#E9E4DE] sm:order-2">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[ 0 ].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#8A837C]"><FiImage className="h-12 w-12" /></div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
                {product.images.slice(1).map((img, i) => (
                  <img key={i} src={img.url} alt={`Thumb ${i}`} className="h-20 w-20 shrink-0 rounded-[5px] object-cover bg-[#E9E4DE]" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[18px] border border-[#CEC8C1] bg-[#F8F6F2] p-6 sm:p-8 lg:mt-8">
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">Snitch / seller listing</p>
            <h1 className="font-serif text-4xl leading-none tracking-tighter sm:text-5xl">{product.title}</h1>
            <p className="mt-5 text-2xl font-semibold">{product.price?.amount} {product.price?.currency}</p>
            <p className="mt-6 border-t border-[#E2DBD1] pt-6 text-sm leading-7 text-[#625B55]">{product.description || 'No description provided for this listing.'}</p>
            <div className="mt-7 flex items-center gap-3 border-t border-[#E2DBD1] pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#77716B]"><span className="h-1.5 w-1.5 rounded-full bg-[#6C9274]" /> Listing active</div>
          </div>
        </section>

        {/* Variants & Inventory */}
        <section className="rounded-3xl border border-[#CEC8C1] bg-[#F8F6F2] p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-[#E2DBD1] pb-6 md:flex-row md:items-center">
            <div><p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#77716B]">Manage availability</p><h2 className="font-serif text-3xl tracking-[-0.04em]">Variants & inventory</h2></div>
            {!isAddingVariant && (
              <button
                onClick={() => setIsAddingVariant(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#211D1A] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#332F2C]"
              >
                <FiPlus /> Add New Variant
              </button>
            )}
          </div>

          {/* Add New Variant Form */}
          {isAddingVariant && (
            <div className="mb-10 rounded-[14px] border border-[#D8D1C8] bg-[#F5F2ED] p-5 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-serif text-2xl tracking-[-0.03em]">Create variant</h4>
                <button
                  onClick={() => setIsAddingVariant(false)}
                  className="text-[#7f7668] hover:text-[#1b1c1a] text-sm uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Left Col: Attributes & Basics */}
                <div className="space-y-6">

                  {/* Dynamic Attributes */}
                  <div>
                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77716B]">Attributes (e.g. Size, Color) *</label>
                    <div className="space-y-3">
                      {attributeInputs.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Key (e.g., Size)"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            className="w-1/2 border-b border-[#CEC8C1] bg-transparent py-2 text-sm outline-none placeholder:text-[#A8A19A] focus:border-[#211D1A]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., M)"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            className="w-1/2 border-b border-[#CEC8C1] bg-transparent py-2 text-sm outline-none placeholder:text-[#A8A19A] focus:border-[#211D1A]"
                          />
                          {attributeInputs.length > 1 && (
                            <button aria-label="Remove attribute" onClick={() => handleRemoveAttribute(index)} className="rounded-lg p-2 text-[#8C5750] transition hover:bg-[#EAD8D3]">
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddAttribute}
                      className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#625B55] hover:text-[#211D1A]"
                    >
                      <FiPlus /> Add Attribute
                    </button>
                  </div>

                  {/* Stock & Price */}
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77716B]">Initial Stock</label>
                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                        className="w-full border-b border-[#CEC8C1] bg-transparent py-2 text-sm outline-none focus:border-[#211D1A]"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77716B]">Price Amount (Optional)</label>
                      <input
                        type="number"
                        value={newVariant.price.amount}
                        onChange={(e) => setNewVariant({ ...newVariant, price: { ...newVariant.price, amount: e.target.value } })}
                        placeholder="Default if empty"
                        className="w-full border-b border-[#CEC8C1] bg-transparent py-2 text-sm outline-none placeholder:text-[#A8A19A] focus:border-[#211D1A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Right Col: Images */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77716B]">Image Upload (Max 7, Optional)</label>
                    <span className="text-[10px] text-[#8A837C]">{newVariant.images.length}/7</span>
                  </div>

                  {newVariant.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {newVariant.images.map((img, index) => (
                        <div key={index} className="relative aspect-4/5 overflow-hidden rounded-[5px] bg-[#E9E4DE]">
                          <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            aria-label="Remove image"
                            className="absolute right-1 top-1 rounded bg-white/85 p-1 text-[#8C5750] transition hover:bg-white"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newVariant.images.length < 7 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-[#625B55]
                          file:rounded-lg file:border-0 file:bg-[#E8E4DE] file:px-4 file:py-2 file:text-[#211D1A]
                          hover:file:bg-[#DCD7D0] file:cursor-pointer file:uppercase file:text-[10px] file:tracking-[0.12em] file:font-bold
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleAddNewVariant}
                  className="rounded-xl bg-[#211D1A] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#332F2C]"
                >
                  Save Variant
                </button>
              </div>
            </div>
          )}

          {/* Variants List */}
          {localVariants.length === 0 ? (
            <div className="py-12 text-center text-[#6e6258]">
              <FiPackage className="mx-auto mb-3 h-7 w-7 text-[#8A837C]" /><p className="text-[10px] uppercase tracking-[0.14em]">No variants have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {localVariants.map((variant, idx) => (
                <div key={idx} className="flex flex-col rounded-[14px] border border-[#D8D1C8] bg-white pt-4 shadow-[0_8px_24px_rgba(33,29,26,0.04)]">
                  <div className="px-6 flex gap-4 h-24 mb-4">
                    {/* Variant Thumb */}
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[5px] bg-[#E9E4DE]">
                      {variant.images && variant.images.length > 0 ? (
                        <img src={variant.images[ 0 ].url} alt="Variant" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-[#8A837C]">N/A</div>
                      )}
                    </div>
                    {/* Attributes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(variant.attributes || {}).map(([ key, val ]) => (
                          <span key={key} className="rounded bg-[#EAE6E0] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[#4E4945]">
                            <span className="text-[#8A837C]">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm font-light">
                        {variant.price?.amount ? `${variant.price.amount} ${variant.price.currency}` : 'Base Price'}
                      </div>
                    </div>
                  </div>

                  {/* Stock Management Row */}
                  <div className="mt-auto flex items-center justify-between border-t border-[#E8E4DE] bg-[#F5F2ED] px-6 py-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#77716B]">Current Stock</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) => handleStockChange(idx, e.target.value)}
                        className="w-20 border-b border-[#CEC8C1] bg-transparent py-1 text-right font-serif text-lg outline-none focus:border-[#211D1A]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>
    </main>
  )
}

export default SellerProductDetail