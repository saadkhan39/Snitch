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

export async function getAllProducts() {
  const response = await api.get("/");
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