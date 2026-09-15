import axios from "axios"

const api = axios.create({
    baseURL:"/api/hero",
    withCredentials:true
})


export const getActiveHero = async () => {
  const response = await api.get("/");
  return response.data;
};

export const createHero = async (images) => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/", formData);

  return response.data;
};