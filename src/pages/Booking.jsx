import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes, parse, isBefore, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service_id: "",
    professional_id: "prof-1",
    booking_date: null,
    booking_time: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    notes: ""
  });
  const [success, setSuccess] = useState(false);
  const { user, openLogin } = useAuth();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.Service.filter({ is_active: true }, 'name') });
  const { data: professionals = [] } = useQuery({ queryKey: ['professionals'], queryFn: () => base44.entities.Professional.filter({ is_active: true }, 'name') });

  useEffect(() => { if (professionals.length > 0) setFormData(prev => ({ ...prev, professional_id: professionals[0].id })); }, [professionals]);

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-for-calendar', formData.professional_id, formData.booking_date],
    queryFn: () => {
      if (!formData.professional_id || !formData.booking_date) return [];
      return base44.entities.Booking.filter({ 
        professional_id: formData.professional_id,
        booking_date: format(formData.booking_date, 'yyyy-MM-dd'),
        status: { $in: ['pending', 'confirmed'] }
      });
    },
    enabled: !!formData.professional_id && !!formData.booking_date,
  });

  const { data: blockedSlots = [] } = useQuery({
    queryKey: ['blocked-slots-booking', formData.professional_id, formData.booking_date],
    queryFn: () => {
      if (!formData.professional_id || !formData.booking_date) return [];
      return base44.entities.BlockedSlot.filter({
        professional_id: formData.professional_id,
        date: format(formData.booking_date, 'yyyy-MM-dd')
      });
    },
    enabled: !!formData.professional_id && !!formData.booking_date,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const booking = await base44.entities.Booking.create(bookingData);
      await base44.entities.Notification.create({
        user_id: 'prof-1', type: 'info', title: 'Novo Pedido de Agendamento',
        message: `${bookingData.client_name} - ${bookingData.service_name} - ${format(new Date(bookingData.booking_date), 'dd/MM')} às ${bookingData.booking_time}.`,
        read: false, created_at: new Date().toISOString()
      });
      return booking;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings-for-calendar'] }); setSuccess(true); },
  });

  const selectedService = services.find(s => s.id === formData.service_id);
  const selectedProfessional = professionals.find(p => p.id === formData.professional_id);

  // --- SOLUÇÃO MATEMÁTICA PARA FUSO HORÁRIO ---
  // Adiciona 12 horas ao timestamp puro para garantir que caímos no meio do dia correto
  // independente se o navegador puxou para 21:00 do dia anterior ou 00:00 do dia atual.
  const getSafeDayKey = (date) => {
    if (!date) return null;
    const safeTimestamp = date.getTime() + (12 * 60 * 60 * 1000); // +12 horas
    const safeDate = new Date(safeTimestamp);
    
    const dayIndex = safeDate.getDay(); // 0 = Domingo, 1 = Segunda...
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayKeys[dayIndex];
  };

  const isDayDisabled = (date) => {
    // 1. Bloqueia dias passados (Ontem para trás)
    if (isBefore(date, startOfDay(new Date()))) return true;
    
    // 2. Verifica configuração usando a chave SEGURA
    const dayKey = getSafeDayKey(date);
    const workingHours = selectedProfessional?.working_hours?.[dayKey];
    
    // Se não tiver configuração ou active for false, bloqueia
    return !workingHours || !workingHours.active;
  };

  const generateTimeSlots = () => {
    if (!formData.booking_date || !selectedProfessional || !selectedService) return [];
    
    const slots = [];
    
    // Usa a mesma função segura para obter a chave do dia
    const dayKey = getSafeDayKey(formData.booking_date);
    const workingHours = selectedProfessional.working_hours?.[dayKey];
    
    // Dupla verificação: se o dia estiver desativado no Admin, não gera horários
    if (!workingHours?.active) return [];
    
    const [startHour, startMin] = (workingHours.start || "10:00").split(':').map(Number);
    const [endHour, endMin] = (workingHours.end || "18:00").split(':').map(Number);
    
    let current = new Date(formData.booking_date);
    current.setHours(startHour, startMin, 0, 0);
    
    const endOfDay = new Date(formData.booking_date);
    endOfDay.setHours(endHour, endMin, 0, 0);

    const now = new Date();
    // Verifica se é HOJE comparando a data segura
    const safeDate = new Date(formData.booking_date.getTime() + (12 * 60 * 60 * 1000));
    const isToday = 
      safeDate.getDate() === now.getDate() &&
      safeDate.getMonth() === now.getMonth() &&
      safeDate.getFullYear() === now.getFullYear();

    const serviceDuration = selectedService.duration_minutes || 60;

    while (current < endOfDay) {
      const slotStart = new Date(current);
      const slotEnd = addMinutes(slotStart, serviceDuration);

      if (slotEnd > endOfDay) break;

      const timeStr = format(slotStart, 'HH:mm');
      let isAvailable = true;

      // 1. Bloqueia horário passado (apenas se for Hoje)
      if (isToday && isBefore(slotStart, now)) {
        isAvailable = false;
      }

      // 2. Colisão com Agendamentos
      if (isAvailable) {
        const slotTimeStart = slotStart.getTime();
        for (const booking of bookings) {
          const bookingStart = parse(`${booking.booking_date} ${booking.booking_time}`, 'yyyy-MM-dd HH:mm', new Date()).getTime();
          const bookingEnd = addMinutes(bookingStart, booking.duration_minutes || 60).getTime();
          if (slotTimeStart >= bookingStart && slotTimeStart < bookingEnd) {
            isAvailable = false;
            break;
          }
        }
      }

      // 3. Colisão com Bloqueios Manuais
      if (isAvailable) {
        const slotTimeStart = slotStart.getTime();
        for (const block of blockedSlots) {
          const blockStart = parse(`${block.date} ${block.start_time}`, 'yyyy-MM-dd HH:mm', new Date()).getTime();
          const blockEnd = parse(`${block.date} ${block.end_time}`, 'yyyy-MM-dd HH:mm', new Date()).getTime();
          if (slotTimeStart >= blockStart && slotTimeStart < blockEnd) {
            isAvailable = false;
            break;
          }
        }
      }

      slots.push({ time: timeStr, available: isAvailable });
      current = addMinutes(current, 30);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = () => {
    if (!user) { openLogin(() => {}); return; }
    const bookingData = {
      ...formData,
      client_name: formData.client_name || user.full_name,
      client_email: formData.client_email || user.email,
      booking_date: format(formData.booking_date, 'yyyy-MM-dd'),
      service_name: selectedService.name,
      professional_name: selectedProfessional?.name || "Ingrid",
      duration_minutes: selectedService.duration_minutes,
      status: 'pending'
    };
    createBookingMutation.mutate(bookingData);
  };

  useEffect(() => { if (user && step === 3) setFormData(prev => ({ ...prev, client_name: user.full_name, client_email: user.email })); }, [user, step]);

  if (success) {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "351915429170";
    const message = `Olá Ingrid! Sou a *${formData.client_name}*.\nFiz um agendamento pelo site:\n\n💇‍♀️ *Serviço:* ${selectedService?.name}\n📅 *Data:* ${format(formData.booking_date, "dd/MM/yyyy")}\n⏰ *Hora:* ${formData.booking_time}\n\nAguardo a confirmação!`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Pedido Recebido!</h2>
          <p className="text-gray-600 mb-8">O seu pedido foi registado. Para agilizar a confirmação, envie o comprovativo via WhatsApp:</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-600 hover:bg-green-700 w-full py-6 text-lg gap-2">Confirmar no WhatsApp</Button>
          </a>
          <Button variant="ghost" className="mt-4 text-gray-500" onClick={() => { setFormData(prev => ({ ...prev, booking_date: null, booking_time: "", notes: "" })); setStep(1); setSuccess(false); }}>Voltar ao Início</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* BANNER HERO */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src="img/ela5.png" 
          alt="Lusa Brasileira Banner" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 shadow-sm" style={{fontFamily: "'Playfair Display', serif"}}>
            Agende o Seu Momento
          </h1>
          <p className="text-lg md:text-xl font-light text-white/90">
            Escolha o serviço e o melhor horário para si
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-4 pb-12 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Indicador de Passos */}
          <Card className="mb-8 p-6 shadow-xl border-t-4 border-[var(--primary)]">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {s}
                    </div>
                    <span className="text-xs mt-2 text-gray-500 hidden sm:block font-medium">
                      {s === 1 && 'Serviço'} {s === 2 && 'Data/Hora'} {s === 3 && 'Seus Dados'}
                    </span>
                  </div>
                  {s < 3 && <div className={`h-0.5 w-8 sm:w-16 ${step > s ? 'bg-[var(--primary)]' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          </Card>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="p-8 shadow-lg">
                
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6" style={{color: 'var(--primary)'}} /> 
                      Qual serviço deseja realizar?
                    </h2>
                    <RadioGroup value={formData.service_id} onValueChange={(value) => setFormData({...formData, service_id: value})}>
                      <div className="space-y-3">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                            <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                            <Label htmlFor={service.id} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-lg">{service.name}</p>
                                  <p className="text-sm text-gray-500">{service.description}</p>
                                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                                    <Clock className="w-3 h-3 inline mr-1" /> {service.duration_minutes} min
                                  </p>
                                </div>
                                <p className="font-bold text-lg" style={{color: 'var(--primary)'}}>
                                  {service.price ? `€${service.price.toFixed(2)}` : 'Consultar'}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    <div className="flex justify-end mt-8">
                      <Button onClick={() => setStep(2)} disabled={!formData.service_id} style={{backgroundColor: 'var(--primary)'}}>
                        Continuar <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Clock className="w-6 h-6" style={{color: 'var(--primary)'}} /> 
                      Quando fica melhor para si?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <Label className="mb-3 block font-medium">Selecione a Data</Label>
                        <Calendar mode="single" selected={formData.booking_date} onSelect={(date) => setFormData({...formData, booking_date: date, booking_time: ""})} disabled={isDayDisabled} locale={pt} className="border rounded-lg p-3" />
                      </div>
                      <div>
                        <Label className="mb-3 block font-medium">Horários Disponíveis</Label>
                        {formData.booking_date ? (
                          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot) => (
                                <Button 
                                  key={slot.time} 
                                  variant={formData.booking_time === slot.time ? "default" : "outline"} 
                                  onClick={() => slot.available && setFormData({...formData, booking_time: slot.time})} 
                                  disabled={!slot.available} 
                                  className={`${formData.booking_time === slot.time ? "bg-[var(--primary)] text-white" : ""} ${!slot.available ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 line-through decoration-gray-400" : "hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}
                                >
                                  {slot.time}
                                </Button>
                              ))
                            ) : (
                              <p className="col-span-3 text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                                Sem horários livres neste dia.<br/><span className="text-xs">Tente outra data.</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            Por favor, escolha uma data no calendário ao lado.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!formData.booking_date || !formData.booking_time} style={{backgroundColor: 'var(--primary)'}}>
                        Continuar <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <User className="w-6 h-6" style={{color: 'var(--primary)'}} /> 
                      Seus Dados de Contacto
                    </h2>
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label>Nome Completo *</Label>
                        <Input value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label>Telefone / WhatsApp *</Label>
                        <Input type="tel" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label>Observação</Label>
                        <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1" />
                      </div>
                    </div>
                    <Alert className="mb-6 bg-[var(--primary)]/10 border-[var(--primary)]/20">
                      <AlertDescription className="text-gray-800 font-medium">
                        <p>Resumo: {selectedService?.name}</p>
                        <p>{format(formData.booking_date, "dd 'de' MMMM", { locale: pt })} às {formData.booking_time}</p>
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                      </Button>
                      <Button onClick={handleSubmit} disabled={!formData.client_name || !formData.client_email || !formData.client_phone || createBookingMutation.isPending} style={{backgroundColor: 'var(--primary)'}} className="w-full sm:w-auto">
                        {createBookingMutation.isPending ? 'A Enviar...' : 'Confirmar Agendamento'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}