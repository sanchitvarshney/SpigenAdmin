import axios from "axios";
import { getToken } from "@/utills/tokenUtills";
import { v4 as uuidv4 } from "uuid";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { showToast } from "@/utills/toasterContext";

const getFingerprint = async () => {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error("Failed to get fingerprint", error);
    return null;
  }
};

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = getToken();

  const id = localStorage.getItem("menuKey");
  if (token) {
    const uniqueid = uuidv4();
    const fingerprint = await getFingerprint();

    config.headers.Authorization = `${token}`;
    config.headers["authorization"] = `${token}`;
    config.headers["session"] = "2024-2025";
    config.headers["x-click-token"] = uniqueid;
    config.headers["fingerprint"] = fingerprint || "unknown";
    config.headers["menukey"] = id||"";
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if (error.response?.status === 401) {
    //   removeToken();
    //   window.location.href = "/login";
    // }
    showToast(error.response?.data?.message ? error.response?.data?.message : error.response?.data?.message?.msg, "error");
    return Promise.reject(error);
  }
);

export default axiosInstance;
