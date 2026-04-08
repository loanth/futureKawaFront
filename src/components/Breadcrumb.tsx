import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
export interface BreadcrumbItem {
  label: string;
  path?: string;
}
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className="flex mb-6 text-sm text-coffee-medium"
      aria-label="Breadcrumb">
      
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center hover:text-accent-primary transition-colors">
            
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Link>
        </li>
        {items.map((item, index) =>
        <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-coffee-light mx-1" />
              {item.path && index !== items.length - 1 ?
            <Link
              to={item.path}
              className="hover:text-accent-primary transition-colors">
              
                  {item.label}
                </Link> :

            <span className="text-coffee-dark font-medium">
                  {item.label}
                </span>
            }
            </div>
          </li>
        )}
      </ol>
    </nav>);

};