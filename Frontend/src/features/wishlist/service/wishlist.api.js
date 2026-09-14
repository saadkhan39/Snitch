import axios from "axios";

const api = axios.create({
  baseURL: "/api/wishlists",
  withCredentials: true,
});


export const addToWishlist = async (productId) => {
  const response = await api.post(
    `/add/${productId}`
  );

  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(
    `/remove/${productId}`
  );

  return response.data;
};

export const getWishlist = async () => {
  const response = await api.get("/");

  return response.data;
};

export const checkWishlist = async (productId) => {
  const response = await api.get(
    `/check/${productId}`
  );

  return response.data;
};

