import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useParams } from "react-router";

// =========================================================
// ICONS
// =========================================================

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// =========================================================
// IMAGE URL HELPER
// =========================================================

const getImageUrl = (image) =>
  image?.url ||
  image?.thumbnailUrl ||
  image?.filePath ||
  "";

// =========================================================
// COMPONENT
// =========================================================

const SellerProductDetails = () => {
  const { productId } = useParams();

  const {
    handleGetProductById,
    handleAddProductVariant,
  } = useProduct();

  // =======================================================
  // PRODUCT STATE
  // =======================================================

  const [product, setProduct] = useState(null);
  const [localVariants, setLocalVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // =======================================================
  // UI STATE
  // =======================================================

  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // IMPORTANT:
  // This state controls which product image is displayed.
  const [selectedImage, setSelectedImage] = useState(0);

  // =======================================================
  // ATTRIBUTE INPUTS
  // =======================================================

  const [attributeInputs, setAttributeInputs] = useState([
    {
      key: "",
      value: "",
    },
  ]);

  // =======================================================
  // NEW VARIANT
  // =======================================================

  const [newVariant, setNewVariant] = useState({
    images: [],
    stock: 0,
    attributes: {},
    price: {
      amount: "",
      currency: "INR",
    },
  });

  // =======================================================
  // FETCH PRODUCT
  // =======================================================

  const fetchProductDetails = async () => {
    setLoading(true);

    try {
      const data = await handleGetProductById(productId);

      const prod =
        data?.data?.product ||
        data?.data ||
        data?.product ||
        data;

      setProduct(prod);

      // Reset main image whenever product changes
      setSelectedImage(0);

      if (Array.isArray(prod?.variants)) {
        setLocalVariants(prod.variants);
      } else {
        setLocalVariants([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch product details",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // FETCH WHEN PRODUCT ID CHANGES
  // =======================================================

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // =======================================================
  // STOCK CHANGE
  // =======================================================

  const handleStockChange = (index, newStock) => {
    const updatedVariants = [...localVariants];

    updatedVariants[index] = {
      ...updatedVariants[index],
      stock: Number(newStock),
    };

    setLocalVariants(updatedVariants);
  };

  // =======================================================
  // ADD NEW VARIANT
  // =======================================================

  const handleAddNewVariant = async () => {
    const hasValidAttribute = attributeInputs.some(
      (attr) =>
        attr.key.trim() &&
        attr.value.trim()
    );

    if (!hasValidAttribute) {
      alert(
        "At least one valid attribute is required."
      );
      return;
    }

    const cleanImages = newVariant.images.map(
      (img) => ({
        url: img.previewUrl,
        file: img.file,
      })
    );

    const cleanAttributes = {
      ...newVariant.attributes,
    };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined,
    };

    const previousVariants = [
      ...localVariants,
    ];

    // Optimistic UI update
    setLocalVariants([
      ...previousVariants,
      variantToSave,
    ]);

    setIsAddingVariant(false);

    try {
      await handleAddProductVariant(
        productId,
        variantToSave
      );

      // Refresh product so actual database
      // variant data is displayed
      await fetchProductDetails();
    } catch (error) {
      // Rollback optimistic update
      setLocalVariants(previousVariants);

      setIsAddingVariant(true);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add variant."
      );

      return;
    }

    // =====================================================
    // RESET FORM
    // =====================================================

    setAttributeInputs([
      {
        key: "",
        value: "",
      },
    ]);

    setNewVariant({
      images: [],
      stock: 0,
      attributes: {},
      price: {
        amount: "",
        currency: "INR",
      },
    });
  };

  // =======================================================
  // ADD ATTRIBUTE
  // =======================================================

  const handleAddAttribute = () => {
    setAttributeInputs((prev) => [
      ...prev,
      {
        key: "",
        value: "",
      },
    ]);
  };

  // =======================================================
  // ATTRIBUTE CHANGE
  // =======================================================

  const handleAttributeChange = (
    index,
    field,
    value
  ) => {
    const updatedInputs = [
      ...attributeInputs,
    ];

    updatedInputs[index] = {
      ...updatedInputs[index],
      [field]: value,
    };

    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};

    updatedInputs.forEach((attr) => {
      if (attr.key.trim() !== "") {
        newAttrsObj[attr.key.trim()] =
          attr.value;
      }
    });

    setNewVariant((prev) => ({
      ...prev,
      attributes: newAttrsObj,
    }));
  };

  // =======================================================
  // REMOVE ATTRIBUTE
  // =======================================================

  const handleRemoveAttribute = (index) => {
    const updatedInputs =
      attributeInputs.filter(
        (_, i) => i !== index
      );

    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};

    updatedInputs.forEach((attr) => {
      if (attr.key.trim() !== "") {
        newAttrsObj[attr.key.trim()] =
          attr.value;
      }
    });

    setNewVariant((prev) => ({
      ...prev,
      attributes: newAttrsObj,
    }));
  };

  // =======================================================
  // IMAGE UPLOAD
  // =======================================================

  const handleImageUpload = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const availableSlots =
      7 - newVariant.images.length;

    if (availableSlots <= 0) {
      alert(
        "You can only upload up to 7 images."
      );
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(
      0,
      availableSlots
    );

    if (files.length > availableSlots) {
      alert(
        `You can only upload up to 7 images. ${filesToAdd.length} added.`
      );
    }

    const newImageObjects =
      filesToAdd.map((file) => ({
        file,
        previewUrl:
          URL.createObjectURL(file),
      }));

    setNewVariant((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        ...newImageObjects,
      ],
    }));

    e.target.value = "";
  };

  // =======================================================
  // REMOVE IMAGE
  // =======================================================

  const handleRemoveImage = (index) => {
    const imageToRemove =
      newVariant.images[index];

    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(
        imageToRemove.previewUrl
      );
    }

    const updatedImages =
      newVariant.images.filter(
        (_, i) => i !== index
      );

    setNewVariant((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  // =======================================================
  // CLEAN PREVIEW URLS ON UNMOUNT
  // =======================================================

  useEffect(() => {
    return () => {
      newVariant.images.forEach((image) => {
        if (image?.previewUrl) {
          URL.revokeObjectURL(
            image.previewUrl
          );
        }
      });
    };
  }, []);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">
        <p className="animate-pulse text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
          Retrieving product...
        </p>
      </main>
    );
  }

  // =======================================================
  // PRODUCT NOT FOUND
  // =======================================================

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
          Product not found
        </p>
      </main>
    );
  }

  // =======================================================
  // PRODUCT IMAGES
  // =======================================================

  const images = (
    product.images || []
  )
    .map((image) => ({
      ...image,
      url: getImageUrl(image),
    }))
    .filter((image) => image.url);

  // Make sure selected index is valid
  const activeImage =
    images[selectedImage]?.url ||
    images[0]?.url ||
    "";

  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="min-h-screen bg-[#F8F6F2] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-20 border-b border-[#E1DBD4] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-7 lg:px-10">

          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-[#8A837C]">
              Seller dashboard
            </p>

            <h1 className="mt-1 font-serif text-[20px] leading-none tracking-[-0.02em]">
              Product details
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[17px] font-bold tracking-[0.12em]">
              SNITCH
            </span>

            <p className="mt-1 text-[7px] uppercase tracking-[0.16em] text-[#8A837C]">
              Manage listing
            </p>
          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-7 lg:px-10">

        {/* =================================================
            PRODUCT OVERVIEW
        ================================================= */}

        <section className="grid gap-8 border-b border-[#E1DBD4] py-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12 md:py-10">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div className="w-full max-w-[300px]">

            {/* MAIN IMAGE */}

            <div className="aspect-[4/5] max-h-[340px] overflow-hidden rounded-[4px] bg-[#EAE5E0]">

              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                  No image
                </div>
              )}

            </div>

            {/* =================================================
                THUMBNAILS
            ================================================= */}

            {images.length > 1 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">

                {images.map(
                  (img, index) => (
                    <button
                      key={`${img.url}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                      className={`h-14 w-12 shrink-0 overflow-hidden rounded-[3px] border bg-white transition ${
                        selectedImage ===
                        index
                          ? "border-[#211D1A]"
                          : "border-[#E1DBD4] hover:border-[#8A837C]"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* =================================================
              PRODUCT INFO
          ================================================= */}

          <div className="flex flex-col justify-center">

            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
              Product listing
            </p>

            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-[0.95] tracking-[-0.035em] sm:text-5xl">
              {product.title}
            </h2>

            <div className="mt-6 h-[2px] w-8 bg-[#211D1A]" />

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#625B55]">
              {product.description}
            </p>

            {/* PRICE */}

            <div className="mt-8 flex items-end justify-between border-t border-[#E1DBD4] pt-5">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
                  Base price
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {product.price?.amount}{" "}
                  <span className="text-sm font-normal text-[#625B55]">
                    {product.price?.currency}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8A837C]">
                  Variants
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {localVariants.length}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            VARIANTS SECTION
        ================================================= */}

        <section className="py-10">

          {/* SECTION HEADER */}

          <div className="flex flex-col justify-between gap-5 border-b border-[#E1DBD4] pb-6 sm:flex-row sm:items-end">

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8A837C]">
                Inventory management
              </p>

              <h3 className="mt-2 font-serif text-3xl leading-none tracking-[-0.025em]">
                Variants
              </h3>

              <p className="mt-3 text-[9px] uppercase tracking-[0.1em] text-[#8A837C]">
                Manage color, size, images and stock
              </p>
            </div>

            {!isAddingVariant && (
              <button
                type="button"
                onClick={() =>
                  setIsAddingVariant(true)
                }
                className="flex h-10 items-center justify-center gap-2 rounded-[4px] bg-[#211D1A] px-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#4A4039]"
              >
                <PlusIcon />
                Add new variant
              </button>
            )}

          </div>

          {/* =================================================
              ADD VARIANT FORM
          ================================================= */}

          {isAddingVariant && (
            <div className="mt-7 border border-[#E1DBD4] bg-white p-5 sm:p-7 lg:p-8">

              {/* FORM HEADER */}

              <div className="flex items-start justify-between border-b border-[#E1DBD4] pb-5">

                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#8A837C]">
                    New listing option
                  </p>

                  <h4 className="mt-2 font-serif text-2xl leading-none">
                    Create variant
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsAddingVariant(false)
                  }
                  className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8A837C] transition hover:text-[#211D1A]"
                >
                  Cancel
                </button>

              </div>

              <div className="grid gap-8 pt-7 lg:grid-cols-2">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="space-y-7">

                  {/* ATTRIBUTES */}

                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <label className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#625B55]">
                        Attributes
                      </label>

                      <span className="text-[8px] uppercase tracking-[0.1em] text-[#AAA39B]">
                        e.g. Color / Size
                      </span>

                    </div>

                    <div className="space-y-2">

                      {attributeInputs.map(
                        (attr, index) => (
                          <div
                            key={index}
                            className="flex gap-2"
                          >

                            <input
                              type="text"
                              placeholder="Key"
                              value={
                                attr.key
                              }
                              onChange={(e) =>
                                handleAttributeChange(
                                  index,
                                  "key",
                                  e.target.value
                                )
                              }
                              className="h-10 w-1/2 border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none placeholder:text-[#AAA39B] focus:border-[#211D1A]"
                            />

                            <input
                              type="text"
                              placeholder="Value"
                              value={
                                attr.value
                              }
                              onChange={(e) =>
                                handleAttributeChange(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="h-10 w-1/2 border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none placeholder:text-[#AAA39B] focus:border-[#211D1A]"
                            />

                            {attributeInputs.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveAttribute(
                                    index
                                  )
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#E1DBD4] text-[#8A837C] transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                              >
                                <TrashIcon />
                              </button>
                            )}

                          </div>
                        )
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAddAttribute
                      }
                      className="mt-3 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#211D1A] transition hover:text-[#625B55]"
                    >
                      <PlusIcon />
                      Add attribute
                    </button>

                  </div>

                  {/* STOCK + PRICE */}

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.14em] text-[#625B55]">
                        Initial stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          newVariant.stock
                        }
                        onChange={(e) =>
                          setNewVariant(
                            (prev) => ({
                              ...prev,
                              stock:
                                e.target.value,
                            })
                          )
                        }
                        className="h-10 w-full border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none focus:border-[#211D1A]"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.14em] text-[#625B55]">
                        Variant price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          newVariant.price
                            .amount
                        }
                        onChange={(e) =>
                          setNewVariant(
                            (prev) => ({
                              ...prev,
                              price: {
                                ...prev.price,
                                amount:
                                  e.target
                                    .value,
                              },
                            })
                          )
                        }
                        placeholder="Optional"
                        className="h-10 w-full border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none placeholder:text-[#AAA39B] focus:border-[#211D1A]"
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RIGHT - IMAGES
                ================================================= */}

                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <label className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#625B55]">
                      Variant images
                    </label>

                    <span className="text-[8px] uppercase tracking-[0.1em] text-[#AAA39B]">
                      {
                        newVariant.images
                          .length
                      }
                      /7
                    </span>

                  </div>

                  {/* IMAGE PREVIEWS */}

                  {newVariant.images
                    .length > 0 && (
                    <div className="grid grid-cols-4 gap-2">

                      {newVariant.images.map(
                        (
                          img,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="group relative aspect-square overflow-hidden rounded-[3px] border border-[#D8D1C8] bg-[#F8F6F2]"
                          >

                            <img
                              src={
                                img.previewUrl
                              }
                              alt="Preview"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(
                                  index
                                )
                              }
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#211D1A]/85 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <TrashIcon />
                            </button>

                            {index ===
                              0 && (
                              <span className="absolute bottom-1 left-1 bg-[#211D1A]/90 px-1.5 py-1 text-[6px] font-bold uppercase tracking-[0.1em] text-white">
                                Cover
                              </span>
                            )}

                          </div>
                        )
                      )}

                    </div>
                  )}

                  {/* UPLOAD */}

                  {newVariant.images
                    .length < 7 && (
                    <label className="mt-3 flex h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#D0C8BF] bg-[#F8F6F2] text-[#8A837C] transition hover:border-[#211D1A] hover:text-[#211D1A]">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 3v12" />
                        <path d="m7 8 5-5 5 5" />
                        <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
                      </svg>

                      <span className="text-[8px] font-bold uppercase tracking-[0.12em]">
                        Upload images
                      </span>

                      <span className="text-[7px] uppercase tracking-[0.1em] text-[#AAA39B]">
                        Up to 7 images
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          handleImageUpload
                        }
                        className="hidden"
                      />

                    </label>
                  )}

                </div>

              </div>

              {/* SAVE BUTTON */}

              <div className="mt-8 flex justify-end border-t border-[#E1DBD4] pt-6">

                <button
                  type="button"
                  onClick={
                    handleAddNewVariant
                  }
                  className="flex h-10 items-center justify-center bg-[#211D1A] px-7 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#4A4039]"
                >
                  Save variant
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              VARIANT LIST
          ================================================= */}

          <div className="mt-7">

            {localVariants.length === 0 ? (
              <div className="border border-dashed border-[#D8D1C8] py-16 text-center">

                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                  No variants created yet
                </p>

                <p className="mt-2 text-[8px] uppercase tracking-[0.1em] text-[#AAA39B]">
                  Add your first color or size variant
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                {localVariants.map(
                  (variant, idx) => {

                    const variantImage =
                      variant.images?.[0]
                        ?.url ||
                      variant.images?.[0]
                        ?.thumbnailUrl ||
                      variant.images?.[0]
                        ?.filePath;

                    const variantStock =
                      Number(
                        variant.stock || 0
                      );

                    const isInStock =
                      variantStock > 0;

                    return (
                      <article
                        key={
                          variant._id ||
                          idx
                        }
                        className="overflow-hidden rounded-[4px] border border-[#E1DBD4] bg-white"
                      >

                        {/* CARD TOP */}

                        <div className="p-4">

                          <div className="flex gap-4">

                            {/* THUMB */}

                            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[3px] bg-[#F1EEE9]">

                              {variantImage ? (
                                <img
                                  src={
                                    variantImage
                                  }
                                  alt="Variant"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[7px] font-semibold uppercase tracking-[0.1em] text-[#AAA39B]">
                                  No image
                                </div>
                              )}

                            </div>

                            {/* INFO */}

                            <div className="min-w-0 flex-1">

                              <div className="mb-3 flex items-center justify-between">

                                <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#8A837C]">
                                  Variant{" "}
                                  {idx +
                                    1}
                                </span>

                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isInStock
                                      ? "bg-[#211D1A]"
                                      : "bg-[#B54A42]"
                                  }`}
                                />

                              </div>

                              {/* ATTRIBUTES */}

                              <div className="flex flex-wrap gap-1.5">

                                {Object.entries(
                                  variant.attributes ||
                                    {}
                                ).map(
                                  ([
                                    key,
                                    val,
                                  ]) => (
                                    <div
                                      key={
                                        key
                                      }
                                      className="border border-[#E1DBD4] bg-[#F8F6F2] px-2 py-1.5"
                                    >
                                      <span className="mr-1 text-[7px] font-bold uppercase tracking-[0.08em] text-[#AAA39B]">
                                        {
                                          key
                                        }
                                      </span>

                                      <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#211D1A]">
                                        {
                                          val
                                        }
                                      </span>
                                    </div>
                                  )
                                )}

                              </div>

                              {/* PRICE */}

                              <p className="mt-3 text-[10px] font-semibold text-[#211D1A]">

                                {variant
                                  .price
                                  ?.amount ? (
                                  <>
                                    {
                                      variant
                                        .price
                                        .amount
                                    }{" "}
                                    <span className="text-[8px] font-normal text-[#8A837C]">
                                      {variant
                                        .price
                                        .currency ||
                                        product
                                          .price
                                          ?.currency ||
                                        "INR"}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A837C]">
                                    Base price
                                  </span>
                                )}

                              </p>

                            </div>

                          </div>

                        </div>

                        {/* STOCK */}

                        <div className="flex items-center justify-between border-t border-[#E1DBD4] bg-[#F8F6F2] px-4 py-3">

                          <div>

                            <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-[#8A837C]">
                              Current stock
                            </p>

                            <p
                              className={`mt-1 text-[7px] font-semibold uppercase tracking-[0.1em] ${
                                isInStock
                                  ? "text-[#625B55]"
                                  : "text-red-500"
                              }`}
                            >
                              {isInStock
                                ? "Available"
                                : "Out of stock"}
                            </p>

                          </div>

                          <input
                            type="number"
                            min="0"
                            value={
                              variant.stock ??
                              0
                            }
                            onChange={(e) =>
                              handleStockChange(
                                idx,
                                e.target
                                  .value
                              )
                            }
                            className="h-9 w-20 border border-[#D8D1C8] bg-white px-2 text-right font-serif text-base text-[#211D1A] outline-none focus:border-[#211D1A]"
                          />

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </section>

      </div>

    </main>
  );
};

export default SellerProductDetails;

