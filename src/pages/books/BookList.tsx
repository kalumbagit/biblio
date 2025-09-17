import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { useBooks } from "../../hooks/useBooks";
import { BookFilters } from "../../types";
import { BOOK_CATEGORIES } from "../../utils/constants";
import { BookCard } from "../../components/books/BookCard";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";

export const BookList: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filters: BookFilters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availability: (searchParams.get("availability") as any) || "all",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortBy: (searchParams.get("sortBy") as any) || "title",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortOrder: (searchParams.get("sortOrder") as any) || "asc",
  };

  const { data, isLoading, error } = useBooks(filters, page, 20);

  const updateFilters = (newFilters: Partial<BookFilters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <div className="h-64 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">
            Une erreur est survenue lors du chargement des livres.
          </p>
        </div>
      </div>
    );
  }

  const books = data?.data.results || [];
  const totalPages = data?.data.total_pages || 1;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t("books.searchPlaceholder")}
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        updateFilters({ category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les catégories</option>
                      {BOOK_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disponibilité
                    </label>
                    <select
                      value={filters.availability}
                      onChange={(e) =>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        updateFilters({ availability: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Tous</option>
                      <option value="available">Disponibles</option>
                      <option value="unavailable">Non disponibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trier par
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        updateFilters({ sortBy: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="title">Titre</option>
                      <option value="author">Auteur</option>
                      <option value="publishYear">Année</option>
                      <option value="createdAt">Date d'ajout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordre
                    </label>
                    <button
                      onClick={() =>
                        updateFilters({
                          sortOrder:
                            filters.sortOrder === "asc" ? "desc" : "asc",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center"
                    >
                      {filters.sortOrder === "asc" ? (
                        <>
                          <SortAsc className="w-4 h-4 mr-2" />
                          Croissant
                        </>
                      ) : (
                        <>
                          <SortDesc className="w-4 h-4 mr-2" />
                          Décroissant
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="ghost" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("books.noBooksFound")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Précédent
              </Button>

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
