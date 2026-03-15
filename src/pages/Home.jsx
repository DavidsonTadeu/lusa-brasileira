import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Star, Sparkles, Heart, MapPin, Phone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TestimonialsSection from "@/components/TestimonialsSection";

// Variantes para animação de entrada (Staggered)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2 // Um item aparece depois do outro
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['featured-services'],
    queryFn: () => base44.entities.Service.filter({ is_featured: true, is_active: true }, 'name', 3),
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ is_featured: true, is_approved: true }, '-created_at', 3),
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['featured-gallery'],
    queryFn: () => base44.entities.GalleryImage.filter({ is_featured: true }, 'order', 6),
  });

  return (
    // 'overflow-hidden' garante que animações laterais não criem barra de rolagem no celular
    <div className="bg-white overflow-hidden w-full max-w-[100vw]">
      
      {/* Hero Section com Efeito Ken Burns (Zoom Lento) */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela.png)',
          }}
          initial={{ scale: 1.1, filter: 'brightness(0.5)' }} // Começa com zoom
          animate={{ scale: 1, filter: 'brightness(0.7)' }}   // Diminui o zoom suavemente
          transition={{ duration: 10, ease: "easeOut" }}      // Demora 10 segundos (cinematográfico)
        />
        
        {/* Gradiente para leitura */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <h1
            className="text-5xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Beleza que <br/> <span className="text-[var(--primary)] italic">Transforma</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Experiência única em cuidados capilares de excelência, onde cada detalhe é pensado em si.
          </p>
          <Link to={createPageUrl("Booking")}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="text-lg px-12 py-8 rounded-full shadow-[0_0_20px_rgba(178,34,34,0.4)] border border-white/20 backdrop-blur-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Calendar className="mr-3 w-6 h-6" />
                Agendar Agora
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Indicador de Scroll Animado */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* About Section com Reveal */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  Sobre mim
                </span>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Paixão pelo que Faço
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Com anos de dedicação e paixão, ofereço um serviço de excelência focado em realçar a sua beleza natural. Para mim, cada cliente é único, e o meu compromisso é proporcionar-lhe uma experiência totalmente personalizada e inesquecível.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Utilizamos apenas produtos de alta qualidade e técnicas inovadoras para garantir resultados excecionais.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[var(--primary)]/10 mix-blend-overlay z-10" />
              <img
                src="img/ela2.png"
                alt="Salão"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                Serviços Populares
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              A Minha Especialidade
            </h2>
          </motion.div>

          {isLoadingServices ? (
             <div className="flex justify-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
             </div>
          ) : services.length === 0 ? (
             <div className="text-center text-gray-500 italic">
               Nenhum serviço destacado no momento.
             </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {services.map((service) => (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-none bg-white h-full flex flex-col justify-between group hover:-translate-y-2">
                    <div>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-50 group-hover:bg-[var(--primary)] transition-colors duration-300">
                          <Sparkles className="w-8 h-8 text-[var(--primary)] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4 border-gray-100">
                      <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                        {service.price_from && 'desde '}€{service.price?.toFixed(2) || 'Consultar'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.duration_minutes} min
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link to={createPageUrl("Services")}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 hover:bg-[var(--primary)] hover:text-white transition-colors"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                Ver Todos os Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {galleryImages.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
            >
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Nosso Portfólio
              </h2>
              <p className="text-gray-600 text-lg">
                Veja alguns dos nossos trabalhos mais recentes
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {galleryImages.map((image) => (
                <motion.div
                  key={image.id}
                  variants={itemVariants}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium text-lg drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {image.title}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Link to={createPageUrl("Gallery")}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 hover:bg-[var(--primary)] hover:text-white transition-colors"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                  Ver Galeria Completa
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
            >
              <h2
                className="text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                O Carinho de Quem Passou por Aqui
              </h2>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {testimonials.map((testimonial) => (
                <motion.div key={testimonial.id} variants={itemVariants}>
                  <Card className="p-8 border-none bg-white relative">
                    {/* Aspas decorativas */}
                    <div className="absolute top-4 right-6 text-6xl text-gray-100 font-serif leading-none">"</div>
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" style={{ color: 'var(--primary)' }} />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic leading-relaxed relative z-10">
                      "{testimonial.comment}"
                    </p>
                    <div className="border-t pt-4 border-gray-100">
                      <p className="font-semibold text-gray-900">{testimonial.client_name}</p>
                      <p className="text-sm text-gray-500">{testimonial.service}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Fundo decorativo sutil */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Pronta para Transformar o Seu Look?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Agende o seu horário agora e desfrute de um momento dedicado a si.
            </p>
            <Link to={createPageUrl("Booking")}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="text-lg px-12 py-8 rounded-full shadow-xl"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Calendar className="mr-3 w-6 h-6" />
                  Agendar Agora
                </Button>
              </motion.div>
            </Link>
            
            <div className="mt-16">
              <TestimonialsSection />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                Localização
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Visite o Espaço
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
            >
              <Card className="p-8 border-none h-full shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Contacto</h3>
                <div className="space-y-6 text-gray-600">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-50 p-3 rounded-full">
                      <MapPin className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Endereço</p>
                      <p>Rua Porto de Baixo 69<br />3865-262 Salreu - Estarreja</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-red-50 p-3 rounded-full">
                      <Phone className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Telefone</p>
                      <p>+351 91 542 9170</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold mb-2 text-gray-900">Horário de Funcionamento</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>Segunda, Quarta - Sábado:</p> <p className="font-medium text-right">10h - 17h</p>
                    
                        <p>Terça, Domingo:</p> <p className="text-red-500 font-medium text-right">Fechado</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <iframe
                src="https://www.google.com/maps?q=Rua+Porto+de+Baixo+69,+3865-262+Salreu+Estarreja&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}