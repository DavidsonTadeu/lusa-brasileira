import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, CheckCircle, XCircle, User, 
  MessageSquare, Phone, Scissors, CheckCheck 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed

  // Busca os agendamentos
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const data = await base44.entities.Booking.list('-booking_date'); // Ordena por data
      return data;
    },
  });

  // Mutação para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-for-calendar'] });
    },
  });

  // Função auxiliar para traduzir status (CORES ADAPTADAS PARA DARK MODE)
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return { label: 'Pendente', color: 'bg-yellow-900/30 text-yellow-200 border-yellow-800' };
      case 'confirmed': return { label: 'Confirmado', color: 'bg-green-900/30 text-green-200 border-green-800' };
      case 'cancelled': return { label: 'Cancelado', color: 'bg-red-900/30 text-red-200 border-red-800' };
      case 'completed': return { label: 'Concluído', color: 'bg-gray-700/50 text-gray-300 border-gray-600' };
      default: return { label: status, color: 'bg-gray-700 text-gray-300' };
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return b.status !== 'cancelled';
    if (filter === 'history') return b.status === 'completed' || b.status === 'cancelled';
    return b.status === filter;
  });

  const handleStatusChange = (id, newStatus) => {
    if (window.confirm(`Tem a certeza que deseja marcar como ${newStatus}?`)) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  return (
    // AQUI ESTÁ A ALTERAÇÃO: Fundo escuro (gray-900)
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{fontFamily: "'Playfair Display', serif"}}>Gestão de Agendamentos</h1>
            <p className="text-gray-400">Controle os pedidos e a agenda do salão.</p>
          </div>
          
          {/* Filtros - Cores Escuras */}
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              Ativos
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'pending' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'confirmed' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              Confirmados
            </button>
            <button 
              onClick={() => setFilter('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'history' ? 'bg-[var(--primary)] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Lista de Cards */}
        <div className="grid gap-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 rounded-lg border border-dashed border-gray-700">
              <p className="text-gray-400">Nenhum agendamento encontrado neste filtro.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const statusStyle = getStatusLabel(booking.status);
              return (
                // Card Escuro
                <Card key={booking.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
                  
                  {/* Informações Principais */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.color}`}>
                        {statusStyle.label.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.booking_date ? format(parseISO(booking.booking_date), "dd 'de' MMMM", { locale: pt }) : 'Data inválida'}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.booking_time}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{booking.client_name}</h3>
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                       <Scissors className="w-4 h-4 text-[var(--primary)]" />
                       <span className="font-medium">{booking.service_name}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <a href={`mailto:${booking.client_email}`} className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                        <MessageSquare className="w-3 h-3" /> {booking.client_email}
                      </a>
                      <a href={`https://wa.me/${booking.client_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-400 transition-colors">
                        <Phone className="w-3 h-3" /> {booking.client_phone}
                      </a>
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-3 bg-yellow-900/20 p-2 rounded text-xs text-yellow-200 border border-yellow-900/50 inline-block">
                        <strong>Nota:</strong> {booking.notes}
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    
                    {/* SE ESTIVER PENDENTE -> Confirmar */}
                    {booking.status === 'pending' && (
                      <Button 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                      </Button>
                    )}

                    {/* SE ESTIVER CONFIRMADO -> Concluir (NOVO!) */}
                    {booking.status === 'confirmed' && (
                      <Button 
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                        className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto"
                      >
                        <CheckCheck className="w-4 h-4 mr-2" /> Concluir Serviço
                      </Button>
                    )}

                    {/* SE NÃO ESTIVER CANCELADO OU CONCLUÍDO -> Cancelar */}
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button 
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="text-red-400 border-red-900/50 hover:bg-red-900/20 hover:text-red-300 w-full sm:w-auto bg-transparent"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    )}

                    {/* SE ESTIVER CONCLUÍDO -> Texto indicativo */}
                    {booking.status === 'completed' && (
                       <span className="text-gray-500 text-sm font-medium italic px-4">
                         Serviço Finalizado
                       </span>
                    )}
                  </div>

                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}