import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare } from "lucide-react";

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // --- CONFIGURAÇÃO DOS LINKS ---
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "351915429170";
  const message = "Olá! Gostaria de saber mais sobre os serviços.";
  
  const socialLinks = {
    whatsapp: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    instagram: "https://instagram.com/lusabrasileira", // Substitua pelo link real
    facebook: "https://facebook.com/lusabrasileira"    // Substitua pelo link real
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  // Variantes de Animação (Efeito Cascata de Baixo para Cima)
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <>
      {/* Fundo escuro/invisível para fechar ao clicar fora (Melhora UX no mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* CONTAINER PRINCIPAL FIXO */}
      {/* Importante: REMOVI qualquer classe de 'transition' deste container pai. */}
      {/* Ele serve apenas para segurar a posição fixa. */}
      <div 
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3 mb-[env(safe-area-inset-bottom)]"
        style={{ touchAction: 'none' }} // Otimização para toque
      >
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col gap-3 mb-2 items-center">
              
              {/* --- BOTÃO FACEBOOK --- */}
              <motion.a
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: 0.2 }}
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform bg-[#1877F2]"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.928 1.67-2.928 3.403v1.518h3.949l-1.006 3.67h-2.943v7.982A10.032 10.032 0 0 0 22 11.973C22 6.465 17.535 2 12.026 2S2.052 6.465 2.052 11.973c0 5.234 4.153 9.522 9.29 9.981-.742-.515-1.554-1.206-2.241-1.263Z"/>
                </svg>
              </motion.a>

              {/* --- BOTÃO INSTAGRAM --- */}
              <motion.a
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: 0.1 }}
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                style={{ 
                  background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" 
                }}
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/>
                </svg>
              </motion.a>

              {/* --- BOTÃO WHATSAPP --- */}
              <motion.a
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: 0 }}
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </motion.a>
            </div>
          )}
        </AnimatePresence>

        {/* --- BOTÃO PRINCIPAL (Toggle) --- */}
        {/* CORREÇÃO AQUI: 'transition-all' removido. Usamos apenas transições específicas para não animar a posição. */}
        <button
          onClick={toggleOpen}
          className={`w-16 h-16 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center text-white border-2 border-white/20 transition-transform transition-colors duration-300 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-[var(--primary)]'}`}
          aria-label="Abrir contactos"
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <div className="relative">
               {/* Ícone de Chat Genérico */}
               <MessageSquare className="w-7 h-7" />
               
               {/* Bolinha de notificação pulsante */}
               <span className="absolute -top-2 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-[var(--primary)]"></span>
                </span>
            </div>
          )}
        </button>
      </div>
    </>
  );
}