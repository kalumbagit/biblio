import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">SteBiblio</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre bibliothèque numérique pour découvrir, emprunter et gérer vos lectures préférées. 
              Un système moderne et intuitif pour tous les passionnés de lecture.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">stevebodouinalima@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+237 6 88 50 62 65</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Carrefour golf, Yaoundé</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
            <div className="space-y-2">
              <a href="/books" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Catalogue
              </a>
              <a href="/about" className="block text-gray-300 hover:text-white text-sm transition-colors">
                À propos
              </a>
              <a href="/contact" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Nous contacter
              </a>
              <a href="/help" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Aide
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 Steve bodouin. Tous droits réservés.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                Politique de confidentialité
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};