import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Info, Sparkles, Loader2 } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela3.png)',
          }}
          initial={{ scale: 1.1, filter: 'brightness(0.5)' }}
          animate={{ scale: 1, filter: 'brightness(0.6)' }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center px-4"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            Menu de Serviços
          </h1>
          <p className="text-xl text-white/90 font-light">
            Beleza personalizada para você
          </p>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* AVISO IMPORTANTE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center text-center"
          >
            <p className="text-lg font-medium text-gray-700 flex flex-col md:flex-row items-center gap-2">
              <span className="flex items-center gap-2 text-[var(--primary)] font-bold">
                <Sparkles className="w-5 h-5" /> Observação:
              </span>
              <span>Em todos os procedimentos estão inclusos tratamentos e finalização.</span>
            </p>
          </motion.div>

          {/* FILTRO DE CATEGORIAS (COM EFEITO DESLIZANTE) */}
          <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex bg-gray-100/80 p-1.5 rounded-full w-max mx-auto md:w-fit backdrop-blur-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 z-10
                    ${selectedCategory === cat ? 'text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}
                  `}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <span className="relative z-10">
                    {cat === "todos" ? "Todos" : categoryNames[cat]}
                  </span>
                  {selectedCategory === cat && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-full shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
             <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
             </div>
          )}

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 h-full flex flex-col justify-between hover:shadow-2xl transition-all duration-300 border-gray-100 hover:border-[var(--primary)]/20 hover:-translate-y-1 group bg-white">
                    <div>
                      <div className="mb-4">
                        <span 
                          className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full transition-colors group-hover:bg-[var(--primary)] group-hover:text-white"
                          style={{backgroundColor: 'rgba(178, 34, 34, 0.1)', color: 'var(--primary)'}}
                        >
                          {categoryNames[service.category]}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-[var(--primary)] transition-colors" style={{fontFamily: "'Playfair Display', serif"}}>
                        {service.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 text-[var(--primary)]" />
                          <span>{service.duration_minutes} minutos</span>
                        </div>
                        {service.requires_consultation && (
                          <div className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium">
                            <Info className="w-4 h-4" />
                            <span>Requer consulta prévia</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <span className="text-sm text-gray-400 block mb-1 uppercase tracking-wide text-[10px]">Investimento</span>
                        <span className="text-2xl font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                          {service.price_from && <span className="text-sm font-normal text-gray-500 mr-1">desde</span>}
                          {service.price ? `€${service.price.toFixed(2)}` : 'Sob Consulta'}
                        </span>
                      </div>
                      
                      {/* --- AQUI ESTÁ A MUDANÇA --- */}
                      {/* Passamos o ID do serviço na URL: ?serviceId=123 */}
                      <Link to={`${createPageUrl("Booking")}?serviceId=${service.id}`}>
                        <Button 
                          size="sm"
                          style={{backgroundColor: 'var(--primary)'}}
                          className="hover:brightness-110 shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar
                        </Button>
                      </Link>

                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredServices.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200"
            >
              <p className="text-gray-500 text-lg">Nenhum serviço encontrado nesta categoria.</p>
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory("todos")}
                className="text-[var(--primary)] mt-2"
              >
                Ver todos os serviços
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{fontFamily: "'Playfair Display', serif"}}
            >
              Com Dúvidas Sobre Algum Serviço?
            </h2>
            <p className="text-xl text-gray-600 mb-10 font-light">
              Entre em contacto connosco e teremos todo o gosto em ajudar a escolher o melhor para si.
            </p>
            <Link to={createPageUrl("Contact")}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 py-6 text-lg border-2 hover:bg-[var(--primary)] hover:text-white transition-colors"
                  style={{borderColor: 'var(--primary)', color: 'var(--primary)'}}
                >
                  Falar Connosco
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}