import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiImage,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SellerHero = () => {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --------------------------------
  // GET ACTIVE HERO
  // --------------------------------
  const fetchHero = async () => {
    try {
      setIsLoadingHero(true);
      setError("");

      const response = await fetch("http://localhost:3000/api/hero", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load hero banner"
        );
      }

      const heroImages = data?.hero?.images || [];

      setImages(
        heroImages.map((image) => ({
          url: image.url,
          preview: image.url,
          file: null,
          existing: true,
        }))
      );
    } catch (err) {
      console.error("Fetch hero error:", err);
      setError(err.message || "Failed to load hero banner");
    } finally {
      setIsLoadingHero(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  // --------------------------------
  // IMAGE SELECT
  // --------------------------------
  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    setMessage("");
    setError("");

    const remainingSlots = MAX_IMAGES - images.length;

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can upload maximum ${MAX_IMAGES} hero images.`
      );
      return;
    }

    const validImages = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is larger than 5MB.`);
        continue;
      }

      validImages.push({
        url: null,
        preview: URL.createObjectURL(file),
        file,
        existing: false,
      });
    }

    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages]);
    }

    event.target.value = "";
  };

  // --------------------------------
  // REMOVE IMAGE
  // --------------------------------
  const handleRemoveImage = (index) => {
    setMessage("");
    setError("");

    setImages((prev) => {
      const image = prev[index];

      if (image?.preview && !image.existing) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  // --------------------------------
  // UPLOAD HERO
  // --------------------------------
  const handleUpload = async () => {
    setMessage("");
    setError("");

    const newImages = images.filter(
      (image) => image.file
    );

    if (newImages.length === 0) {
      setError("Please select at least one new image.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();

      newImages.forEach((image) => {
        formData.append("images", image.file);
      });

      const response = await fetch(
        "http://localhost:3000/api/hero/",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to upload hero banner"
        );
      }

      setMessage("Hero banner updated successfully.");

      await fetchHero();
    } catch (err) {
      console.error("Upload hero error:", err);

      setError(
        err.message || "Failed to upload hero banner"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // --------------------------------
  // CLEANUP PREVIEW URLS
  // --------------------------------
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview && !image.existing) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#E3E1DE] px-[1.5vw] py-[2vh] font-['Plus_Jakarta_Sans',sans-serif] text-[#211D1A] sm:px-[2vw] lg:px-[3vw]">
      <div className="mx-auto max-w-[87.5vw]">

        {/* HEADER */}
        <header className="mb-[2vh] rounded-[1.5rem] border border-[#CEC8C1] bg-[#F8F6F2] px-[2vw] py-[2vh] shadow-[0_0.75rem_2.5rem_rgba(33,29,26,0.05)] sm:px-[2.5vw]">
          <div className="flex flex-col gap-[2vh] md:flex-row md:items-end md:justify-between">

            <div>

              <Link
                to="/seller/dashboard"
                className="mb-[2.5vh] inline-flex items-center gap-[0.5vw] text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-[#77716B] transition hover:text-[#211D1A]"
              >
                <FiArrowLeft className="h-[0.875rem] w-[0.875rem]" />
                Back to dashboard
              </Link>

              <div className="mb-[1.5vh] flex items-center gap-[0.5vw]">
                <span className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#211D1A]" />

                <p className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-[#77716B]">
                  Storefront
                </p>
              </div>

              <h1 className="font-serif text-[clamp(2.25rem,3vw,3.125rem)] leading-none tracking-[-0.055em]">
                Hero Banner
              </h1>

              <p className="mt-[1vh] max-w-[32rem] text-[0.875rem] leading-[1.5rem] text-[#716B65]">
                Manage the images displayed in the main hero
                section of your storefront.
              </p>

            </div>

            <div className="flex items-center gap-[0.5vw]">
              <span className="inline-flex h-[2.5rem] items-center gap-[0.5vw] rounded-[0.75rem] border border-[#CEC8C1] bg-[#F1EEE9] px-[1vw] text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[#625B55]">
                <FiImage className="h-[0.875rem] w-[0.875rem]" />
                {images.length}/{MAX_IMAGES} Images
              </span>
            </div>

          </div>
        </header>

        {/* INFO */}
        <section className="mb-[2vh] grid grid-cols-1 gap-[0.75vw] sm:grid-cols-3">

          {/* MAXIMUM */}
          <div className="rounded-[1.125rem] border border-[#CEC8C1] bg-[#F8F6F2] p-[1.25rem]">

            <p className="mb-[1.5vh] text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#77716B]">
              Maximum
            </p>

            <p className="font-serif text-[1.875rem] tracking-[-0.04em]">
              05
            </p>

            <p className="mt-[0.25rem] text-[0.625rem] text-[#8A837C]">
              Hero images
            </p>

          </div>

          {/* FILE LIMIT */}
          <div className="rounded-[1.125rem] border border-[#CEC8C1] bg-[#F8F6F2] p-[1.25rem]">

            <p className="mb-[1.5vh] text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#77716B]">
              File limit
            </p>

            <p className="font-serif text-[1.875rem] tracking-[-0.04em]">
              5MB
            </p>

            <p className="mt-[0.25rem] text-[0.625rem] text-[#8A837C]">
              Per image
            </p>

          </div>

          {/* STATUS */}
          <div className="rounded-[1.125rem] border border-[#CEC8C1] bg-[#211D1A] p-[1.25rem] text-white">

            <p className="mb-[1.5vh] text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-white/50">
              Status
            </p>

            <div className="flex items-center gap-[0.5vw]">
              <span className="h-[0.5rem] w-[0.5rem] rounded-full bg-[#B8D8C0]" />

              <p className="font-serif text-[1.5rem] tracking-[-0.04em]">
                Ready
              </p>
            </div>

            <p className="mt-[0.25rem] text-[0.625rem] text-white/40">
              Storefront banner system
            </p>

          </div>

        </section>

        {/* MAIN CARD */}
        <section className="rounded-[1.5rem] border border-[#CEC8C1] bg-[#F8F6F2] p-[1.25rem] shadow-[0_0.5rem_1.875rem_rgba(33,29,26,0.035)] sm:p-[1.75rem]">

          {/* CARD HEADER */}
          <div className="mb-[2.5vh] flex flex-col gap-[2vh] border-b border-[#E2DDD6] pb-[2.5vh] sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="mb-[1vh] text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-[#8A837C]">
                Storefront presentation
              </p>

              <h2 className="font-serif text-[1.5rem] tracking-[-0.04em]">
                Manage your hero images
              </h2>

              <p className="mt-[1vh] max-w-[38rem] text-[0.75rem] leading-[1.25rem] text-[#77716B]">
                Upload up to five images. These images will be
                displayed as slides in the main hero section.
              </p>

            </div>

            <div className="flex items-center gap-[0.5vw] text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[#77716B]">
              <FiCheck className="h-[0.875rem] w-[0.875rem]" />
              Live storefront
            </div>

          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mb-[1.25rem] flex items-center gap-[0.75vw] rounded-[0.75rem] border border-[#C9D9CC] bg-[#EEF5EF] px-[1rem] py-[0.75rem] text-[0.625rem] font-semibold text-[#4D6654]">

              <FiCheck className="h-[1rem] w-[1rem] shrink-0" />

              {message}

            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-[1.25rem] flex items-center justify-between gap-[0.75vw] rounded-[0.75rem] border border-[#D8C2BA] bg-[#F7ECE8] px-[1rem] py-[0.75rem] text-[0.625rem] font-semibold text-[#8A5141]">

              <div className="flex items-center gap-[0.75vw]">
                <FiX className="h-[1rem] w-[1rem] shrink-0" />
                {error}
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-[#8A5141] transition hover:text-[#5D342A]"
              >
                <FiX className="h-[1rem] w-[1rem]" />
              </button>

            </div>
          )}

          {/* LOADING */}
          {isLoadingHero ? (
            <div className="grid grid-cols-1 gap-[1rem] sm:grid-cols-2 lg:grid-cols-3">

              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[16/9] animate-pulse rounded-[1.125rem] bg-[#EAE6E0]"
                />
              ))}

            </div>
          ) : (

            <div className="grid grid-cols-1 gap-[1rem] sm:grid-cols-2 lg:grid-cols-3">

              {/* EXISTING IMAGES */}
              {images.map((image, index) => (
                <div
                  key={`${image.preview}-${index}`}
                  className="group relative overflow-hidden rounded-[1.125rem] border border-[#CEC8C1] bg-[#E9E5DF]"
                >

                  <div className="aspect-[16/9]">
                    <img
                      src={image.preview}
                      alt={`Hero slide ${index + 1}`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* TOP LABEL */}
                  <div className="absolute left-[0.75rem] top-[0.75rem]">

                    <span className="inline-flex items-center gap-[0.375rem] rounded-full border border-white/40 bg-[#F8F6F2]/90 px-[0.625rem] py-[0.375rem] text-[0.5rem] font-bold uppercase tracking-[0.12em] backdrop-blur-md">

                      <span className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#617A68]" />

                      Slide {String(index + 1).padStart(2, "0")}

                    </span>

                  </div>

                  {/* REMOVE */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-[0.75rem] top-[0.75rem] flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.5rem] bg-black/55 text-white backdrop-blur-md transition hover:bg-[#211D1A]"
                    aria-label={`Remove slide ${index + 1}`}
                  >
                    <FiTrash2 className="h-[0.875rem] w-[0.875rem]" />
                  </button>

                  {/* BOTTOM */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/45 px-[1rem] py-[0.75rem] text-white backdrop-blur-md">

                    <span className="text-[0.5rem] font-bold uppercase tracking-[0.14em]">
                      {image.existing
                        ? "Published"
                        : "New image"}
                    </span>

                    <FiArrowUpRight className="h-[0.875rem] w-[0.875rem]" />

                  </div>

                </div>
              ))}

              {/* ADD IMAGE */}
              {images.length < MAX_IMAGES && (
                <label
                  htmlFor="hero-images"
                  className="group flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-[1.125rem] border border-dashed border-[#B8B1AA] bg-[#F5F2ED] transition-all duration-300 hover:border-[#211D1A] hover:bg-[#EBE7E1]"
                >

                  <div className="mb-[2vh] flex h-[3rem] w-[3rem] items-center justify-center rounded-full border border-[#D4CEC7] bg-[#EBE7E1] transition duration-300 group-hover:scale-105">

                    <FiUpload className="h-[1.25rem] w-[1.25rem] text-[#5D5751]" />

                  </div>

                  <p className="text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#5D5751]">
                    Add image
                  </p>

                  <p className="mt-[0.25rem] text-[0.5625rem] text-[#8A837C]">
                    JPG, PNG · Max 5MB
                  </p>

                  <input
                    id="hero-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />

                </label>
              )}

            </div>
          )}

          {/* EMPTY */}
          {!isLoadingHero && images.length === 0 && (
            <div className="mt-[1rem] flex min-h-[37.5vh] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-[#B8B1AA] bg-[#F5F2ED] px-[1.5rem] text-center">

              <div className="mb-[2.5vh] flex h-[4rem] w-[4rem] items-center justify-center rounded-full border border-[#D4CEC7] bg-[#EBE7E1]">

                <FiImage className="h-[1.5rem] w-[1.5rem] text-[#5D5751]" />

              </div>

              <p className="mb-[0.5rem] text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-[#817A73]">
                No hero images
              </p>

              <h3 className="font-serif text-[1.5rem] tracking-[-0.04em]">
                Add your first storefront image.
              </h3>

              <p className="mt-[1vh] max-w-[25rem] text-[0.75rem] leading-[1.25rem] text-[#77716B]">
                Choose a high-quality image that represents your
                collection.
              </p>

            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-[3vh] flex flex-col gap-[2vh] border-t border-[#E2DDD6] pt-[2.5vh] sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-[#77716B]">
                Recommended
              </p>

              <p className="mt-[0.25rem] text-[0.625rem] text-[#8A837C]">
                Use wide editorial images for the best result.
              </p>

            </div>

            <div className="flex items-center gap-[0.5vw]">

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="inline-flex h-[2.75rem] items-center justify-center gap-[0.5vw] rounded-[0.75rem] border border-[#CEC8C1] bg-[#F1EEE9] px-[1.25vw] text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[#211D1A] transition hover:bg-[#EAE6E0]"
              >
                Cancel
              </button>

              {/* UPDATE HERO */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  images.filter((image) => image.file).length === 0
                }
                className="inline-flex h-[2.75rem] items-center justify-center gap-[0.5vw] rounded-[0.75rem] bg-[#171615] px-[1.25vw] text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#2A2826] hover:shadow-[0_0.5rem_1.25rem_rgba(23,22,21,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
              >

                <FiUpload className="h-[1rem] w-[1rem]" />

                {isUploading
                  ? "Uploading..."
                  : "Update Hero"}

              </button>

            </div>

          </div>

        </section>

        {/* BOTTOM NOTE */}
        <div className="mt-[2vh] flex items-center gap-[0.5vw] px-[0.25vw] text-[0.5625rem] text-[#817A73]">

          <FiCheck className="h-[0.875rem] w-[0.875rem]" />

          Changes will appear on your storefront after publishing.

        </div>

      </div>
    </main>
  );
};

export default SellerHero;