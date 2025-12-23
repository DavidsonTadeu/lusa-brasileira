import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se já aceitou os cookies
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Pequeno delay para não aparecer "do nada" instantaneamente
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-gray-900/95 backdrop-blur shadow-2xl border-t border-gray-800"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="p-2 bg-gray-800 rounded-full shrink-0">
                <Cookie className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="text-sm text-gray-300">
                <p>
                  Utilizamos cookies para melhorar a sua experiência no site. Ao continuar a navegar, aceita a nossa{" "}
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-[var(--primary)] hover:underline">
                    Política de Privacidade
                  </Link>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0 w-full md:w-auto">
              <Button 
                onClick={handleAccept} 
                className="w-full md:w-auto bg-[var(--primary)] hover:opacity-90"
              >
                Aceitar e Continuar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}