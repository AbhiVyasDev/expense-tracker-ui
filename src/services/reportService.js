import api from "../api/axios";

// Calls GET /api/reports/export/excel and returns the raw binary (blob) data.
// responseType: "blob" is critical here — without it, axios will try to parse
// the binary xlsx bytes as JSON/text and the downloaded file will be corrupted.
export const exportExcelReport = async () => {
  const response = await api.get("/reports/export/excel", {
    responseType: "blob",
  });
  return response.data;
};

// Triggers an actual browser file download for the given blob.
// Creates a temporary <a> tag, "clicks" it, then cleans up.
export const downloadExcelReport = async (filename = "expenses.xlsx") => {
  const blobData = await exportExcelReport();
  const blob = new Blob([blobData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};