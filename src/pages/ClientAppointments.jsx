import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, XCircle, CheckCircle } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['my-appointments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allBookings = await base44.entities.Booking.filter({ client_email: user.email });
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

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    const labels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Concluído"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    // SEM <Layout> AQUI - ISSO REMOVE O RODAPÉ DUPLO
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Meus Agendamentos</h1>
          
          <Link 
            to={createPageUrl("Booking")} 
            onClick={() => window.scrollTo(0, 0)}
          >
            <Button style={{backgroundColor: 'var(--primary)'}}>
              Novo Agendamento
            </Button>
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-[var(--primary)]" /> Próximos
          </h2>
          {upcoming.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 bg-white border-dashed">
              Não tem agendamentos futuros.
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((app) => (
                <Card key={app.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{app.service_name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(parseISO(app.booking_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                      <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {app.booking_time}</p>
                      <p className="flex items-center gap-2"><Scissors className="w-4 h-4" /> Com: {app.professional_name || "Ingrid"}</p>
                    </div>
                  </div>
                  {app.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full md:w-auto"
                      onClick={() => {
                        if(confirm("Tem a certeza que deseja cancelar?")) cancelMutation.mutate(app.id);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-gray-400" /> Histórico
          </h2>
          <div className="grid gap-4 opacity-75">
            {[...past, ...cancelled].map((app) => (
              <Card key={app.id} className="p-4 flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{app.service_name}</p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(app.booking_date), "dd/MM/yyyy", { locale: pt })} às {app.booking_time}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </Card>
            ))}
            {past.length === 0 && cancelled.length === 0 && (
               <p className="text-gray-500 text-sm">Nenhum histórico disponível.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}