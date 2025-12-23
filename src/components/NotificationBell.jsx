import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, Megaphone, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format, isAfter } from "date-fns";
import { pt } from "date-fns/locale";

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null); // Referência para detectar cliques
  const queryClient = useQueryClient();

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Adiciona o ouvinte se o menu estiver aberto
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 1. Busca Notificações Pessoais
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }),
    refetchInterval: 10000 
  });

  // 2. Busca Anúncios Gerais
  const { data: announcements = [] } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: () => base44.entities.Announcement.list(),
    refetchInterval: 30000
  });

  // Filtra anúncios válidos
  const validAnnouncements = announcements.filter(a => isAfter(new Date(a.expires_at), new Date()));

  // Combina tudo
  const allItems = [
    ...notifications.map(n => ({...n, source: 'personal'})), 
    ...validAnnouncements.map(a => ({...a, source: 'global', read: false}))
  ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = notifications.filter(n => !n.read).length + validAnnouncements.length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const getIcon = (type) => {
    switch(type) {
      case 'promo': return <Megaphone className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-gray-900">Notificações</h3>
              <span className="text-xs text-gray-500">{unreadCount} novas</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {allItems.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">Nenhuma novidade por enquanto.</p>
              ) : (
                allItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!item.read && item.source === 'personal' ? 'bg-blue-50/50' : ''}`}
                    onClick={() => item.source === 'personal' && !item.read && markReadMutation.mutate(item.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {format(new Date(item.created_at || new Date()), "dd MMM", { locale: pt })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}