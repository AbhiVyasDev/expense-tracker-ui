import api from "../api/axios";

export const getDashboardSummary = async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
};

export const getCategoryWiseReport = async () => {
    const response = await api.get("/dashboard/category-wise");
    return response.data;
};

export const getMonthlyReport = async () => {
    const response = await api.get("/dashboard/monthly");
    return response.data;
};

export const getBudgetOverview = async () => {
    const response = await api.get("/dashboard/budget-overview");
    return response.data;
};

export const getMonthComparison = async () => {
    const response = await api.get("/dashboard/month-comparison");
    return response.data;
};