import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mail, Phone, Calendar, Trash2, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const queryClient = useQueryClient();

  // Busca mensagens ordenadas por data (mais recentes primeiro)
  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const data = await base44.entities.ContactMessage.list();
      // Ordenação manual para garantir segurança
      return data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },
  });

  // Marcar como lida / Atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactMessage.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
  });

  // Apagar mensagem
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      setSelectedMessage(null);
    },
  });

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      updateStatusMutation.mutate({ id: msg.id, status: 'read' });
    }
  };

  // Função segura para formatar data
  const formatDateSafe = (dateString) => {
    try {
      if (!dateString) return "Data desconhecida";
      return format(new Date(dateString), "dd 'de' MMM 'às' HH:mm", { locale: pt });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mensagens de Contacto</h1>
          <p className="text-gray-400">Gerir dúvidas e contactos recebidos pelo site</p>
        </div>

        <div className="grid gap-4">
          {messages.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-12 text-center">
              <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhuma mensagem recebida.</p>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card 
                key={msg.id} 
                className={`p-6 border transition-colors cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  msg.status === 'new' 
                    ? 'bg-gray-800 border-[var(--primary)] border-l-4' 
                    : 'bg-gray-800 border-gray-700 opacity-80 hover:opacity-100'
                }`}
                onClick={() => handleOpenMessage(msg)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {msg.status === 'new' && (
                      <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-xs font-bold rounded animate-pulse">
                        NOVA
                      </span>
                    )}
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateSafe(msg.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white truncate">{msg.name || "Sem Nome"}</h3>
                  <p className="text-gray-400 text-sm truncate">{msg.email || "Sem Email"}</p>
                  <p className="text-gray-300 mt-2 line-clamp-1 italic">"{msg.message || "..."}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Ver
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Leitura (Com cores corrigidas) */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-gray-600 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--primary)]" />
              Mensagem de {selectedMessage?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/80 p-3 rounded border border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Email</p>
                  <p className="text-white break-all">{selectedMessage.email}</p>
                </div>
                <div className="bg-gray-700/80 p-3 rounded border border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Telefone</p>
                  <p className="text-white">{selectedMessage.phone || "Não informado"}</p>
                </div>
              </div>

              <div className="bg-gray-700/80 p-4 rounded border border-gray-600">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Conteúdo da Mensagem</p>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <p className="text-xs text-right text-gray-500">
                Recebida em: {formatDateSafe(selectedMessage.created_at)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(selectedMessage.id)}
              className="bg-red-600 hover:bg-red-700 border-none text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Apagar Mensagem
            </Button>
            <Button 
              onClick={() => setSelectedMessage(null)} 
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-500"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}