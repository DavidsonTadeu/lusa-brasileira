import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Edit, Calendar, Mail, Phone, Loader2, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

export default function AdminClients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [editData, setEditData] = useState({});

  const queryClient = useQueryClient();

  // 1. Buscar Clientes
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  // 2. Buscar TODOS os agendamentos para calcular histórico
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['all-bookings-for-clients'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(null);
      setEditData({});
    },
    onError: (err) => alert("Erro ao atualizar cliente: " + err.message)
  });

  // Filtragem local
  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientBookings = (clientEmail) => {
    if (!clientEmail) return [];
    return bookings.filter(b => b.client_email === clientEmail);
  };

  const handleEditClient = () => {
    if (selectedClient) {
      updateClientMutation.mutate({
        id: selectedClient.id,
        data: editData
      });
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditData({
      phone: client.phone || '',
      preferences: client.preferences || '',
      allergies: client.allergies || ''
    });
  };

  if (loadingClients || loadingBookings) {
      return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white mb-2">Gestão de Clientes</h1>
            <p className="text-gray-400">Histórico, preferências e fichas técnicas.</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-400">
             Total: <strong className="text-white">{clients.length}</strong> clientes
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-gray-800 border-gray-700 p-4 mb-8 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-[var(--primary)] h-12"
            />
          </div>
        </Card>

        {/* Clients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const clientBookings = getClientBookings(client.email);
            const completedBookings = clientBookings.filter(b => b.status === 'completed');
            const lastBooking = completedBookings.length > 0 ? completedBookings[0] : null;

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
              >
                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-[var(--primary)] transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col">
                  
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center shadow-inner">
                        <span className="text-white font-bold text-lg">
                          {client.full_name?.[0]?.toUpperCase() || <Users className="w-6 h-6 text-gray-500" />}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{client.full_name || "Sem Nome"}</h3>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-900 text-gray-400 border border-gray-700 mt-1">
                           {client.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditModal(client)}
                      className="text-gray-500 hover:text-white hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Detalhes de Contato */}
                  <div className="space-y-2 mb-6 text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span className="truncate" title={client.email}>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{client.phone || "Sem telefone"}</span>
                    </div>
                  </div>

                  {/* Estatísticas Rápidas */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-700">
                      <p className="text-xl font-bold text-white">{completedBookings.length}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Visitas</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-700">
                      <p className="text-xl font-bold text-white">{clientBookings.length}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Agendamentos</p>
                    </div>
                  </div>

                  {/* Notas Importantes */}
                  <div className="flex-1 space-y-2">
                      {client.allergies && (
                        <div className="bg-red-900/10 p-2 rounded border border-red-900/30 flex gap-2 items-start">
                           <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                           <div>
                              <p className="text-[10px] font-bold text-red-400 uppercase">Alergias</p>
                              <p className="text-xs text-red-300 line-clamp-2">{client.allergies}</p>
                           </div>
                        </div>
                      )}
                      
                      {client.preferences && (
                         <div className="p-2 rounded bg-gray-900 border border-gray-700">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Preferências</p>
                            <p className="text-xs text-gray-300 line-clamp-2">{client.preferences}</p>
                         </div>
                      )}
                  </div>

                  {/* Rodapé: Última Visita */}
                  {lastBooking && (
                    <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs">
                      <span className="text-gray-500">Última visita:</span>
                      <span className="text-white font-medium bg-gray-700 px-2 py-0.5 rounded">
                        {format(new Date(lastBooking.booking_date), "dd MMM yyyy", { locale: pt })}
                      </span>
                    </div>
                  )}

                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Nenhum cliente encontrado.</p>
            <p className="text-gray-600 text-sm">Tente pesquisar por outro termo.</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-serif">Editar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
             {/* Info Fixa */}
             <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
                   <p className="text-white font-medium">{selectedClient?.full_name}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-gray-500 uppercase font-bold">Email (Login)</p>
                   <p className="text-white font-medium text-sm">{selectedClient?.email}</p>
                </div>
             </div>

             {/* Campos Editáveis */}
             <div className="space-y-4">
                <div>
                   <Label className="text-gray-300">Telefone</Label>
                   <Input 
                     value={editData.phone}
                     onChange={(e) => setEditData({...editData, phone: e.target.value})}
                     className="bg-gray-900 border-gray-600 text-white mt-1 focus:border-[var(--primary)]"
                     placeholder="+351 ..."
                   />
                </div>

                <div>
                   <Label className="text-gray-300">Alergias / Restrições</Label>
                   <Textarea 
                     value={editData.allergies}
                     onChange={(e) => setEditData({...editData, allergies: e.target.value})}
                     className="bg-red-900/10 border-red-900/30 text-white mt-1 min-h-[60px] focus:border-red-500 placeholder:text-red-900/50"
                     placeholder="Ex: Alergia a amônia, pele sensível..."
                   />
                </div>

                <div>
                   <Label className="text-gray-300">Preferências & Notas</Label>
                   <Textarea 
                     value={editData.preferences}
                     onChange={(e) => setEditData({...editData, preferences: e.target.value})}
                     className="bg-gray-900 border-gray-600 text-white mt-1 min-h-[100px] focus:border-[var(--primary)]"
                     placeholder="Ex: Gosta de café sem açúcar, prefere corte a seco..."
                   />
                </div>
             </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSelectedClient(null)} className="hover:bg-gray-700 text-gray-400 hover:text-white">Cancelar</Button>
            <Button onClick={handleEditClient} className="bg-[var(--primary)] hover:bg-red-700 text-white font-bold">
               {updateClientMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
               Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}