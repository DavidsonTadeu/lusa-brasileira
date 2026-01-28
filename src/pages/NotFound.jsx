import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-[var(--primary)] opacity-20" style={{fontFamily: "'Playfair Display', serif"}}>
          404
        </h1>
        <div className="-mt-12 relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Página Não Encontrada</h2>
          <p className="text-gray-600 mb-8">
            Ops! Parece que se perdeu. A página que procura não existe ou foi movida.
          </p>
          <Link to="/">
            <Button size="lg" style={{backgroundColor: 'var(--primary)'}} className="text-white gap-2">
              <Home className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}