import api from "../api/axios";

export const getExpenses = async (
  page = 0,
  size = 10,
  sortBy = "expenseDate",
  direction = "desc"
) => {
  const response = await api.get(
    `/expenses?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
  );
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses", data);
  return response.data;
};

export const filterExpenses = async ({ categoryId, startDate, endDate, paymentMethod } = {}) => {
  const params = new URLSearchParams();
  if (categoryId)    params.append("categoryId",    categoryId);
  if (startDate)     params.append("startDate",     startDate);
  if (endDate)       params.append("endDate",       endDate);
  if (paymentMethod) params.append("paymentMethod", paymentMethod);
  const response = await api.get(`/expenses/filter?${params.toString()}`);
  return response.data;
};