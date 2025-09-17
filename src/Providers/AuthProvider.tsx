import React, { useEffect, useState, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginForm, RegisterForm, User, AuthContextType } from "../types";
import {
  getStoredUser,
  getStoredToken,
  setStoredUser,
  setStoredToken,
  removeStoredToken,
  setStoredRefreshToken,
} from "../utils/auth";
import { authApi } from "../api/auth";
import { AuthContext } from "../contexts/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // 🔁 Initialisation : Récupérer l'utilisateur si token présent
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
          setStoredUser(response.data);
        } catch (error) {
          setUser(null);
          console.error(
            "Erreur lors de la récupération de l'utilisateur :",
            error
          );
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Login (mutation)
  const loginMutation = useMutation({
    mutationFn: async (formData: LoginForm) => {
      const response = await authApi.login(formData);
      const { access_token, refresh_token, user } = response.data;

      // 🔐 Persistance
      setStoredToken(access_token);
      setStoredRefreshToken(refresh_token);
      setStoredUser(user);
      setUser(user);
      return user;
    },
  });

  const login = async (formData: LoginForm) => {
    await loginMutation.mutateAsync(formData);
  };

  // ✅ Register
  const register = async (data: RegisterForm) => {
    await authApi.register(data);
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await authApi.logout();
      removeStoredToken()

    } catch (e) {
      // Silencieux, dans tous les cas on nettoie
      console.error("Erreur lors de la déconnexion :", e);
    }

    removeStoredToken();
    setUser(null);
    queryClient.removeQueries({ queryKey: ["auth"] });
  };

  // ✅ Mettre à jour l'utilisateur (en mémoire + stockage)
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
    queryClient.setQueryData(["auth", "user"], updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
