import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryNames = {
  corte: "Cortes",
  coloracao: "Coloração",
  penteados: "Penteados",
  tratamentos: "Tratamentos",
  extensoes: "Extensões",
  noivas: "Noivas",
  outros: "Outros"
};

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'name'),
  });

  const categories = ["todos", ...Object.keys(categoryNames)];
  
  const filteredServices = selectedCategory === "todos" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela3.png)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            Menu de Serviços
          </h1>
          <p className="text-xl text-white/90">
            Beleza personalizada para você
          </p>
        </motion.div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Category Filter */}
          <div className="mb-12 overflow-x-auto">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="inline-flex min-w-full md:min-w-0 bg-gray-100 p-1">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="data-[state=active]:bg-white data-[state=active]:text-[var(--primary)]"
                  >
                    {cat === "todos" ? "Todos" : categoryNames[cat]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-xl transition-shadow duration-300 border-gray-100">
                  <div className="mb-4">
                    <span 
                      className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{backgroundColor: 'rgba(178, 34, 34, 0.1)', color: 'var(--primary)'}}
                    >
                      {categoryNames[service.category]}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} minutos</span>
                    </div>
                    {service.requires_consultation && (
                      <div className="flex items-center gap-2 text-sm" style={{color: 'var(--primary)'}}>
                        <Info className="w-4 h-4" />
                        <span>Requer consulta prévia</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Preço</span>
                      <span className="text-2xl font-bold" style={{color: 'var(--primary)'}}>
                        {service.price_from && 'desde '}
                        {service.price ? `€${service.price.toFixed(2)}` : 'Consultar'}
                      </span>
                    </div>
                    <Link to={createPageUrl("Booking")}>
                      <Button 
                        size="sm"
                        style={{backgroundColor: 'var(--primary)'}}
                        className="hover:opacity-90"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredServices.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Nenhum serviço encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            Com Dúvidas Sobre Qualquer Serviço?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Entre em contacto connosco e teremos todo o gosto em ajudar
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button 
              size="lg"
              variant="outline"
              className="rounded-full px-8"
              style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}
            >
              Contactar-nos
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}