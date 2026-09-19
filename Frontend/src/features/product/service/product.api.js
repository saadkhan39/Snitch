import axios from "axios";

const api = axios.create({
  baseURL: "/api/products",
  withCredentials: true,
});

export async function createProduct(formData) {
  const response = await api.post("/", formData);
  return response.data;
}

export async function getSellerProducts() {
  const response = await api.get("/seller");
  return response.data?.products ?? response.data;
}

export async function getAllProducts(search = "") {
  const response = await api.get("/", {
    params: search.trim()
      ? { search: search.trim() }
      : {},
  });

  return response.data?.products ?? response.data;
}

export async function getProductById(productId) {
  const response = await api.get(`/detail/${productId}`);
  return response.data;
}

export async function addProductVariant(
  productId,
  newProductVariant
) {
  console.log("New variant:", newProductVariant);

  const formData = new FormData();

  if (Array.isArray(newProductVariant.images)) {
    newProductVariant.images.forEach((image) => {
      if (image?.file) {
        formData.append("images", image.file);
      }
    });
  }

  formData.append(
    "stock",
    newProductVariant.stock ?? 0
  );

  formData.append(
    "priceAmount",
    newProductVariant.price?.amount ??
      newProductVariant.price ??
      ""
  );

  formData.append(
    "attributes",
    JSON.stringify(
      newProductVariant.attributes ?? {}
    )
  );

  const response = await api.post(
    `/${productId}/variants`,
    formData
  );

  return response.data;
}

export const updateProductVariant = async (productId, variantId, data) => {
    try {
        const response = await api.put(
            `/${productId}/variants/${variantId}`,
            data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Update variant API error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export const deleteProductVariant = async (productId, variantId) => {
  try {
    const response = await api.delete(
      `/${productId}/variants/${variantId}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to delete product variant:", error);
    throw error;
  }
};