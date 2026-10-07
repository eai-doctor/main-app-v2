import axios from "axios";
import config from "@/config";
import { getMedplumToken } from "./medplumAuth";

let accessToken = null;
const USE_MEDPLUM = config.authProvider === "medplum";

export const setStoredToken = (token) => {
  accessToken = token;
};

export const getStoredToken = () => {
  return accessToken;
}

export const clearStoredToken = () => {
  accessToken = null;
}

const createApi = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, 
  });

  instance.interceptors.request.use(
    async (config) => {
      // Medplum login: always send the SDK's current token (it refreshes itself before expiry).
      if (USE_MEDPLUM) {
        accessToken = (await getMedplumToken()) ?? accessToken;
      }
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApi;