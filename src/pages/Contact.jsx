import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [success, setSuccess] = useState(false);

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactMessage.create(data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    createMessageMutation.mutate({
      ...formData,
      status: 'new'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela4.png)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            Contacto
          </h1>
          <p className="text-xl text-white/90">
            Estou aqui para tirar as suas dúvidas
          </p>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 
                className="text-3xl font-bold mb-6"
                style={{fontFamily: "'Playfair Display', serif"}}
              >
                Envie-me uma Mensagem
              </h2>
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mensagem enviada com sucesso! Entrarei em contacto em breve.</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="bg-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    required
                    className="bg-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={createMessageMutation.isPending}
                  className="w-full"
                  style={{backgroundColor: 'var(--primary)'}}
                >
                  {createMessageMutation.isPending ? 'A Enviar...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 
                  className="text-3xl font-bold mb-6"
                  style={{fontFamily: "'Playfair Display', serif"}}
                >
                  Informações de Contacto
                </h2>
                
                <div className="space-y-6">
                  {/* Morada */}
                  <Card className="p-6 border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(178, 34, 34, 0.1)'}}>
                        <MapPin className="w-6 h-6" style={{color: 'var(--primary)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Localização</h3>
                        <p className="text-gray-600">
                          Rua Porto de Baixo 69<br />
                          3865-262 Salreu - Estarreja<br />
                          Portugal
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Telefone */}
                  <Card className="p-6 border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(178, 34, 34, 0.1)'}}>
                        <Phone className="w-6 h-6" style={{color: 'var(--primary)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telefone</h3>
                        <p className="text-gray-600">+351 91 542 9170</p>
                        <p className="text-xs text-gray-400 mt-1">Chamada para rede móvel nacional</p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Email */}
                  <Card className="p-6 border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(178, 34, 34, 0.1)'}}>
                        <Mail className="w-6 h-6" style={{color: 'var(--primary)'}} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-gray-600 break-all text-sm">
                          ingridnunesandradesantos@gmail.com
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Horário */}
                  <Card className="p-6 border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: 'rgba(178, 34, 34, 0.1)'}}>
                        <Clock className="w-6 h-6" style={{color: 'var(--primary)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Horário</h3>
                        <div className="text-gray-600 space-y-1 text-sm">
                          <p><span className="font-medium">Seg, Qua, Qui, Sex:</span> 10h - 18h</p>
                          <p><span className="font-medium text-red-500">Terça e Sábado:</span> Folga</p>
                          <p><span className="font-medium text-red-500">Domingo:</span> Fechado</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-16">
            <h2 
              className="text-3xl font-bold mb-8 text-center"
              style={{fontFamily: "'Playfair Display', serif"}}
            >
              Como Chegar
            </h2>
            <div className="h-[450px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {/* Mapa Google Maps atualizado para Salreu */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3029.627947703373!2d-8.56637492398539!3d40.71661297139194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2397fb57d38391%3A0x6e282928c0c8e3b0!2sR.%20Porto%20de%20Baixo%2069%2C%203865-262%20Salreu!5e0!3m2!1spt-PT!2spt!4v1709221234567!5m2!1spt-PT!2spt"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}