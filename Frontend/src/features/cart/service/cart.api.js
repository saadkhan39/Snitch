import axios from "axios";

const api = axios.create({
  baseURL: "/api/cart",
  withCredentials: true,
});

export const addItem = async ({
  productId,
  variantId,
  selectedAttributes,
}) => {
  const response = await api.post(
    `/add/${productId}/${variantId}`,
    {
      quantity: 1,
      selectedAttributes,
    }
  );

  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/");
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await api.delete(
    `/item/${itemId}`
  );

  return response.data;
};

export const incrementCartItem = async ({ productId, variantId }) => {
    const response = await api.patch(`/quantity/increment/${productId}/${variantId}`)
    return response.data
}

export const decrementCartItem = async ({ productId, variantId }) => {
  const response = await api.patch(
    `/quantity/decrement/${productId}/${variantId}`
  );

  return response.data;
};


