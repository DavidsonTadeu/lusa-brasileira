
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Star, Sparkles, Heart, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  const { data: services = [] } = useQuery({
    queryKey: ['featured-services'],
    queryFn: () => base44.entities.Service.filter({ is_featured: true, is_active: true }, '-created_date', 3),
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ is_featured: true, is_approved: true }, '-created_date', 3),
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['featured-gallery'],
    queryFn: () => base44.entities.GalleryImage.filter({ is_featured: true }, 'order', 6),
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(img/fotodela.png)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Beleza que Transforma
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light">
            Experiência única em cuidados capilares de excelência
          </p>
          <Link to={createPageUrl("Booking")}>
            <Button
              size="lg"
              className="text-lg px-12 py-7 rounded-full hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Calendar className="mr-3 w-6 h-6" />
              Agendar Agora
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  Sobre mim
                </span>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Paixão pelo que Faço
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Com anos de dedicação e paixão, ofereço um serviço de excelência focado em realçar a sua beleza natural. Para mim, cada cliente é único, e o meu compromisso é proporcionar-lhe uma experiência totalmente personalizada e inesquecível. Utilizo apenas produtos de alta qualidade e técnicas inovadoras para garantir resultados excecionais que superam as suas expectativas.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Utilizamos apenas produtos de alta qualidade e técnicas inovadoras para garantir resultados excecionais
                que superam as suas expectativas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
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
          <div className="text-center mb-16">
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
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border-none bg-white">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(178, 34, 34, 0.1)' }}>
                    <Sparkles className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
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
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl("Services")}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
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
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Nosso Portfólio
              </h2>
              <p className="text-gray-600 text-lg">
                Veja alguns dos nossos trabalhos mais recentes
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium">{image.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl("Gallery")}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
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
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                O Carinho de Quem Passou por Aqui
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 border-none bg-white">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" style={{ color: 'var(--primary)' }} />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.client_name}</p>
                      <p className="text-sm text-gray-500">{testimonial.service}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Pronta para Transformar o Seu Look?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Agende o seu horário agora e desfrute de um momento dedicado a si
            </p>
            <Link to={createPageUrl("Booking")}>
              <Button
                size="lg"
                className="text-lg px-12 py-7 rounded-full hover:scale-105 transition-transform"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Calendar className="mr-3 w-6 h-6" />
                Agendar Agora
              </Button>
            </Link>
            <TestimonialsSection />
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
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
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-8 border-none">
              <h3 className="text-2xl font-bold mb-6">Contacto</h3>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  <span>Rua Exemplo, 123<br />1000-000 Lisboa</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <span>+351 21 123 4567</span>
                </p>
                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Horário de Funcionamento</h4>
                  <p>Segunda - Sexta: 9h - 19h</p>
                  <p>Sábado: 9h - 18h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </div>
            </Card>

            <div className="h-[400px] rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=Rua+Porto+de+Baixo+69,+3865-262+Salreu+Estarreja&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
