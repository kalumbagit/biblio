// BookDetail.tsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBook } from "../../hooks/useBooks";
import { Book, Calendar, User, Tag, Edit, Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { UserRole } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

export const BookDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, isError, error } = useBook(id!);

  const [isLoanModalOpen, setLoanModalOpen] = useState(false);
  const [isEditBookModalOpen, setEditBookModalOpen] = useState(false);
  const [isEditStockModalOpen, setEditStockModalOpen] = useState(false);
  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStock, setSelectedStock] = useState<any>(null);

  // Fonction pour gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Créer une URL pour la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 h-96 bg-gray-200 rounded-lg"></div>
          <div className="md:w-2/3 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4 mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center py-20 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Erreur lors du chargement du livre
          </h2>
          <p className="text-red-600">{error?.message}</p>
          <Link to="/books" className="mt-6 inline-block">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.data.available_copies > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditStock = (stock: any) => {
    setSelectedStock(stock);
    setEditStockModalOpen(true);
  };

  const handleAddStock = () => {
    setSelectedStock(null);
    setAddStockModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Carte principale du livre */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Couverture à gauche */}
          <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
            {book.data.image_couverture ? (
              <img
                src={book.data.image_couverture}
                alt={book.data.title}
                className="w-full h-auto object-cover max-h-96 rounded-lg shadow-lg transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-blue-400">
                <Book className="w-32 h-32 mb-4" />
                <span className="text-lg font-medium">Aucune image</span>
              </div>
            )}
          </div>

          {/* Infos à droite */}
          <CardContent className="md:w-2/3 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 transition-all duration-300 hover:text-blue-700">
                {book.data.title}
              </h2>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <p className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  {book.data.authors.map((a) => a.full_name).join(", ")}
                </p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  {book.data.publication_year || "Année inconnue"}
                </p>
                <p className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  {book.data.category.name}
                </p>
              </div>

              {/* État + disponibilité */}
              <div className="flex items-center space-x-3">
                <Badge
                  variant={isAvailable ? "success" : "danger"}
                  className="text-sm py-1 px-3"
                >
                  {isAvailable ? "Disponible" : "Indisponible"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {book.data.available_copies} exemplaire
                  {book.data.available_copies > 1 ? "s" : ""} disponible
                  {book.data.available_copies > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Détails des stocks */}
            {book.data.stocks?.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Stocks disponibles
                  </h3>
                  {(user?.role === UserRole.ADMIN ||
                    user?.role === UserRole.SECRETARY) && (
                    <Button
                      onClick={handleAddStock}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un stock
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.data.stocks.map((stock) => (
                    <Card
                      key={stock.id}
                      className="border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md overflow-hidden"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Langue:</span>
                              <Badge variant="outline" className="text-xs">
                                {stock.language.toUpperCase()}
                              </Badge>
                            </div>
                            <p>
                              <span className="font-medium">Quantité:</span>{" "}
                              <span
                                className={
                                  stock.available_quantity > 0
                                    ? "text-green-600 font-medium"
                                    : "text-red-600"
                                }
                              >
                                {stock.available_quantity} /{" "}
                                {stock.total_quantity}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Condition:</span>{" "}
                              {stock.condition_note || "N/A"}
                            </p>
                          </div>

                          {(user?.role === UserRole.ADMIN ||
                            user?.role === UserRole.SECRETARY) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStock(stock)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Actions selon rôle */}
            <div className="mt-8 flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Link to="/books">
                <Button variant="outline" className="flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la liste
                </Button>
              </Link>

              {user?.role === UserRole.READER ? (
                <Button
                  onClick={() => setLoanModalOpen(true)}
                  disabled={!isAvailable}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Demander un prêt
                </Button>
              ) : (
                (user?.role === UserRole.ADMIN ||
                  user?.role === UserRole.SECRETARY) && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setEditBookModalOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier le livre
                    </Button>

                    {(!book.data.stocks || book.data.stocks.length === 0) && (
                      <Button
                        onClick={handleAddStock}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un stock
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Modal de demande de prêt */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        title="Demande de prêt"
        animation="slideIn"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // envoyer la demande ici
            setLoanModalOpen(false);
            alert("Demande de prêt envoyée !");
          }}
          className="space-y-4"
        >
          <Input
            label="Nom complet"
            value={
              `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || ""
            }
            required
            disabled
          />
          <Input
            label="Email"
            type="email"
            value={user?.email || ""}
            required
            disabled
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date de début" type="date" required />
            <Input label="Date de retour" type="date" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner un stock
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {book.data.stocks?.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.language.toUpperCase()} - {stock.available_quantity}{" "}
                  disponible(s)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantité"
            type="number"
            min="1"
            max={book.data.available_copies}
            required
          />

          <Textarea label="Remarque (optionnel)" />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoanModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Envoyer la demande</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de modification du livre (admin/secretaire) */}
      <Modal
        isOpen={isEditBookModalOpen}
        onClose={() => setEditBookModalOpen(false)}
        title="Modifier le livre"
        animation="fadeIn"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // logique de modification du livre
            setEditBookModalOpen(false);
            alert("Livre modifié avec succès !");
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input label="Titre" defaultValue={book.data.title} required />
              <Input
                label="Année de publication"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                defaultValue={book.data.publication_year || ""}
              />
              <Input
                label="ISBN"
                defaultValue={book.data.isbn || ""}
                placeholder="Ex: 978-3-16-148410-0"
              />
              <Input label="Éditeur" defaultValue={book.data.publisher || ""} />
            </div>

            <div className="space-y-4">
              {/* Téléchargement d'image avec prévisualisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <div className="flex items-center gap-4">
                  {/* Afficher l'image sélectionnée, l'image existante, ou un placeholder */}
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Nouvelle couverture"
                      className="w-16 h-20 object-cover rounded border"
                    />
                  ) : book.data.image_couverture ? (
                    <img
                      src={book.data.image_couverture}
                      alt="Couverture actuelle"
                      className="w-16 h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-gray-100 border rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">Aucune image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formats supportés: JPG, PNG, WEBP. Max: 2MB
                    </p>
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImageFile(null);
                          // Réinitialiser le champ file
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                      >
                        Supprimer l'image sélectionnée
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sélection de catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  defaultValue={book.data.category.id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Roman</option>
                  <option value="2">Science-Fiction</option>
                  <option value="3">Fantasy</option>
                  <option value="4">Policier</option>
                  <option value="5">Biographie</option>
                  <option value="6">Histoire</option>
                  <option value="7">Science</option>
                  {/* Ajouter d'autres options de catégories ici */}
                </select>
              </div>

              {/* Sélection des auteurs (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auteurs
                </label>
                <select
                  multiple
                  defaultValue={book.data.authors.map((a) => a.id)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                >
                  <option value="1">Victor Hugo</option>
                  <option value="2">George Orwell</option>
                  <option value="3">J.K. Rowling</option>
                  <option value="4">Stephen King</option>
                  <option value="5">Agatha Christie</option>
                  <option value="6">Albert Camus</option>
                  {/* Ajouter d'autres options d'auteurs ici */}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Maintenez Ctrl/Cmd pour sélectionner plusieurs auteurs
                </p>
              </div>
            </div>
          </div>

          <Textarea
            label="Description/Résumé"
            rows={4}
            defaultValue={book.data.summary || ""}
            placeholder="Résumé du livre..."
          />

          {/* Statut de disponibilité */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-available"
              defaultChecked={book.data.available_copies > 0}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is-available"
              className="ml-2 block text-sm text-gray-900"
            >
              Marquer comme disponible
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditBookModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de modification de stock (admin/secretaire) */}
      <Modal
        isOpen={isEditStockModalOpen}
        onClose={() => setEditStockModalOpen(false)}
        title="Modifier le stock"
        animation="fadeIn"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // logique de modification du stock
            setEditStockModalOpen(false);
            alert("Stock modifié avec succès !");
          }}
          className="space-y-4"
        >
          <Input
            label="Quantité totale"
            type="number"
            defaultValue={selectedStock?.total_quantity || ""}
            required
          />
          <Input
            label="Quantité disponible"
            type="number"
            defaultValue={selectedStock?.available_quantity || ""}
            required
          />
          <Input
            label="Langue"
            defaultValue={selectedStock?.language || ""}
            required
          />
          <Textarea
            label="Notes sur la condition"
            defaultValue={selectedStock?.condition_note || ""}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditStockModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Modal d'ajout de stock (admin/secretaire) */}
      <Modal
        isOpen={isAddStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        title="Ajouter un nouveau stock"
        animation="fadeIn"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // logique d'ajout de stock
            setAddStockModalOpen(false);
            alert("Stock ajouté avec succès !");
          }}
          className="space-y-4"
        >
          <Input label="Quantité totale" type="number" required />
          <Input label="Quantité disponible" type="number" required />
          <Input label="Langue" required />
          <Textarea label="Notes sur la condition" />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddStockModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Ajouter le stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};