import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Plus, Trash2, Calendar as CalendarIcon, Loader2, XCircle } from "lucide-react";
import { format, parse } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function AdminScheduleSettings() {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockFormData, setBlockFormData] = useState({
    date: null,
    start_time: "09:00",
    end_time: "10:00",
    reason: "",
    is_recurring: false
  });

  const queryClient = useQueryClient();

  // 1. Busca a lista de profissionais
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals-schedule'],
    queryFn: () => base44.entities.Professional.filter({ is_active: true }),
  });

  // Pega o primeiro profissional (Ingrid)
  const selectedProfessional = professionals.length > 0 ? professionals[0] : null;

  // Busca bloqueios existentes
  const { data: blockedSlots = [] } = useQuery({
    queryKey: ['blocked-slots', selectedProfessional?.id],
    queryFn: () => {
      if (!selectedProfessional) return [];
      return base44.entities.BlockedSlot.filter({ professional_id: selectedProfessional.id }, '-date');
    },
    enabled: !!selectedProfessional
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Professional.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals-schedule'] });
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: (data) => base44.entities.BlockedSlot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-slots'] });
      setIsBlockDialogOpen(false);
      setBlockFormData({
        date: null,
        start_time: "09:00",
        end_time: "10:00",
        reason: "",
        is_recurring: false
      });
    },
    onError: (err) => alert("Erro ao criar bloqueio: " + err.message)
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedSlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-slots'] });
    },
  });

  const handleWorkingHoursChange = (day, field, value) => {
    if (!selectedProfessional) return;

    const updatedHours = {
      ...selectedProfessional.working_hours,
      [day]: {
        ...(selectedProfessional.working_hours?.[day] || {}),
        [field]: value
      }
    };

    updateProfessionalMutation.mutate({
      id: selectedProfessional.id,
      data: { working_hours: updatedHours }
    });
  };

  const handleCreateBlock = () => {
    if (!selectedProfessional || !blockFormData.date) return alert("Selecione uma data.");

    createBlockMutation.mutate({
      professional_id: selectedProfessional.id,
      date: format(blockFormData.date, 'yyyy-MM-dd'),
      start_time: blockFormData.start_time,
      end_time: blockFormData.end_time,
      reason: blockFormData.reason,
      // is_recurring: blockFormData.is_recurring // Só envie se tiver a coluna no banco
    });
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-white" /></div>;
  if (!selectedProfessional) return <div className="p-8 text-white">Nenhum perfil profissional encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-white mb-2">Configuração de Horários</h1>
          <p className="text-gray-400">Defina a sua disponibilidade semanal padrão e dias de folga.</p>
        </div>

        <Tabs defaultValue="working-hours" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700 p-1">
            <TabsTrigger value="working-hours" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              Horário Semanal
            </TabsTrigger>
            <TabsTrigger value="blocked-slots" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400">
              Bloqueios & Feriados
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HORÁRIO DE TRABALHO */}
          <TabsContent value="working-hours">
            <Card className="bg-gray-800 border-gray-700 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                 <h3 className="text-xl font-bold text-white">Horário Padrão</h3>
                 <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                    Salvamento Automático
                 </span>
              </div>
              
              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => {
                  const dayHours = selectedProfessional.working_hours?.[key] || { 
                    start: "09:00", 
                    end: "18:00", 
                    active: true 
                  };
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border transition-colors ${dayHours.active ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-900/20 border-gray-800 opacity-60'}`}
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <Switch
                          checked={!!dayHours.active}
                          onCheckedChange={(checked) => handleWorkingHoursChange(key, 'active', checked)}
                          className="data-[state=checked]:bg-[var(--primary)]"
                        />
                        <span className={dayHours.active ? "text-white font-medium" : "text-gray-500"}>
                          {label}
                        </span>
                      </div>
                      
                      {dayHours.active ? (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs uppercase font-bold">Das</span>
                            <Input
                              type="time"
                              value={dayHours.start}
                              onChange={(e) => handleWorkingHoursChange(key, 'start', e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white w-32 focus:border-[var(--primary)] [color-scheme:dark]"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs uppercase font-bold">Até</span>
                            <Input
                              type="time"
                              value={dayHours.end}
                              onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white w-32 focus:border-[var(--primary)] [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-sm italic flex items-center gap-2">
                           <XCircle className="w-4 h-4" /> Dia de descanso (Fechado)
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: BLOQUEIOS */}
          <TabsContent value="blocked-slots">
            <Card className="bg-gray-800 border-gray-700 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Bloqueios Específicos</h3>
                  <p className="text-gray-400 text-sm">Adicione feriados, férias ou ausências pontuais.</p>
                </div>
                <Button
                  onClick={() => setIsBlockDialogOpen(true)}
                  className="bg-[var(--primary)] text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Bloqueio
                </Button>
              </div>

              <div className="space-y-3">
                {blockedSlots.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/30">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 font-medium">Nenhum bloqueio extra cadastrado.</p>
                      <p className="text-gray-600 text-sm">Sua agenda seguirá o horário padrão.</p>
                    </div>
                ) : (
                  blockedSlots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 bg-gray-800 rounded text-gray-400">
                             <CalendarIcon className="w-4 h-4" />
                          </div>
                          <div>
                              <p className="text-white font-bold capitalize">
                                {format(new Date(slot.date), "dd 'de' MMMM, yyyy", { locale: pt })}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium">
                                <Clock className="w-3 h-3" />
                                <span>{slot.start_time} - {slot.end_time}</span>
                              </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                          {slot.reason && (
                            <span className="hidden md:inline-block px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                              {slot.reason}
                            </span>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteBlockMutation.mutate(slot.id)}
                            className="text-gray-500 hover:text-red-500 hover:bg-red-900/20"
                            title="Remover Bloqueio"
                          >
                            {deleteBlockMutation.isPending && deleteBlockMutation.variables === slot.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG DE CRIAR BLOQUEIO - CORRIGIDO AQUI */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Bloquear Horário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
               <Label className="text-gray-300 mb-2 block">Selecionar Data</Label>
               {/* SUBSTITUIÇÃO PELO INPUT NATIVO COM ESTILO DARK */}
               <input 
                  type="date"
                  value={blockFormData.date ? format(blockFormData.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const d = e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : null;
                    setBlockFormData({...blockFormData, date: d});
                  }}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded p-2.5 [color-scheme:dark] focus:border-[var(--primary)] outline-none cursor-pointer"
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Início</Label>
                <Input 
                  type="time" 
                  value={blockFormData.start_time} 
                  onChange={(e) => setBlockFormData({...blockFormData, start_time: e.target.value})} 
                  className="bg-gray-700 border-gray-600 text-white mt-2 [color-scheme:dark]" 
                />
              </div>
              <div>
                <Label className="text-gray-300">Fim</Label>
                <Input 
                  type="time" 
                  value={blockFormData.end_time} 
                  onChange={(e) => setBlockFormData({...blockFormData, end_time: e.target.value})} 
                  className="bg-gray-700 border-gray-600 text-white mt-2 [color-scheme:dark]" 
                />
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300">Motivo (Opcional)</Label>
              <Input 
                value={blockFormData.reason} 
                onChange={(e) => setBlockFormData({...blockFormData, reason: e.target.value})} 
                placeholder="Ex: Consulta médica, Feriado..."
                className="bg-gray-700 border-gray-600 text-white mt-2" 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBlockDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-gray-700">Cancelar</Button>
            <Button onClick={handleCreateBlock} className="bg-[var(--primary)] text-white hover:opacity-90">
                {createBlockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Bloqueio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}