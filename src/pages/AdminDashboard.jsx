import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Users, DollarSign, TrendingUp, Clock, 
  CheckCircle, XCircle, AlertCircle, ArrowRight, Image as ImageIcon 
} from "lucide-react";
import { format, parseISO, isSameMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils"; // Importei a função para corrigir os links

export default function AdminDashboard() {
  // 1. Buscar Agendamentos
  const { data: bookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.Booking.list('-booking_date'),
  });

  // 2. Buscar Serviços
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  // 3. Buscar Clientes
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.User.list(),
  });

  // --- CÁLCULOS ---
  const now = new Date();

  // Agendamentos deste mês
  const thisMonthBookings = bookings.filter(b => {
    if (!b.booking_date) return false;
    const bookingDate = parseISO(b.booking_date);
    return isSameMonth(bookingDate, now);
  });

  // Contagens
  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;

  // Faturação Estimada
  const monthlyRevenue = thisMonthBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((total, booking) => {
      const service = services.find(s => s.id === booking.service_id || s.name === booking.service_name);
      return total + (service?.price || 0);
    }, 0);

  // Recentes (Top 5)
  const recentBookings = bookings.slice(0, 5);

  // Cores e Labels
  const statusColors = {
    pending: 'bg-yellow-900/50 text-yellow-200 border border-yellow-800',
    confirmed: 'bg-green-900/50 text-green-200 border border-green-800',
    cancelled: 'bg-red-900/50 text-red-200 border border-red-800',
    completed: 'bg-blue-900/50 text-blue-200 border border-blue-800'
  };

  const statusLabels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Concluído'
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>Dashboard Administrativo</h1>
            <p className="text-gray-400">Visão geral do desempenho do salão em {format(now, 'MMMM', { locale: pt })}.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">{format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: pt })}</p>
          </div>
        </div>

        {/* 1. CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Faturação (Mês)</CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">€{monthlyRevenue.toFixed(0)}</div>
                <p className="text-xs text-gray-400 mt-2">Estimada</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pendentes</CardTitle>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{pending}</div>
                <p className="text-xs text-gray-400 mt-2">Aguardando confirmação</p>
                {pending > 0 && (
                  <Link to={createPageUrl("AdminBookings")} className="text-xs text-yellow-400 hover:underline mt-1 block">
                    Resolver agora →
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Agenda Mês</CardTitle>
                <Calendar className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{thisMonthBookings.length}</div>
                <p className="text-xs text-gray-400 mt-2">Total de marcações</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Clientes</CardTitle>
                <Users className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{clients.length}</div>
                <p className="text-xs text-gray-400 mt-2">Registados no sistema</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 2. ÁREA PRINCIPAL */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-white">Últimos Agendamentos</CardTitle>
                <Link to={createPageUrl("AdminBookings")}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Ver Todos</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-800 p-2 rounded text-center min-w-[50px]">
                            <span className="block text-xs text-gray-400">{booking.booking_date ? format(parseISO(booking.booking_date), "dd/MM") : '--'}</span>
                            <span className="block text-sm font-bold text-white">{booking.booking_time}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{booking.client_name}</p>
                          <p className="text-sm text-gray-400">{booking.service_name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Nenhum agendamento ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--primary)]" /> Top Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {services.slice(0, 6).map((service) => {
                    const count = bookings.filter(b => b.service_id === service.id || b.service_name === service.name).length;
                    const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                    
                    return (
                      <div key={service.id}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">{service.name}</p>
                          <p className="text-xs text-gray-400">{count} pedidos</p>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[var(--primary)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. AÇÕES RÁPIDAS (LINKS CORRIGIDOS COM createPageUrl) */}
        <div>
           <h2 className="text-xl font-bold text-white mb-4">Acesso Rápido</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={createPageUrl("AdminAgenda")}>
                  <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
                      <CardContent className="p-6 flex items-center gap-4">
                          <div className="p-3 bg-blue-900/30 text-blue-400 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">Gerir Agenda</h3>
                              <p className="text-xs text-gray-400">Ver calendário completo</p>
                          </div>
                          <ArrowRight className="ml-auto w-5 h-5 text-gray-600 group-hover:text-white" />
                      </CardContent>
                  </Card>
              </Link>

              <Link to={createPageUrl("AdminGallery")}>
                  <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
                      <CardContent className="p-6 flex items-center gap-4">
                          <div className="p-3 bg-pink-900/30 text-pink-400 rounded-full group-hover:bg-pink-600 group-hover:text-white transition-colors">
                              <ImageIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">Atualizar Galeria</h3>
                              <p className="text-xs text-gray-400">Adicionar novas fotos</p>
                          </div>
                          <ArrowRight className="ml-auto w-5 h-5 text-gray-600 group-hover:text-white" />
                      </CardContent>
                  </Card>
              </Link>

              <Link to={createPageUrl("AdminServices")}>
                  <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
                      <CardContent className="p-6 flex items-center gap-4">
                          <div className="p-3 bg-purple-900/30 text-purple-400 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <Clock className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">Editar Serviços</h3>
                              <p className="text-xs text-gray-400">Preços e durações</p>
                          </div>
                          <ArrowRight className="ml-auto w-5 h-5 text-gray-600 group-hover:text-white" />
                      </CardContent>
                  </Card>
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}