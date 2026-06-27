import api from "../api/axios";

const getAllCategories = async (page = 0, size = 10, sortBy = "id", direction = "asc") => {
  const response = await api.get("/categories/", {
    params: { page, size, sortBy, direction },
  });
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