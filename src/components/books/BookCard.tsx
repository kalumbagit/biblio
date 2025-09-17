import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Calendar, User, Tag } from 'lucide-react';
import { Book as BookType } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const isAvailable = book.available_copies > 0;
  

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[4/4] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        {book.image_couverture ? (
          <img
            src={book.image_couverture}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Book className="w-16 h-16 text-blue-300" />
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-600 text-sm flex items-center">
            <User className="w-3 h-3 mr-1" />
            {book.authors.map(author => author.full_name).join(", ")}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {book.publication_year || 'Année inconnue'}
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Tag className="w-3 h-3 mr-1" />
             {book.category?.name ?? 'Catégorie inconnue'}
          </div>
          
          <div className="flex items-center justify-between">
            <Badge
              variant={isAvailable ? 'success' : 'danger'}
              size="sm"
            >
              {isAvailable ? 'Disponible' : 'Indisponible'}
            </Badge>
            <span className="text-xs text-gray-500">
              {book.available_copies}/{Array.isArray(book.stocks) ? book.stocks.reduce((acc, s) => acc + s.total_quantity, 0) : 0} dispo
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Link to={`/books/${book.id}`}>
            <Button size="sm" className="w-full">
              Voir détails
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};