import { User, UserRole } from "../types";
import { STORAGE_KEYS } from "./constants";

export const getStoredToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

export const getStoredUser = (): User | null => {
  try {
    const userJson = localStorage.getItem("user_data");

    if (!userJson || userJson === "undefined") return null;

    return JSON.parse(userJson);
  } catch (e) {
    console.error("Erreur lors du parsing du user depuis le localStorage :", e);
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;

  // Admin has access to everything
  if (user.role === UserRole.ADMIN) return true;

  // Secretary has access to reader functions
  if (user.role === UserRole.SECRETARY) return true;

  return user.role === role;
};

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  return roles.some((role) => hasRole(user, role));
};

export const canAccessRoute = (
  user: User | null,
  requiredRoles: UserRole[]
): boolean => {
  if (!user || !isAuthenticated()) return false;
  return hasAnyRole(user, requiredRoles);
};
