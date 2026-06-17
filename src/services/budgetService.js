import api from "../api/axios";

const getAllBudgets = async () => {
  const response = await api.get("/budgets");
  return response.data;
};

const createBudget = async (data) => {
  const response = await api.post("/budgets", data);
  return response.data;
};

const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

const getBudgetStatus = async (budgetId) => {
  const response = await api.get(`/budgets/status/${budgetId}`);
  return response.data;
};

export default { getAllBudgets, createBudget, deleteBudget, getBudgetStatus };