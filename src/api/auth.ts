import { LoginForm, RegisterForm, User, ApiResponse } from "../types";
import axios from "axios";
import { AUTH, USER } from "../utils/apiUrls";
import axiosAuth from "./authenticatedAxios";

export const authApi = {
  login: async (
    data: LoginForm
  ): Promise<
    ApiResponse<{ user: User; access_token: string; refresh_token: string }>
  > => {
    try {
      const response = await axios.post(AUTH.LOGIN, data);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (
    data: RegisterForm
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.post(USER.REGISTER_OR_LIST, data);
    return response;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosAuth.get(USER.PROFILE);
    return response;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) throw new Error("Aucun refresh token trouvé");
    // Optionally inform the server about logout to invalidate the refresh token
    const response = await axios.post(AUTH.LOGOUT, null, {
      headers: {
        "X-Refresh-Token": `Bearer ${refresh_token}`,
      },
    });
    return response;
  },

  refreshToken: async (): Promise<
    ApiResponse<{ access: string; refresh: string }>
  > => {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) throw new Error("Aucun refresh token trouvé");

    const response = await axios.post(AUTH.REFRESH, null, {
      headers: {
        "X-Refresh-Token": `Bearer ${refresh_token}`,
      },
    });
    return response;
  },
};
