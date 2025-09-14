// import axios from "axios";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // send cookies with the request
// });

// export default axiosInstance 


import axios from "axios";

// Read from .env: works in both dev and production
const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

export default axiosInstance;
 