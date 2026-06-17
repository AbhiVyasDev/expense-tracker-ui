import api from "../api/axios";

const getAllCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

const createCategory = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

export default {
  getAllCategories,
  createCategory,
};