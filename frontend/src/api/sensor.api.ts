import axios, { type AxiosRequestConfig } from "axios";
import { CLOUD_RUN_URL } from "../utils/env";

export const callApi = async <T = any>(
  path: string,
  config: AxiosRequestConfig = {},
  setApiStatusCallback: any
): Promise<T> => {
  let lastError: unknown;

  try {
    const response = await axios({
      baseURL: CLOUD_RUN_URL,
      url: path,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
      ...config,
    });

    setApiStatusCallback("connected");
    return response.data as T;
  } catch (err) {
    lastError = err;
    console.warn(`[DEBUG] Error con ${CLOUD_RUN_URL}${path}:`, err);
  }

  setApiStatusCallback("error");
  throw lastError;
};
