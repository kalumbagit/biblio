import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  CreditCard,
  Settings,
  Bell,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { hasRole } from "../../utils/auth";
import { UserRole } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.books"), href: "/books", icon: BookOpen },
  ];

  const userNavigation = user
    ? [
        { name: t("nav.dashboard"), href: "/dashboard", icon: Home },
        { name: t("nav.requests"), href: "/requests", icon: FileText },
        { name: t("nav.loans"), href: "/loans", icon: CreditCard },
        { name: t("nav.profile"), href: "/profile", icon: User },
      ]
    : [];

  const adminNavigation =
    user && hasRole(user, UserRole.ADMIN)
      ? [{ name: "Administration", href: "/admin/users", icon: Settings }]
      : [];

  const secretaryNavigation =
    user && hasRole(user, UserRole.SECRETARY)
      ? [{ name: "Gestion", href: "/secretary/requests", icon: FileText }]
      : [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-900">
                SteBiblio
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {[...navigation, ...userNavigation].map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive(item.href)
                    ? "border-blue-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {user ? (
              <>
                {/* Notifications - Desktop */}
                <button className="hidden md:flex p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      {user.last_name && user.first_name ? (
                        <span className="text-sm font-medium text-white">
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {user.username?.charAt(0)}
                          {user.username?.charAt(1)}
                          {user.username?.charAt(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      <Badge
                        variant={
                          user.role === UserRole.ADMIN
                            ? "danger"
                            : user.role === UserRole.SECRETARY
                            ? "warning"
                            : "default"
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Logout Button - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </Button>

                {/* Notifications - Mobile */}
                <button className="md:hidden p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <Bell className="w-5 h-5" />
                </button>

                {/* User Avatar - Mobile */}
                <div className="md:hidden flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    {user.last_name && user.first_name ? (
                      <span className="text-xs font-medium text-white">
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-white">
                        {user.username?.charAt(0)}
                        {user.username?.charAt(1)}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 md:space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t("nav.register")}</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {[
              ...navigation,
              ...userNavigation,
              ...secretaryNavigation,
              ...adminNavigation,
            ].map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            ))}
            
            {/* Bouton de déconnexion dans le menu mobile */}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              >
                <div className="flex items-center">
                  <LogOut className="w-4 h-4 mr-3" />
                  {t("nav.logout")}
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};