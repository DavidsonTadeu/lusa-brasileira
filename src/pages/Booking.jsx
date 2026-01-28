import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom"; 
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
import { CheckCircle, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Clock, User, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes, parse, isBefore, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
// --- IMPORTANTE: Importar o EmailJS ---
import emailjs from '@emailjs/browser';

export default function Booking() {
  const [searchParams] = useSearchParams(); 
  const serviceIdFromUrl = searchParams.get("serviceId"); 

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
  const [hasAutoSelected, setHasAutoSelected] = useState(false); 

  const { user, openLogin } = useAuth();
  const queryClient = useQueryClient();

  // --- CONFIGURAÇÃO DO EMAILJS (PREENCHA AQUI) ---
  // Dica: O ideal é colocar isso no arquivo .env, mas pode por aqui para testar rápido
  const EMAILJS_SERVICE_ID = "service_jykuowu";   // Ex: service_x9d8...
  const EMAILJS_TEMPLATE_ID = "template_dzb0sgy"; // Ex: template_a4b...
  const EMAILJS_PUBLIC_KEY = "m_gwAkI--BCVkIsrO";   // Ex: 5A_sD9...

  const getMinutesFromTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const { data: services = [], isLoading: isLoadingServices } = useQuery({ 
    queryKey: ['services'], 
    queryFn: () => base44.entities.Service.filter({ is_active: true }, '*') 
  });
  
  const { data: professionals = [] } = useQuery({ 
    queryKey: ['professionals'], 
    queryFn: () => base44.entities.Professional.filter({ is_active: true }, 'name') 
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => { 
    if (professionals.length > 0 && !formData.professional_id) {
       setFormData(prev => ({ ...prev, professional_id: professionals[0].id })); 
    }
  }, [professionals]);

  useEffect(() => {
    if (serviceIdFromUrl && services.length > 0 && !hasAutoSelected) {
      const serviceExists = services.find(s => s.id === serviceIdFromUrl);
      if (serviceExists) {
        setFormData(prev => ({ ...prev, service_id: serviceIdFromUrl }));
        setStep(2);
        setHasAutoSelected(true);
      }
    }
  }, [serviceIdFromUrl, services, hasAutoSelected]);

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-for-calendar', formData.professional_id, formData.booking_date],
    queryFn: async () => {
      if (!formData.professional_id || !formData.booking_date) return [];
      const allBookings = await base44.entities.Booking.filter({ 
        professional_id: formData.professional_id,
        booking_date: format(formData.booking_date, 'yyyy-MM-dd')
      });
      return allBookings.filter(b => ['pending', 'confirmed'].includes(b.status));
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
      // 1. Cria no Banco de Dados
      const booking = await base44.entities.Booking.create(bookingData);
      
      // 2. Cria Notificação no Sininho (Supabase)
      try {
          const parts = bookingData.booking_date.split('-'); 
          const dateVisual = `${parts[2]}/${parts[1]}`; 
          await base44.entities.Notification.create({
            user_id: 'prof-1', 
            type: 'info', 
            title: 'Novo Pedido de Agendamento',
            message: `${bookingData.client_name} - ${bookingData.service_name} - ${dateVisual} às ${bookingData.booking_time}.`,
            read: false, 
            created_at: new Date().toISOString()
          });
      } catch (err) {
          console.warn("Erro ao criar notificação interna:", err);
      }

      // 3. Envia E-mail (EmailJS)
      try {
        const parts = bookingData.booking_date.split('-'); 
        const dateVisual = `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY

        const templateParams = {
            client_name: bookingData.client_name,
            client_phone: bookingData.client_phone,
            client_email: bookingData.client_email,
            service_name: bookingData.service_name,
            booking_date: dateVisual,
            booking_time: bookingData.booking_time,
            notes: bookingData.notes || "Sem observações"
        };

        // Verifica se as chaves foram preenchidas antes de tentar enviar
        if (EMAILJS_SERVICE_ID !== "service_jykuowu") {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );
            console.log("Email enviado com sucesso!");
        } else {
            console.warn("EmailJS não configurado. Adicione as chaves no código.");
        }
      } catch (emailErr) {
        console.error("Erro ao enviar email:", emailErr);
        // Não impedimos o sucesso do agendamento se o email falhar
      }

      return booking;
    },
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ['bookings-for-calendar'] }); 
        setSuccess(true); 
    },
    onError: (error) => {
        console.error("Erro no agendamento:", error);
        alert(`Erro ao agendar: ${error.message || "Verifique os dados e tente novamente."}`);
    }
  });

  const selectedService = services.find(s => s.id === formData.service_id);
  const selectedProfessional = professionals.find(p => p.id === formData.professional_id);

  const getSafeDayKey = (date) => {
    if (!date) return null;
    const dayIndex = date.getDay(); 
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayKeys[dayIndex];
  };

  const isDayDisabled = (date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const safeCheck = new Date(date.getTime() + (12 * 60 * 60 * 1000));
    const dayKey = getSafeDayKey(safeCheck);
    const workingHours = selectedProfessional?.working_hours?.[dayKey];
    return !workingHours || !workingHours.active;
  };

  const generateTimeSlots = () => {
    if (!formData.booking_date || !selectedProfessional || !selectedService) return [];
    
    const slots = [];
    const dayKey = getSafeDayKey(formData.booking_date);
    const workingHours = selectedProfessional.working_hours?.[dayKey];
    
    if (!workingHours?.active) return [];
    
    const [startHour, startMin] = (workingHours.start || "10:00").split(':').map(Number);
    const [endHour, endMin] = (workingHours.end || "18:00").split(':').map(Number);
    
    let current = new Date(formData.booking_date);
    current.setHours(startHour, startMin, 0, 0);
    
    const endOfDay = new Date(formData.booking_date);
    endOfDay.setHours(endHour, endMin, 0, 0);

    const now = new Date();
    const isToday = 
      formData.booking_date.getDate() === now.getDate() &&
      formData.booking_date.getMonth() === now.getMonth() &&
      formData.booking_date.getFullYear() === now.getFullYear();

    const serviceDuration = selectedService.duration_minutes || 60;

    while (current < endOfDay) {
      const slotStart = new Date(current);
      const slotEnd = addMinutes(slotStart, serviceDuration);

      if (slotEnd > endOfDay) break;

      const timeStr = format(slotStart, 'HH:mm');
      let isAvailable = true;

      if (isToday && isBefore(slotStart, now)) {
        isAvailable = false;
      }

      if (isAvailable) {
        const myStartMins = getMinutesFromTime(timeStr);

        for (const booking of bookings) {
          const bookStartMins = getMinutesFromTime(booking.booking_time);
          const bookEndMins = bookStartMins + (booking.duration_minutes || 60);

          if (myStartMins >= bookStartMins && myStartMins < bookEndMins) {
            isAvailable = false;
            break;
          }
        }
      }

      if (isAvailable) {
        const myStartMins = getMinutesFromTime(timeStr);
        for (const block of blockedSlots) {
          const blockStartMins = getMinutesFromTime(block.start_time);
          const blockEndMins = getMinutesFromTime(block.end_time);
          
          if (myStartMins >= blockStartMins && myStartMins < blockEndMins) {
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
    if (!user) { 
        openLogin(() => {}); 
        return; 
    }
    
    const d = formData.booking_date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStringManual = `${year}-${month}-${day}`;

    const bookingData = {
      service_id: formData.service_id,
      professional_id: formData.professional_id,
      booking_date: dateStringManual,
      booking_time: formData.booking_time,
      client_id: user.id, 
      client_name: formData.client_name || user.full_name,
      client_email: formData.client_email || user.email,
      client_phone: formData.client_phone || user.phone,
      service_name: selectedService.name,
      service_price: selectedService.price ? String(selectedService.price) : "0", 
      professional_name: selectedProfessional?.name || "Ingrid",
      duration_minutes: selectedService.duration_minutes,
      notes: formData.notes,
      status: 'pending'
    };

    createBookingMutation.mutate(bookingData);
  };

  useEffect(() => { if (user && step === 3) setFormData(prev => ({ ...prev, client_name: user.full_name, client_email: user.email })); }, [user, step]);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (success) {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "351915429170";
    const dateVisual = formData.booking_date ? format(formData.booking_date, "dd/MM/yyyy") : "";
    const message = `Olá Ingrid! Sou a *${formData.client_name}*.\nFiz um agendamento pelo site:\n\n💇‍♀️ *Serviço:* ${selectedService?.name}\n📅 *Data:* ${dateVisual}\n⏰ *Hora:* ${formData.booking_time}\n\nAguardo a confirmação!`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Pedido Recebido!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            O seu pedido foi registado com sucesso. Para agilizar a confirmação, por favor envie o comprovativo via WhatsApp clicando abaixo.
          </p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-600 hover:bg-green-700 w-full py-6 text-lg gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
               Confirmar no WhatsApp
            </Button>
          </a>
          <Button variant="ghost" className="mt-6 text-gray-500 hover:text-[var(--primary)]" onClick={() => { setFormData(prev => ({ ...prev, booking_date: null, booking_time: "", notes: "" })); setStep(1); setSuccess(false); setHasAutoSelected(false); }}>
              Voltar ao Início
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* HERO ANIMADO */}
      <section className="relative h-64 md:h-80 w-full overflow-hidden">
         <motion.div 
           className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: 'url(img/ela5.png)' }}
           initial={{ scale: 1.1, filter: 'brightness(0.5)' }}
           animate={{ scale: 1, filter: 'brightness(0.6)' }}
           transition={{ duration: 8, ease: "easeOut" }}
         />
         <div className="absolute inset-0 bg-black/40" />
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2, duration: 0.8 }}
           className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
         >
           <h1 className="text-4xl md:text-5xl font-bold mb-2 shadow-sm drop-shadow-lg" style={{fontFamily: "'Playfair Display', serif"}}>
             Agende o Seu Momento
           </h1>
           <p className="text-lg md:text-xl font-light text-white/90">
             Escolha o serviço e o melhor horário para si
           </p>
         </motion.div>
      </section>

      <div className="px-4 pb-12 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* AVISO IMPORTANTE */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-white border border-gray-200 shadow-md flex items-center justify-center text-center relative z-20"
          >
            <p className="text-base font-medium text-gray-700 flex flex-col sm:flex-row items-center gap-2">
              <span className="flex items-center gap-2 text-[var(--primary)] font-bold">
                <Sparkles className="w-5 h-5" /> Nota:
              </span>
              <span>Em todos os procedimentos estão inclusos tratamentos e finalização.</span>
            </p>
          </motion.div>

          {/* INDICADOR DE PASSOS */}
          <Card className="mb-8 p-6 shadow-xl border-t-4 border-[var(--primary)]">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors shadow-sm
                      ${step >= s ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {s}
                    </motion.div>
                    <span className={`text-xs mt-2 hidden sm:block font-medium ${step >= s ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                      {s === 1 && 'Serviço'} {s === 2 && 'Data/Hora'} {s === 3 && 'Seus Dados'}
                    </span>
                  </div>
                  {s < 3 && (
                    <div className="h-1 w-8 sm:w-16 rounded-full bg-gray-100 overflow-hidden">
                       <motion.div 
                          className="h-full bg-[var(--primary)]"
                          initial={{ width: "0%" }}
                          animate={{ width: step > s ? "100%" : "0%" }}
                          transition={{ duration: 0.5 }}
                       />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* FORMULÁRIO MULTI-ETAPAS */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              variants={stepVariants} 
              initial="initial" 
              animate="animate" 
              exit="exit" 
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 shadow-lg bg-white/95 backdrop-blur-sm">
                
                {/* --- ETAPA 1: ESCOLHA DO SERVIÇO --- */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-[var(--primary)]" /> 
                      Qual serviço deseja realizar?
                    </h2>
                    
                    {isLoadingServices ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
                    ) : (
                      <RadioGroup value={formData.service_id} onValueChange={(value) => setFormData({...formData, service_id: value})}>
                        <div className="space-y-3">
                          {services.map((service) => (
                            <div key={service.id} className={`flex items-start p-4 rounded-lg transition-all border cursor-pointer
                              ${formData.service_id === service.id 
                                ? 'bg-red-50/50 border-[var(--primary)] ring-1 ring-[var(--primary)]' 
                                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                              }`}>
                              <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                              <Label htmlFor={service.id} className="ml-3 flex-1 cursor-pointer">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-lg text-gray-900">{service.name}</p>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                                      <Clock className="w-3 h-3 inline mr-1" /> {service.duration_minutes} min
                                    </p>
                                  </div>
                                  <div className="text-right ml-4">
                                      <p className="font-bold text-lg whitespace-nowrap text-[var(--primary)]">
                                        {service.price ? (
                                            <>
                                              {service.price_from && <span className="text-xs font-normal text-gray-500 mr-1">desde</span>}
                                              €{service.price.toFixed(2)}
                                            </>
                                        ) : 'Consultar'}
                                      </p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                    
                    <div className="flex justify-end mt-8">
                      <Button 
                        onClick={() => setStep(2)} 
                        disabled={!formData.service_id} 
                        style={{backgroundColor: 'var(--primary)'}}
                        className="px-8 py-6 text-lg hover:brightness-110 shadow-md"
                      >
                        Continuar <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* --- ETAPA 2: DATA E HORA --- */}
                {step === 2 && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                          <Clock className="w-6 h-6 text-[var(--primary)]" /> 
                          Quando fica melhor para si?
                        </h2>
                        <div className="text-right">
                           <p className="text-sm text-gray-500">Serviço escolhido:</p>
                           <p className="font-semibold text-[var(--primary)]">{selectedService?.name}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <Label className="mb-3 block font-medium text-gray-700">Selecione a Data</Label>
                        <Calendar 
                          mode="single" 
                          selected={formData.booking_date} 
                          onSelect={(date) => {
                             if (!date) return;
                             const safeDate = new Date(date.getTime() + (12 * 60 * 60 * 1000));
                             setFormData({...formData, booking_date: safeDate, booking_time: ""})
                          }} 
                          disabled={isDayDisabled} 
                          locale={pt} 
                          className="border rounded-lg p-3 w-full flex justify-center bg-white shadow-sm" 
                        />
                      </div>
                      <div>
                        <Label className="mb-3 block font-medium text-gray-700">Horários Disponíveis</Label>
                        {formData.booking_date ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot) => (
                                <Button 
                                  key={slot.time} 
                                  variant={formData.booking_time === slot.time ? "default" : "outline"} 
                                  onClick={() => slot.available && setFormData({...formData, booking_time: slot.time})} 
                                  disabled={!slot.available} 
                                  className={`
                                    h-12 border-gray-200 transition-all
                                    ${formData.booking_time === slot.time 
                                      ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)] border-[var(--primary)] scale-105 shadow-md" 
                                      : ""} 
                                    ${!slot.available 
                                      ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 line-through decoration-gray-400 border-transparent" 
                                      : "hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-red-50"}
                                  `}
                                >
                                  {slot.time}
                                </Button>
                              ))
                            ) : (
                              <p className="col-span-full text-gray-500 text-center py-12 bg-gray-50 rounded-lg">
                                Sem horários livres neste dia.<br/>
                                <span className="text-xs">Tente selecionar outra data no calendário.</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center">
                            <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                            <p>Por favor, escolha uma data<br/>no calendário ao lado.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                      <Button variant="ghost" onClick={() => setStep(1)} className="hover:text-[var(--primary)] hover:bg-red-50">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar, mudar serviço
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        disabled={!formData.booking_date || !formData.booking_time} 
                        style={{backgroundColor: 'var(--primary)'}}
                        className="px-8 py-6 text-lg hover:brightness-110 shadow-md"
                      >
                        Continuar <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* --- ETAPA 3: DADOS FINAIS --- */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <User className="w-6 h-6 text-[var(--primary)]" /> 
                      Seus Dados de Contacto
                    </h2>
                    
                    <div className="space-y-5 mb-8">
                      <div>
                        <Label className="text-gray-700">Nome Completo *</Label>
                        <Input 
                          value={formData.client_name} 
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})} 
                          className="mt-1 h-12 text-lg" 
                          placeholder="Como prefere ser chamada?"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Email *</Label>
                          <Input 
                            type="email" 
                            value={formData.client_email} 
                            onChange={(e) => setFormData({...formData, client_email: e.target.value})} 
                            className="mt-1 h-12" 
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Telefone / WhatsApp *</Label>
                          <Input 
                            type="tel" 
                            value={formData.client_phone} 
                            onChange={(e) => setFormData({...formData, client_phone: e.target.value})} 
                            className="mt-1 h-12" 
                            placeholder="+351 ..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Observação (Opcional)</Label>
                        <Textarea 
                          value={formData.notes} 
                          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                          rows={3} 
                          className="mt-1 resize-none" 
                          placeholder="Tem alguma preferência ou alergia?"
                        />
                      </div>
                    </div>

                    <Alert className="mb-8 bg-gradient-to-r from-red-50 to-white border border-red-100">
                      <AlertDescription className="text-gray-800 font-medium">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wide">Resumo do Agendamento</p>
                             <p className="text-lg font-bold text-[var(--primary)]">{selectedService?.name}</p>
                           </div>
                           <div className="text-left sm:text-right bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                             <p className="text-gray-900 font-semibold flex items-center gap-2">
                               <CalendarIcon className="w-4 h-4 text-[var(--primary)]" />
                               {formData.booking_date && format(formData.booking_date, "dd 'de' MMMM", { locale: pt })}
                             </p>
                             <p className="text-gray-600 flex items-center gap-2 mt-1">
                               <Clock className="w-4 h-4 text-[var(--primary)]" />
                               {formData.booking_time}
                             </p>
                           </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <Button variant="ghost" onClick={() => setStep(2)} className="hover:text-[var(--primary)] hover:bg-red-50">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={!formData.client_name || !formData.client_email || !formData.client_phone || createBookingMutation.isPending} 
                        style={{backgroundColor: 'var(--primary)'}} 
                        className="w-full sm:w-auto px-8 py-6 text-lg hover:brightness-110 shadow-lg"
                      >
                        {createBookingMutation.isPending ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> A Enviar...</>
                        ) : (
                          'Confirmar Agendamento'
                        )}
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