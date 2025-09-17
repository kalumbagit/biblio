import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';
import { getStoredToken, removeStoredToken } from '../utils/auth';
import toast from 'react-hot-toast';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          removeStoredToken();
          window.location.href = '/login';
          toast.error('Session expirée. Veuillez vous reconnecter.');
          break;
        case 403:
          toast.error('Accès interdit');
          break;
        case 404:
          toast.error('Ressource non trouvée');
          break;
        case 500:
          toast.error('Erreur du serveur');
          break;
        default:
          toast.error(data?.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      toast.error('Erreur de réseau. Vérifiez votre connexion.');
    } else {
      toast.error('Une erreur inattendue est survenue');
    }
    
    return Promise.reject(error);
  }
);

// Generic API functions
export const get = async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient.get(url, { params });
  return response.data;
};

export const post = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient.post(url, data);
  return response.data;
};

export const put = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  const response = await apiClient.put(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await apiClient.delete(url);
  return response.data;
};

export default apiClient;