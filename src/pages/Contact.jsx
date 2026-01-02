import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2, ChevronDown, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- DADOS DO FAQ ---
const faqs = [
  {
    question: "Preciso agendar com antecedência?",
    answer: "Sim, recomendamos agendar com pelo menos 3 a 5 dias de antecedência para garantir o horário da sua preferência, especialmente aos finais de semana."
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "Aceitamos numerário (dinheiro), MB Way e transferência bancária imediata."
  },
  {
    question: "Fazem atendimento ao domicílio?",
    answer: "Atualmente realizamos atendimentos apenas no nosso espaço físico para garantir a qualidade e ter todos os equipamentos necessários à disposição."
  },
  {
    question: "Posso levar acompanhante?",
    answer: "Para manter o ambiente tranquilo e exclusivo, pedimos que venha sozinha, a menos que o acompanhante também vá realizar algum serviço."
  }
];

// --- COMPONENTE INTERNO DE FAQ ---
const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group focus:outline-none"
      >
        <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-[var(--primary)]' : 'text-gray-800 group-hover:text-[var(--primary)]'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [success, setSuccess] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  // MUTAÇÃO
  const createMessageMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContactMessage.create({
        ...data,
        status: 'new'
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      // O pop-up some sozinho após 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (error) => {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar. Verifique sua conexão.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    createMessageMutation.mutate(formData);
  };

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen relative">
      
      {/* --- POP-UP (TOAST) DE SUCESSO --- */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-green-100 p-4 flex items-start gap-4"
          >
            <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
               <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-gray-900 text-lg">Mensagem Enviada!</h4>
               <p className="text-gray-600 text-sm mt-1">
                 Obrigada pelo contacto. Responderei o mais breve possível.
               </p>
            </div>
            <button onClick={() => setSuccess(false)} className="text-gray-400 hover:text-gray-600">
               <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ---------------------------------- */}

      {/* HERO ANIMADO */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela4.png)',
          }}
          initial={{ scale: 1.1, filter: 'brightness(0.5)' }}
          animate={{ scale: 1, filter: 'brightness(0.6)' }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center px-4"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            Contacto
          </h1>
          <p className="text-xl text-white/90 font-light">
            Estou aqui para tirar as suas dúvidas
          </p>
        </motion.div>
      </section>

      {/* SEÇÃO PRINCIPAL */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            
            {/* FORMULÁRIO */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="text-3xl font-bold mb-6 text-gray-900"
                style={{fontFamily: "'Playfair Display', serif"}}
              >
                Envie-me uma Mensagem
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Tem alguma questão sobre os serviços ou gostaria de um orçamento personalizado? Preencha o formulário abaixo e responderei o mais breve possível.
              </p>
              
              {/* O alerta antigo foi removido daqui e virou o Pop-up lá em cima */}
              
              <form onSubmit={handleSubmit} className="space-y-5 bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1 bg-white border-gray-200 focus:border-[var(--primary)] h-12"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mt-1 bg-white border-gray-200 focus:border-[var(--primary)] h-12"
                        placeholder="exemplo@email.com"
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="phone" className="text-gray-700">Telefone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="mt-1 bg-white border-gray-200 focus:border-[var(--primary)] h-12"
                        placeholder="+351 ..."
                    />
                    </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-gray-700">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    required
                    className="mt-1 bg-white border-gray-200 focus:border-[var(--primary)] resize-none"
                    placeholder="Como posso ajudar?"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={createMessageMutation.isPending}
                  className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all"
                  style={{backgroundColor: 'var(--primary)'}}
                >
                  {createMessageMutation.isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> A Enviar...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* INFORMAÇÕES DE CONTACTO */}
            <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="space-y-8"
            >
              <div>
                <h2 
                  className="text-3xl font-bold mb-6 text-gray-900"
                  style={{fontFamily: "'Playfair Display', serif"}}
                >
                  Informações de Contacto
                </h2>
                
                <div className="space-y-6">
                  {/* Morada */}
                  <Card className="p-6 border-none shadow-md hover:shadow-xl transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 group-hover:bg-[var(--primary)] transition-colors duration-300">
                        <MapPin className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Localização</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Rua Porto de Baixo 69<br />
                          3865-262 Salreu - Estarreja<br />
                          Portugal
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Telefone */}
                  <Card className="p-6 border-none shadow-md hover:shadow-xl transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 group-hover:bg-[var(--primary)] transition-colors duration-300">
                        <Phone className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Telefone</h3>
                        <p className="text-gray-600 font-medium text-lg">+351 91 542 9170</p>
                        <p className="text-xs text-gray-400 mt-1">Chamada para rede móvel nacional</p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Email */}
                  <Card className="p-6 border-none shadow-md hover:shadow-xl transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 group-hover:bg-[var(--primary)] transition-colors duration-300">
                        <Mail className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-gray-600 break-all">
                          ingridnunesandradesantos@gmail.com
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Horário */}
                  <Card className="p-6 border-none shadow-md hover:shadow-xl transition-shadow group bg-gray-900 text-white">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10 group-hover:bg-[var(--primary)] transition-colors duration-300">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-3 text-lg">Horário de Funcionamento</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between border-b border-white/10 pb-2">
                              <span>Seg, Qua, Qui, Sex</span>
                              <span className="font-medium">10h - 17h</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-2 text-red-200">
                              <span>Terça e Sábado</span>
                              <span className="font-medium">Folga</span>
                          </div>
                          <div className="flex justify-between text-red-200">
                              <span>Domingo</span>
                              <span className="font-medium">Fechado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* FAQ SECTION */}
          <div className="mt-24 max-w-3xl mx-auto">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-10"
             >
                <div className="flex items-center justify-center gap-2 text-[var(--primary)] font-bold mb-2">
                    <HelpCircle className="w-6 h-6" />
                    <span className="uppercase tracking-wider text-sm">Tira-Dúvidas</span>
                </div>
                <h2 className="text-3xl font-bold" style={{fontFamily: "'Playfair Display', serif"}}>Perguntas Frequentes</h2>
             </motion.div>

             <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                {faqs.map((faq, index) => (
                    <FAQItem 
                      key={index} 
                      question={faq.question} 
                      answer={faq.answer} 
                      isOpen={openFAQIndex === index}
                      onClick={() => toggleFAQ(index)}
                    />
                ))}
             </div>
          </div>

          {/* MAPA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-24"
          >
            <h2 
              className="text-3xl font-bold mb-8 text-center"
              style={{fontFamily: "'Playfair Display', serif"}}
            >
              Como Chegar
            </h2>
            <div className="h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                src="https://www.google.com/maps?q=Rua+Porto+de+Baixo+69,+3865-262+Salreu+Estarreja&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}