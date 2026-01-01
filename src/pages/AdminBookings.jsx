import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Clock, CheckCircle, XCircle, User, 
  MessageSquare, Phone, Scissors, CheckCheck, Search, Filter, AlertCircle, Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; // Assumindo que você usa sonner, se não, pode remover

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");

  // --- DATA FETCHING ---
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      return await base44.entities.Booking.list('-booking_date'); 
    },
  });

  // --- MUTATION CORRIGIDA PARA ENVIAR NOTIFICAÇÃO ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, bookingData }) => {
      // 1. Atualiza o status
      const updatedBooking = await base44.entities.Booking.update(id, { status });

      // 2. Envia notificação ao cliente (SE ele tiver um ID associado)
      if (bookingData && bookingData.client_id) {
        let title = "";
        let message = "";
        let type = "info";

        if (status === 'confirmed') {
          title = "Agendamento Confirmado! ✅";
          message = `O seu agendamento de ${bookingData.service_name} para ${formatSafeDate(bookingData.booking_date)} às ${bookingData.booking_time} foi confirmado.`;
          type = "success";
        } else if (status === 'cancelled') {
          title = "Agendamento Cancelado ❌";
          message = `O seu agendamento de ${bookingData.service_name} para ${formatSafeDate(bookingData.booking_date)} foi cancelado ou recusado.`;
          type = "error";
        } else if (status === 'completed') {
            // Opcional: Pedir avaliação após concluir
            title = "Serviço Concluído ✨";
            message = `Obrigado pela visita! Deixe a sua avaliação no site.`;
            type = "success";
        }

        if (title) {
            try {
                await base44.entities.Notification.create({
                    user_id: bookingData.client_id,
                    type,
                    title,
                    message,
                    read: false,
                    created_at: new Date().toISOString()
                });
            } catch (err) {
                console.warn("Erro ao notificar cliente:", err);
            }
        }
      }
      return updatedBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-for-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      // Se tiver toast configurado:
      // toast.success("Status atualizado e cliente notificado!");
    },
    onError: () => {
        alert("Erro ao atualizar o agendamento.");
    }
  });

  // --- HELPERS VISUAIS ---
  const formatSafeDate = (dateString) => {
    if (!dateString) return 'Data indefinida';
    try {
      const cleanDate = dateString.substring(0, 10); 
      const [year, month, day] = cleanDate.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0);
      return format(localDate, "dd 'de' MMMM", { locale: pt });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': return { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: AlertCircle };
      case 'confirmed': return { label: 'Confirmado', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle };
      case 'cancelled': return { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle };
      case 'completed': return { label: 'Concluído', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCheck };
      default: return { label: status, color: 'bg-gray-700 text-gray-300', icon: User };
    }
  };

  // --- FILTROS E PESQUISA ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesStatus = 
        filter === 'all' ? b.status !== 'cancelled' :
        filter === 'history' ? (b.status === 'completed' || b.status === 'cancelled') :
        b.status === filter;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        b.client_name?.toLowerCase().includes(searchLower) ||
        b.service_name?.toLowerCase().includes(searchLower) ||
        b.client_email?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filter, searchTerm]);

  const counts = useMemo(() => ({
    all: bookings.filter(b => b.status !== 'cancelled').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    history: bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length
  }), [bookings]);

  // Função atualizada para passar o objeto booking inteiro
  const handleStatusChange = (booking, newStatus) => {
    const actionName = newStatus === 'confirmed' ? 'Confirmar' : newStatus === 'cancelled' ? 'Cancelar' : 'Concluir';
    if (window.confirm(`Tem a certeza que deseja ${actionName} este agendamento? O cliente será notificado.`)) {
      updateStatusMutation.mutate({ id: booking.id, status: newStatus, bookingData: booking });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white mb-2">Gestão de Pedidos</h1>
            <p className="text-gray-400">Gerencie solicitações, confirmações e histórico.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Buscar cliente ou serviço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {/* ABAS DE FILTRO */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-1">
          {[
            { id: 'all', label: 'Todos Ativos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'confirmed', label: 'Confirmados' },
            { id: 'history', label: 'Histórico' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-t-lg transition-all relative
                ${filter === tab.id 
                  ? 'text-[var(--primary)] bg-gray-800 border-b-2 border-[var(--primary)]' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
              `}
            >
              {tab.label}
              <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${filter === tab.id ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-gray-700 text-gray-400'}`}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* LISTA DE AGENDAMENTOS */}
        <div className="space-y-3">
          {isLoading ? (
             <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                 <Filter className="w-8 h-8" />
              </div>
              <p className="text-gray-300 font-medium">Nenhum agendamento encontrado.</p>
              <p className="text-gray-500 text-sm mt-1">Tente mudar o filtro ou a pesquisa.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredBookings.map((booking) => {
                const config = getStatusConfig(booking.status);
                const StatusIcon = config.icon;

                return (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors overflow-hidden group">
                      <div className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        
                        {/* 1. DATA */}
                        <div className="flex lg:flex-col items-center lg:items-start gap-2 min-w-[140px]">
                           <div className="flex items-center gap-2 text-gray-300">
                             <Calendar className="w-4 h-4 text-[var(--primary)]" />
                             <span className="font-medium capitalize">{formatSafeDate(booking.booking_date)}</span>
                           </div>
                           <div className="flex items-center gap-2 text-gray-400 text-sm lg:mt-1">
                             <Clock className="w-4 h-4" />
                             <span>{booking.booking_time}</span>
                           </div>
                        </div>

                        {/* 2. INFORMAÇÕES DO CLIENTE */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white truncate">{booking.client_name}</h3>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${config.color}`}>
                              <StatusIcon className="w-3 h-3" /> {config.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[var(--primary)] font-medium text-sm mb-2">
                            <Scissors className="w-3.5 h-3.5" />
                            {booking.service_name}
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            {booking.client_phone && (
                                <a href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-400 transition-colors">
                                  <Phone className="w-3 h-3" /> {booking.client_phone}
                                </a>
                            )}
                            {booking.client_email && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]" title={booking.client_email}>
                                  <MessageSquare className="w-3 h-3" /> {booking.client_email}
                                </span>
                            )}
                          </div>
                        </div>

                        {/* 3. AÇÕES */}
                        <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-700 mt-2 lg:mt-0">
                          
                          <a 
                            href={`https://wa.me/${booking.client_phone?.replace(/\D/g, '')}?text=Olá ${booking.client_name}, falo da Lusa Brasileira sobre o seu agendamento...`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 lg:flex-none"
                          >
                             <Button variant="ghost" size="icon" className="w-full lg:w-10 h-10 bg-green-900/20 text-green-500 hover:bg-green-500 hover:text-white border border-green-900/50">
                               <MessageSquare className="w-5 h-5" />
                             </Button>
                          </a>

                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                onClick={() => handleStatusChange(booking, 'confirmed')} 
                                className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => handleStatusChange(booking, 'cancelled')} 
                                className="flex-1 lg:flex-none border-red-800 text-red-500 hover:bg-red-900/30 bg-transparent"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Recusar
                              </Button>
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                             <Button 
                                onClick={() => handleStatusChange(booking, 'completed')} 
                                className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                             >
                               <CheckCheck className="w-4 h-4 mr-2" /> Concluir
                             </Button>
                          )}

                          {booking.status === 'confirmed' && (
                             <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(booking, 'cancelled')} 
                                className="text-gray-500 hover:text-red-500"
                                title="Cancelar Agendamento"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                          )}

                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}