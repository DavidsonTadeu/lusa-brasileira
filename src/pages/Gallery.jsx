import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Loader2, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryNames = {
  todos: "Todos",
  corte: "Cortes",
  coloracao: "Coloração",
  penteados: "Penteados",
  tratamentos: "Tratamentos",
  extensoes: "Extensões",
  noivas: "Noivas"
};

// Variantes para o Lightbox (Deslizar)
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
  
  // Controle do Lightbox
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [direction, setDirection] = useState(0);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => base44.entities.GalleryImage.list('order'),
  });

  const filteredImages = selectedCategory === "todos" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Fecha o modal ao trocar de categoria
  useEffect(() => {
    setSelectedIndex(null);
  }, [selectedCategory]);

  // Navegação do Lightbox
  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setSelectedIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = filteredImages.length - 1;
      if (nextIndex >= filteredImages.length) nextIndex = 0;
      return nextIndex;
    });
  }, [filteredImages.length]);

  // Teclado (Setas e ESC)
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

  const currentImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO ANIMADO (Igual Home e Serviços) */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela1.png)', 
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{fontFamily: "'Playfair Display', serif"}}>
            Galeria
          </h1>
          <p className="text-xl text-white/90 font-light">Veja os meus trabalhos mais recentes</p>
        </motion.div>
      </section>

      {/* SEÇÃO PRINCIPAL */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* MENU DE CATEGORIAS (EFEITO DESLIZANTE) */}
          <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex bg-gray-100/80 p-1.5 rounded-full w-max mx-auto md:w-fit backdrop-blur-sm">
              {Object.keys(categoryNames).map((cat) => (
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
                    {categoryNames[cat]}
                  </span>
                  {selectedCategory === cat && (
                    <motion.div
                      layoutId="activeTabGallery"
                      className="absolute inset-0 bg-white rounded-full shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin w-10 h-10 text-[var(--primary)]" />
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    layout
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-gray-100 shadow-sm hover:shadow-xl"
                    onClick={() => {
                      setDirection(0);
                      setSelectedIndex(index);
                    }}
                  >
                    <img 
                      src={image.url}
                      alt={image.title || "Trabalho Lusa Brasileira"}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    
                    {/* Overlay Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                      <ZoomIn className="text-white w-10 h-10 mb-2 drop-shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                      {image.title && (
                        <span className="text-white font-medium text-sm text-center drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                          {image.title}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredImages.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">Nenhuma imagem encontrada nesta categoria.</p>
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory("todos")}
                className="text-[var(--primary)] mt-2"
              >
                Ver todas as fotos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --- LIGHTBOX (MODAL DE ZOOM) --- */}
      <AnimatePresence initial={false} custom={direction}>
        {selectedIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md touch-none"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Botão Fechar */}
            <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 bg-black/20 rounded-full hover:bg-black/50 transition-colors">
              <X className="w-8 h-8" />
            </button>

            {/* Setas Navegação Desktop */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full z-50 transition-all hover:bg-white/10 hidden md:block"
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full z-50 transition-all hover:bg-white/10 hidden md:block"
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Imagem */}
            <div 
                className="w-full h-full flex items-center justify-center p-4 md:p-10"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.img
                    key={selectedIndex}
                    src={currentImage.url}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                    className="max-h-[85vh] max-w-[95vw] object-contain rounded-md shadow-2xl cursor-grab active:cursor-grabbing select-none"
                    alt={currentImage.title}
                />
            </div>

            {/* Info da Imagem */}
            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-50 px-4">
              {currentImage.title && (
                <div className="inline-block">
                  <span className="text-white text-lg font-medium bg-black/60 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                    {currentImage.title}
                  </span>
                </div>
              )}
              <div className="mt-2 text-white/40 text-sm">
                {selectedIndex + 1} / {filteredImages.length}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}