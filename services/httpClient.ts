import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("amigo_secreto_token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      error.response?.status === 401 &&
      error.request.responseURL.split("/").pop() !== "login" &&
      error.request.responseURL.split("/").pop() !== "event"
    ) {
      // Limpar token e redirecionar para login
      if (typeof window !== "undefined") {
        api.defaults.headers.common["Authorization"] = null;
        localStorage.removeItem("amigo_secreto_token");
        localStorage.removeItem("amigo_secreto_auth");
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
