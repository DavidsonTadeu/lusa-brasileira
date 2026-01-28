import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, XCircle, CheckCircle, AlertCircle, Sparkles, Plus, History, Loader2 } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

// Variantes de animação para a lista
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ClientAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['my-appointments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allBookings = await base44.entities.Booking.filter({ client_email: user.email });
      // Ordena: Futuros primeiro, depois passados
      return allBookings.sort((a, b) => new Date(b.booking_date + 'T' + b.booking_time) - new Date(a.booking_date + 'T' + a.booking_time));
    },
    enabled: !!user?.email
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    }
  });

  if (!user) return <div className="p-8 text-center">Por favor, faça login.</div>;

  const upcoming = appointments.filter(app => !isPast(parseISO(`${app.booking_date}T${app.booking_time}`)) && app.status !== 'cancelled');
  const past = appointments.filter(app => isPast(parseISO(`${app.booking_date}T${app.booking_time}`)) && app.status !== 'cancelled');
  const cancelled = appointments.filter(app => app.status === 'cancelled');

  // Badge de Status Bonita
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle, label: "Pendente" },
      confirmed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, label: "Confirmado" },
      cancelled: { color: "bg-red-50 text-red-700 border-red-100", icon: XCircle, label: "Cancelado" },
      completed: { color: "bg-gray-100 text-gray-600 border-gray-200", icon: CheckCircle, label: "Concluído" }
    };
    
    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
              Meus Agendamentos
            </h1>
            <p className="text-gray-500">Gerencie os seus horários e histórico.</p>
          </div>
          
          <Link 
            to={createPageUrl("Booking")} 
            onClick={() => window.scrollTo(0, 0)}
          >
            <Button className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" style={{backgroundColor: 'var(--primary)'}}>
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          </Link>
        </div>

        {/* LISTA DE AGENDAMENTOS FUTUROS */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-l-4 border-[var(--primary)] pl-3">
            <Calendar className="w-5 h-5 text-[var(--primary)]" /> Próximos Horários
          </h2>
          
          {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
          ) : upcoming.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300 shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Agenda livre</h3>
              <p className="text-gray-500 mb-6">Você não tem nenhum agendamento futuro no momento.</p>
              <Link to={createPageUrl("Booking")}>
                <Button variant="outline" className="border-[var(--primary)] text-[var(--primary)] hover:bg-red-50">
                  Agendar Agora
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6"
            >
              {upcoming.map((app) => (
                <motion.div key={app.id} variants={itemVariants}>
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white group">
                    <div className="flex flex-col md:flex-row">
                      
                      {/* Lado Esquerdo: Data (Visual de Calendário) */}
                      <div className="bg-[var(--primary)] text-white p-6 flex flex-col items-center justify-center min-w-[120px] text-center">
                         <span className="text-3xl font-bold leading-none">
                           {format(parseISO(app.booking_date), "dd")}
                         </span>
                         <span className="text-sm uppercase font-medium tracking-wider opacity-90 mt-1">
                           {format(parseISO(app.booking_date), "MMM", { locale: pt })}
                         </span>
                         <span className="text-xs opacity-75 mt-2 font-light">
                           {format(parseISO(app.booking_date), "yyyy")}
                         </span>
                      </div>

                      {/* Conteúdo Principal */}
                      <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={app.status} />
                            <span className="text-xs text-gray-400 font-mono uppercase">#{app.id.slice(0,6)}</span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors" style={{fontFamily: "'Playfair Display', serif"}}>
                            {app.service_name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[var(--primary)]" /> 
                              {app.booking_time} ({app.duration_minutes || 60} min)
                            </p>
                            <p className="flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-[var(--primary)]" /> 
                              Profissional: <span className="font-medium">{app.professional_name || "Ingrid"}</span>
                            </p>
                          </div>
                        </div>

                        {/* Botão Cancelar */}
                        {app.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs mt-2 md:mt-0"
                            onClick={() => {
                              if(confirm("Tem a certeza que deseja cancelar este agendamento?")) cancelMutation.mutate(app.id);
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* HISTÓRICO */}
        {([...past, ...cancelled].length > 0) && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-500 pl-3">
              <History className="w-5 h-5" /> Histórico
            </h2>
            <div className="grid gap-3 opacity-80 hover:opacity-100 transition-opacity">
              {[...past, ...cancelled].map((app) => (
                <Card key={app.id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 border border-gray-100 hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{app.service_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(app.booking_date), "dd 'de' MMMM, yyyy", { locale: pt })} às {app.booking_time}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}