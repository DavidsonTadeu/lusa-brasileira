import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Clock, Calendar as CalendarIcon, CheckCircle, XCircle, 
  MessageCircle, Lock, Unlock, DollarSign, Phone, Loader2 
} from "lucide-react";
import { format, addMinutes, parse, isToday } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

export default function AdminAgenda() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  // --- 1. DADOS FUNDAMENTAIS ---
  
  // Buscar Profissionais (para o ID do bloqueio)
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals-list'],
    queryFn: () => base44.entities.Professional.filter({ is_active: true }),
  });
  
  // Buscar Serviços (PARA PEGAR O PREÇO CORRETO)
  const { data: services = [] } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => base44.entities.Service.list(),
  });

  const currentProfessional = professionals.find(p => p.email === user?.email) || professionals[0];

  // --- 2. DADOS DO DIA ---
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-agenda-daily', selectedDate],
    queryFn: () => base44.entities.Booking.filter({
      booking_date: format(selectedDate, 'yyyy-MM-dd')
    }),
  });

  const { data: blockedSlots = [] } = useQuery({
    queryKey: ['blocked-slots', selectedDate],
    queryFn: () => base44.entities.BlockedSlot.filter({
      date: format(selectedDate, 'yyyy-MM-dd')
    }),
  });

  // --- 3. CÁLCULO FINANCEIRO CORRIGIDO ---
  const dayRevenue = bookings
    .filter(b => ['confirmed', 'completed'].includes(b.status)) // Só soma confirmados ou concluídos
    .reduce((acc, curr) => {
      // Tenta achar o preço no agendamento, se não, busca no serviço correspondente
      let price = curr.price;
      
      if (!price) {
        // Procura o serviço pelo ID ou pelo Nome exato
        const service = services.find(s => s.id === curr.service_id || s.name === curr.service_name);
        price = service ? service.price : 0;
      }
      
      return acc + Number(price || 0);
    }, 0);
  
  const dayCount = bookings.filter(b => b.status !== 'cancelled').length;

  // --- MUTATIONS ---
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-agenda-daily'] });
      // Invalida dashboard também para atualizar totais lá
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
    },
    onError: () => alert("Erro ao atualizar status.")
  });

  const blockSlotMutation = useMutation({
    mutationFn: (data) => {
      if (!currentProfessional?.id) {
        throw new Error("ID do Profissional não encontrado. Verifique o cadastro de profissionais.");
      }

      const payload = {
        professional_id: currentProfessional.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: data.start,
        end_time: data.end, 
        reason: data.reason || 'Bloqueio Manual'
      };

      return base44.entities.BlockedSlot.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-slots'] }),
    onError: (err) => {
      console.error("Erro SQL:", err);
      alert(`Erro ao bloquear: ${err.message}.`);
    }
  });

  const unlockSlotMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedSlot.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-slots'] }),
    onError: () => alert("Erro ao desbloquear.")
  });

  // --- AÇÕES ---
  const handleBlockSlot = (time) => {
    // Bloqueia 30 minutos (1 slot)
    const endTime = format(addMinutes(parse(time, 'HH:mm', new Date()), 30), 'HH:mm');
    blockSlotMutation.mutate({ start: time, end: endTime });
  };

  const handleBlockFullDay = () => {
    if (confirm("Bloquear o dia inteiro?")) {
      blockSlotMutation.mutate({ start: "00:00", end: "23:59", reason: "Dia Bloqueado" });
    }
  };

  // --- HELPER FUNCTIONS ---
  const timeSlots = [];
  // Horário Ingrid: 10:00 as 17:00
  let startTime = parse('10:00', 'HH:mm', new Date());
  const endTime = parse('17:00', 'HH:mm', new Date());

  while (startTime <= endTime) {
    timeSlots.push(format(startTime, 'HH:mm'));
    startTime = addMinutes(startTime, 30);
  }

  const getBookingAtTime = (time) => bookings.find(b => b.booking_time === time && b.status !== 'cancelled');
  
  const getBlockedAtTime = (time) => blockedSlots.find(b => {
    if (b.end_time) {
      return b.start_time <= time && b.end_time > time;
    }
    return b.start_time === time;
  });

  const isFullDayBlocked = blockedSlots.some(b => b.start_time === "00:00");

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        
        {/* --- COLUNA ESQUERDA --- */}
        <div className="space-y-6">
          <div className="lg:hidden mb-4">
             <h1 className="text-2xl font-bold font-serif">Agenda Diária</h1>
             <p className="text-gray-400">{format(selectedDate, "dd 'de' MMMM", { locale: pt })}</p>
          </div>

          <Card className="bg-gray-800 border-gray-700 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="font-bold flex items-center gap-2 text-white">
                <CalendarIcon className="w-4 h-4 text-[var(--primary)]" /> Navegação
              </h2>
            </div>
            <div className="p-4 bg-gray-900/30 text-center">
               <input 
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => e.target.value && setSelectedDate(parse(e.target.value, 'yyyy-MM-dd', new Date()))}
                className="bg-gray-800 text-white border border-gray-600 rounded p-2 w-full text-center [color-scheme:dark] focus:border-[var(--primary)] outline-none cursor-pointer"
               />
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Gestão do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-700">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded text-green-400"><DollarSign className="w-5 h-5"/></div>
                      <div>
                        <p className="text-xs text-gray-400">Previsão (Confirmados)</p>
                        <p className="font-bold text-lg text-white">€{dayRevenue.toFixed(0)}</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-700">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded text-blue-400"><Clock className="w-5 h-5"/></div>
                      <div>
                        <p className="text-xs text-gray-400">Agendamentos</p>
                        <p className="font-bold text-lg text-white">{dayCount} clientes</p>
                      </div>
                   </div>
                </div>

                {!isFullDayBlocked ? (
                  <Button 
                    onClick={handleBlockFullDay}
                    variant="outline" 
                    disabled={blockSlotMutation.isPending}
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all h-12"
                  >
                    {blockSlotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    Bloquear Dia Inteiro
                  </Button>
                ) : (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-center text-red-200 text-sm">
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    Dia Bloqueado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- COLUNA DIREITA --- */}
        <div className="space-y-4">
          <div className="hidden lg:flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold font-serif text-white">Agenda do Dia</h1>
              <p className="text-gray-400 capitalize">{format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: pt })}</p>
            </div>
            {isToday(selectedDate) && (
              <span className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-full animate-pulse">
                HOJE
              </span>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 shadow-2xl overflow-hidden backdrop-blur-sm">
            {isFullDayBlocked ? (
              <div className="p-12 text-center flex flex-col items-center justify-center opacity-70">
                <div className="bg-red-900/20 p-6 rounded-full mb-4 border border-red-900/50">
                   <Lock className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dia Bloqueado</h3>
                <p className="text-gray-400 mb-6">Não é possível realizar agendamentos neste dia.</p>
                {(() => {
                   const fullDayBlock = blockedSlots.find(b => b.start_time === "00:00");
                   return fullDayBlock ? (
                     <Button 
                       onClick={() => unlockSlotMutation.mutate(fullDayBlock.id)}
                       variant="outline"
                       className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                     >
                       <Unlock className="w-4 h-4 mr-2" /> Desbloquear Dia
                     </Button>
                   ) : null;
                })()}
              </div>
            ) : (
              timeSlots.map((time) => {
                const booking = getBookingAtTime(time);
                const blocked = getBlockedAtTime(time);
                const isPastTime = isToday(selectedDate) && time < format(new Date(), 'HH:mm');

                return (
                  <div key={time} className={`group flex border-b border-gray-700/50 min-h-[90px] transition-colors ${booking ? 'bg-gray-800' : 'hover:bg-gray-800/80'}`}>
                    
                    <div className={`w-20 border-r border-gray-700/50 flex items-center justify-center text-sm font-medium ${isPastTime ? 'text-gray-600' : 'text-gray-400'}`}>
                      {time}
                    </div>

                    <div className="flex-1 p-3 relative">
                      
                      {booking && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }}
                          className={`h-full rounded-lg border-l-4 p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                            ${booking.status === 'confirmed' ? 'bg-green-900/20 border-green-500' : 
                              booking.status === 'pending' ? 'bg-yellow-900/20 border-yellow-500' : 'bg-gray-700 border-gray-500'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="font-bold text-white text-lg">{booking.client_name}</h3>
                               {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                               {booking.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <p className="text-gray-300 text-sm flex items-center gap-2">
                               <span className="font-medium text-[var(--primary)]">{booking.service_name}</span> 
                               <span className="text-gray-600">•</span>
                               <span className="text-gray-400 text-xs">{booking.duration_minutes || 60} min</span>
                            </p>
                            {booking.client_phone && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                 <Phone className="w-3 h-3" /> {booking.client_phone}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <a 
                              href={`https://wa.me/${booking.client_phone?.replace(/[^0-9]/g, '')}?text=Olá ${booking.client_name}, sobre o seu agendamento na Lusa Brasileira...`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="icon" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-900/30" title="WhatsApp">
                                <MessageCircle className="w-5 h-5" />
                              </Button>
                            </a>
                            
                            {booking.status === 'pending' && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-yellow-400 hover:text-green-400 hover:bg-green-900/30"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                title="Confirmar"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </Button>
                            )}

                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-gray-500 hover:text-red-400 hover:bg-red-900/30"
                              onClick={() => {
                                 if(confirm('Cancelar agendamento?')) updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' });
                              }}
                              title="Cancelar"
                            >
                              <XCircle className="w-5 h-5" />
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {!booking && blocked && (
                        <div className="h-full bg-gray-800/50 rounded-lg border border-gray-700 border-dashed flex items-center justify-between px-6 opacity-60">
                          <div className="flex items-center gap-3 text-gray-500">
                             <Lock className="w-4 h-4" />
                             <span className="text-sm font-medium italic">
                               {blocked.reason || 'Horário Bloqueado'}
                             </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-500 hover:text-white"
                            onClick={() => unlockSlotMutation.mutate(blocked.id)}
                          >
                            <Unlock className="w-4 h-4 mr-2" /> Desbloquear
                          </Button>
                        </div>
                      )}

                      {!booking && !blocked && (
                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="flex gap-4">
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="text-gray-400 hover:text-red-400 hover:bg-red-900/10"
                               onClick={() => handleBlockSlot(time)}
                             >
                                <Lock className="w-4 h-4 mr-2" /> Bloquear
                             </Button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}