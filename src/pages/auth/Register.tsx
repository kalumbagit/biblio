import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterForm } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import toast from "react-hot-toast";

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success(t("auth.registerSuccess"));
      // Redirection vers le login avec username et password en state
      navigate("/login", {
        state: {
          username: data.username,
          password: data.password,
        },
      });
    } catch (error) {
      toast.error(t("auth.registerError"));
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BookOpen className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("auth.register")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            {t("auth.login")}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t("auth.firstName")}
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register("firstName", {
                      required: t("forms.required"),
                    })}
                  />
                </div>
                <div>
                  <Input
                    label={t("auth.lastName")}
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register("lastName", {
                      required: t("forms.required"),
                    })}
                  />
                </div>
              </div>

              <div>
                <Input
                  label={t("auth.username")}
                  type="text"
                  autoComplete="username"
                  error={errors.username?.message}
                  {...register("username", {
                    required: t("forms.required"),
                  })}
                />
              </div>

              <div>
                <Input
                  label={t("auth.email")}
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email", {
                    required: t("forms.required"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("forms.invalidEmail"),
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  label={t("auth.password")}
                  type="password"
                  autoComplete="new-password"
                  helper="le mot de passe doit contenir au moins 6 caractères"
                  error={errors.password?.message}
                  {...register("password", {
                    required: t("forms.required"),
                    minLength: {
                      value: 6,
                      message: t("forms.passwordTooShort"),
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  label={t("auth.confirmPassword")}
                  type="password"
                  autoComplete="new-password"
                  error={errors.password_confirm?.message}
                  {...register("password_confirm", {
                    required: t("forms.required"),
                    validate: (value) =>
                      value === password || t("forms.passwordsDoNotMatch"),
                  })}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t("auth.register")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
