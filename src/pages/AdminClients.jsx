import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Edit, Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

export default function AdminClients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [editData, setEditData] = useState({});

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.User.list('-created_date'),
  });

  const { data: bookings = [] } = useQuery({
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
  });

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientBookings = (clientEmail) => {
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

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Clientes (CRM)</h1>
          <p className="text-gray-400">Histórico e preferências de cada cliente</p>
        </div>

        {/* Search */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar clientes por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </Card>

        {/* Clients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const clientBookings = getClientBookings(client.email);
            const completedBookings = clientBookings.filter(b => b.status === 'completed');

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-gray-800 border-gray-700 p-6 hover:border-red-600 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {client.full_name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{client.full_name}</h3>
                        <p className="text-xs text-gray-400">{client.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedClient(client);
                        setEditData({
                          phone: client.phone || '',
                          preferences: client.preferences || '',
                          allergies: client.allergies || ''
                        });
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{completedBookings.length}</p>
                      <p className="text-xs text-gray-400">Visitas</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{clientBookings.length}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>

                  {client.preferences && (
                    <div className="bg-gray-900 p-3 rounded-lg mb-3">
                      <p className="text-xs text-gray-400 mb-1">Preferências</p>
                      <p className="text-sm text-gray-300">{client.preferences}</p>
                    </div>
                  )}

                  {client.allergies && (
                    <div className="bg-red-900/20 p-3 rounded-lg border border-red-800">
                      <p className="text-xs text-red-400 mb-1">⚠️ Alergias</p>
                      <p className="text-sm text-red-300">{client.allergies}</p>
                    </div>
                  )}

                  {completedBookings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Última Visita</p>
                      <p className="text-sm text-white">
                        {format(new Date(completedBookings[0].booking_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum cliente encontrado</p>
          </Card>
        )}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="bg-gray-600 border-gray-700 text-white">
          {/* ... */}
             <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400">Email</p><Input readOnly value={selectedClient?.email || ''} className="bg-gray-700 border-gray-600 text-white" /></div>
                <div><p className="text-xs text-gray-400">Telefone</p><Input readOnly value={selectedClient?.phone || ''} className="bg-gray-700 border-gray-600 text-white" /></div>
             </div>
          {/* ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
}