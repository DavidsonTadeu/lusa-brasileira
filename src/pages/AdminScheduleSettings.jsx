import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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

  // 2. CORREÇÃO: Em vez de usar useState (que trava os dados antigos),
  // pegamos sempre o primeiro profissional da lista atualizada.
  const selectedProfessional = professionals.length > 0 ? professionals[0] : null;

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
      // Isso força o React a baixar os dados novos e atualizar a tela
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
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedSlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-slots'] });
    },
  });

  const handleWorkingHoursChange = (day, field, value) => {
    if (!selectedProfessional) return;

    // Cria uma cópia profunda dos horários para enviar
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
    if (!selectedProfessional || !blockFormData.date) return;

    createBlockMutation.mutate({
      professional_id: selectedProfessional.id,
      date: format(blockFormData.date, 'yyyy-MM-dd'),
      start_time: blockFormData.start_time,
      end_time: blockFormData.end_time,
      reason: blockFormData.reason,
      is_recurring: blockFormData.is_recurring
    });
  };

  if (isLoading) return <div className="p-8 text-white">A carregar...</div>;
  if (!selectedProfessional) return <div className="p-8 text-white">Nenhum perfil profissional encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Horários</h1>
          <p className="text-gray-400">Defina sua disponibilidade semanal e folgas</p>
        </div>

        <Tabs defaultValue="working-hours" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="working-hours" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Horário de Trabalho
            </TabsTrigger>
            <TabsTrigger value="blocked-slots" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Bloqueios / Folgas
            </TabsTrigger>
          </TabsList>

          {/* Working Hours */}
          <TabsContent value="working-hours">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Horário de Trabalho Semanal</h3>
              <div className="space-y-4">
                {daysOfWeek.map(({ key, label }) => {
                  const dayHours = selectedProfessional.working_hours?.[key] || { 
                    start: "09:00", 
                    end: "18:00", 
                    active: true 
                  };
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <Switch
                          checked={!!dayHours.active}
                          onCheckedChange={(checked) => handleWorkingHoursChange(key, 'active', checked)}
                        />
                        <span className={dayHours.active ? "text-white font-medium" : "text-gray-500"}>
                          {label}
                        </span>
                      </div>
                      
                      {dayHours.active ? (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-gray-400 text-sm">Início:</Label>
                            <Input
                              type="time"
                              value={dayHours.start}
                              onChange={(e) => handleWorkingHoursChange(key, 'start', e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white w-32 focus:border-[var(--primary)]"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label className="text-gray-400 text-sm">Fim:</Label>
                            <Input
                              type="time"
                              value={dayHours.end}
                              onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white w-32 focus:border-[var(--primary)]"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Dia de folga</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Blocked Slots */}
          <TabsContent value="blocked-slots">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Horários Bloqueados Específicos</h3>
                  <Button
                    onClick={() => setIsBlockDialogOpen(true)}
                    style={{backgroundColor: 'var(--primary)'}}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Bloqueio
                  </Button>
                </div>

                <div className="space-y-3">
                  {blockedSlots.map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">
                            {format(new Date(slot.date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                          </span>
                          {slot.is_recurring && (
                            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                          {slot.reason && (
                            <>
                              <span>•</span>
                              <span>{slot.reason}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteBlockMutation.mutate(slot.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                  
                  {blockedSlots.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum bloqueio extra cadastrado (Férias, feriados, etc).</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader><DialogTitle>Bloquear Horário</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300 mb-3 block">Selecionar Data</Label>
              <Calendar mode="single" selected={blockFormData.date} onSelect={(date) => setBlockFormData({...blockFormData, date})} locale={pt} className="bg-gray-700 rounded-lg border-gray-600 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-300">Início</Label><Input type="time" value={blockFormData.start_time} onChange={(e) => setBlockFormData({...blockFormData, start_time: e.target.value})} className="bg-gray-700 border-gray-600 text-white mt-2" /></div>
              <div><Label className="text-gray-300">Fim</Label><Input type="time" value={blockFormData.end_time} onChange={(e) => setBlockFormData({...blockFormData, end_time: e.target.value})} className="bg-gray-700 border-gray-600 text-white mt-2" /></div>
            </div>
            <div><Label className="text-gray-300">Motivo</Label><Input value={blockFormData.reason} onChange={(e) => setBlockFormData({...blockFormData, reason: e.target.value})} className="bg-gray-700 border-gray-600 text-white mt-2" /></div>
            <div className="flex justify-between"><Label className="text-gray-300">Recorrente</Label><Switch checked={blockFormData.is_recurring} onCheckedChange={(c) => setBlockFormData({...blockFormData, is_recurring: c})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)} className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancelar</Button>
            <Button onClick={handleCreateBlock} style={{backgroundColor: 'var(--primary)'}}>Criar Bloqueio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}