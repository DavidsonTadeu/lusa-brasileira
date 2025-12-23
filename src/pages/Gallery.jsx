import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const categoryNames = {
  todos: "Todos",
  corte: "Cortes",
  coloracao: "Coloração",
  penteados: "Penteados",
  tratamentos: "Tratamentos",
  extensoes: "Extensões",
  noivas: "Noivas"
};

// Variantes de animação para o deslize
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  
  // Agora controlamos o ÍNDICE da imagem, não o objeto
  // null = galeria fechada
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Direção da animação (1 = direita/próxima, -1 = esquerda/anterior)
  const [direction, setDirection] = useState(0);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => base44.entities.GalleryImage.list('order'),
  });

  // Filtra as imagens baseado na aba selecionada
  const filteredImages = selectedCategory === "todos" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Fecha o modal ao trocar de categoria
  useEffect(() => {
    setSelectedIndex(null);
  }, [selectedCategory]);

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setSelectedIndex((prevIndex) => {
      // Lógica circular (se for o último, vai para o primeiro e vice-versa)
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = filteredImages.length - 1;
      if (nextIndex >= filteredImages.length) nextIndex = 0;
      return nextIndex;
    });
  }, [filteredImages.length]);

  // Atalhos de Teclado (Setas e ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, paginate]);

  // Imagem atual baseada no índice
  const currentImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela1.png)', 
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
            Galeria
          </h1>
          <p className="text-xl text-white/90">Veja os meus trabalhos mais recentes</p>
        </motion.div>
      </section>

      {/* Grid de Fotos */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Tabs */}
          <div className="mb-12 overflow-x-auto">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="inline-flex min-w-full md:min-w-0 bg-gray-100 p-1">
                {Object.keys(categoryNames).map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="data-[state=active]:bg-white data-[state=active]:text-[var(--primary)]"
                  >
                    {categoryNames[cat]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-10 h-10 text-[var(--primary)]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-gray-100"
                  onClick={() => {
                    setDirection(0);
                    setSelectedIndex(index);
                  }}
                >
                  <img 
                    src={image.image_url}
                    alt={image.title || "Trabalho Lusa Brasileira"}
                    // object-top garante que cabeças não sejam cortadas na miniatura
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <ZoomIn className="text-white w-8 h-8 mb-2 drop-shadow-lg" />
                    {image.title && (
                      <span className="text-white font-medium text-sm text-center drop-shadow-md">
                        {image.title}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Nenhuma imagem encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- LIGHTBOX (ZOOM) COM NAVEGAÇÃO E ARRASTAR --- */}
      <AnimatePresence initial={false} custom={direction}>
        {selectedIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm touch-none" // touch-none evita scroll da pagina
            onClick={() => setSelectedIndex(null)}
          >
            {/* Botão Fechar */}
            <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50">
              <X className="w-10 h-10" />
            </button>

            {/* Botão Anterior (Esquerda) */}
            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full z-50 transition-colors hidden md:block"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Botão Próximo (Direita) */}
            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full z-50 transition-colors hidden md:block"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* A Imagem com Animação e Arrastar */}
            <div 
                className="w-full h-full flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()} // Clicar na área da imagem não fecha
            >
                <motion.img
                    key={selectedIndex} // Chave muda = nova animação
                    src={currentImage.image_url}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    // --- CONFIGURAÇÃO DO ARRASTAR (SWIPE) ---
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1); // Swipe Esquerda -> Próximo
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1); // Swipe Direita -> Anterior
                        }
                    }}
                    className="max-h-[85vh] max-w-[95vw] object-contain rounded-md shadow-2xl cursor-grab active:cursor-grabbing"
                    alt={currentImage.title}
                />
            </div>

            {/* Legenda Fixa em Baixo */}
            {currentImage.title && (
              <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-50">
                <span className="text-white text-lg font-medium bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                  {currentImage.title}
                </span>
              </div>
            )}
            
            {/* Indicador de Quantidade (Ex: 1 / 10) */}
            <div className="absolute top-6 left-6 text-white/50 text-sm z-50">
                {selectedIndex + 1} / {filteredImages.length}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}