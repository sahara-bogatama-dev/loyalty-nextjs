import axios from "axios";
import Router from "next/navigation";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/", // Replace with your API base URL
  timeout: 60000, // Set a timeout if needed
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page if 401 Unauthorized
      Router.redirect("/");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
