import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Menu, X, Calendar, Home, Briefcase, Image, Phone,
  LayoutDashboard, LogOut, LogIn, Mail, Megaphone,
  Instagram, Facebook, User, MapPin, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import NotificationBell from "@/components/NotificationBell";
import CookieBanner from "@/components/CookieBanner";
import { Helmet } from "react-helmet-async"; 

export default function Layout({ children, currentPageName = "Home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, openLogin, openTeaser, isAuthModalOpen } = useAuth();

  const handleNavigation = () => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  };

  // --- LÓGICA DO TEASER ---
  useEffect(() => {
    if (!user && !isAuthModalOpen) {
      const timer = setTimeout(() => {
        if (openTeaser) openTeaser();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [user, isAuthModalOpen, openTeaser]);

  const isAdmin = user?.role === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  // --- CONFIGURAÇÃO DE SEO ---
  const pageMeta = {
    Home: { title: "Lusa Brasileira - A Ruiva dos Lisos", desc: "Especialista em alisamentos e tratamentos capilares em Portugal." },
    Services: { title: "Serviços & Preços | Lusa Brasileira", desc: "Confira nossa tabela de preços para cortes, coloração e alisamentos." },
    Gallery: { title: "Galeria de Resultados | Lusa Brasileira", desc: "Veja o antes e depois das nossas clientes." },
    Booking: { title: "Agendar Horário | Lusa Brasileira", desc: "Marque o seu horário online de forma rápida e fácil." },
    Contact: { title: "Contactos | Lusa Brasileira", desc: "Fale connosco ou visite o nosso salão." },
    PrivacyPolicy: { title: "Política de Privacidade | Lusa Brasileira", desc: "Como tratamos os seus dados." },
    TermsOfUse: { title: "Termos de Uso | Lusa Brasileira", desc: "Regras de utilização do site." },
    ClientAppointments: { title: "Meus Agendamentos | Área do Cliente", desc: "Gerencie os seus horários." },
    Profile: { title: "Meu Perfil | Lusa Brasileira", desc: "Dados da sua conta." },
    AdminDashboard: { title: "Dashboard | Admin Lusa", desc: "Painel administrativo." },
  };

  const meta = pageMeta[currentPageName] || { title: "Lusa Brasileira", desc: "Cabeleireiro em Portugal" };

  // --- DEFINIÇÃO DOS MENUS ---
  const publicNavItems = [
    { name: "Início", path: createPageUrl("Home"), icon: Home },
    { name: "Serviços", path: createPageUrl("Services"), icon: Briefcase },
    { name: "Galeria", path: createPageUrl("Gallery"), icon: Image },
    { name: "Agendar", path: createPageUrl("Booking"), icon: Calendar },
    { name: "Contacto", path: createPageUrl("Contact"), icon: Phone },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
    { name: "Agenda", path: createPageUrl("AdminAgenda"), icon: Calendar },
    { name: "Pedidos", path: createPageUrl("AdminBookings"), icon: Calendar },
    { name: "Clientes", path: createPageUrl("AdminClients"), icon: Phone },
    { name: "Avisos", path: createPageUrl("AdminAnnouncements"), icon: Megaphone },
    { name: "Msgs", path: createPageUrl("AdminMessages"), icon: Mail },
    { name: "Serviços", path: createPageUrl("AdminServices"), icon: Briefcase },
    { name: "Galeria", path: createPageUrl("AdminGallery"), icon: Image },
    { name: "Horários", path: createPageUrl("AdminScheduleSettings"), icon: Calendar },
  ];

  const navItems = isAdminPage && isAdmin ? adminNavItems : publicNavItems;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* INJEÇÃO DE SEO */}
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.desc} />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">

            {/* --- LOGO --- */}
            <div className="relative h-full flex items-center z-50">
              <Link
                to={createPageUrl("Home")}
                className="absolute top-0 left-0 flex items-center"
                onClick={handleNavigation}
              >
                <img
                  src="/img/logo2.0.png"
                  alt="Lusa Brasileira - Home"
                  className="h-36 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 mt-2"
                />
              </Link>
              <div className="w-32 md:w-44 h-20"></div>
            </div>

            {/* Desktop Navigation (Só aparece em telas grandes) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                    location.pathname === item.path ? 'text-[var(--primary)] font-bold' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {!user && !isAdminPage && (
                <Button
                  onClick={() => openLogin()}
                  size="sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                  className="hover:opacity-90 ml-4"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar / Registar
                </Button>
              )}

              {user && !isAdminPage && isAdmin && (
                <Link to="/admin" onClick={handleNavigation}>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Área Admin
                  </Button>
                </Link>
              )}

              {user && isAdminPage && (
                <Link to="/" onClick={handleNavigation}>
                  <Button size="sm" variant="outline">
                    Ver Site
                  </Button>
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gray-200">
                  {/* SININHO DESKTOP */}
                  <NotificationBell userId={user.id} />

                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-600 hidden lg:inline font-medium">
                      Olá, {user.full_name?.split(' ')[0]}
                    </span>

                    <div className="flex gap-3 text-xs">
                      {!isAdmin && (
                        <Link to="/meus-agendamentos" onClick={handleNavigation} className="text-[var(--primary)] hover:underline hidden lg:inline">
                          Agendamentos
                        </Link>
                      )}
                      <Link to="/perfil" onClick={handleNavigation} className="text-gray-500 hover:text-[var(--primary)] hover:underline hidden lg:inline">
                        Meu Perfil
                      </Link>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { logout(); handleNavigation(); }}
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4 text-gray-500 hover:text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Actions (Sininho + Menu Hamburguer) - SÓ CELULAR */}
            <div className="flex items-center gap-3 md:hidden">
                {/* SININHO MOBILE (Adicionado Aqui) */}
                {user && <NotificationBell userId={user.id} />}
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-5">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path ? 'bg-red-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              <hr className="border-gray-100 my-2" />

              {!user && (
                <Button
                  onClick={() => { setMobileMenuOpen(false); openLogin(); }}
                  className="w-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar / Registar
                </Button>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 font-bold flex items-center gap-2">
                    <User className="w-4 h-4" /> {user.full_name || user.email}
                  </div>

                  {!isAdmin && (
                    <Link
                      to="/perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 ml-2 border-l-2 border-transparent hover:border-[var(--primary)]"
                    >
                      👤 Os Meus Dados
                    </Link>
                  )}
                  
                  {!isAdmin && (
                    <Link
                      to="/meus-agendamentos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 ml-2 border-l-2 border-transparent hover:border-[var(--primary)]"
                    >
                      📅 Meus Agendamentos
                    </Link>
                  )}

                  {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-red-600 font-bold hover:bg-red-50 ml-2">
                        Painel Administrativo
                      </Link>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      <AuthModal />
      <CookieBanner />

      {/* --- FOOTER PREMIUM V2 --- */}
      {!isAdminPage && (
        <footer className="bg-[#0f172a] text-white mt-32 relative overflow-hidden">
            {/* Faixa Superior de CTA */}
            <div className="bg-[var(--primary)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                   <h3 className="text-xl font-bold font-serif text-white">Pronta para realçar a sua beleza?</h3>
                   <p className="text-white/80 text-sm">Agende o seu horário hoje mesmo e sinta a diferença.</p>
                </div>
                <Link to={createPageUrl("Booking")} onClick={handleNavigation}>
                  <Button variant="secondary" className="bg-white text-[var(--primary)] hover:bg-gray-100 font-bold rounded-full px-8">
                     Agendar Agora <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* Coluna 1: Marca e Redes */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    LUSA BRASILEIRA
                  </h3>
                  <p className="text-[10px] text-[var(--primary)] uppercase tracking-[0.2em] font-bold">
                    A Ruiva dos Lisos
                  </p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Excelência em alisamentos, coloração e tratamentos capilares. O seu cabelo merece o melhor cuidado profissional em Portugal.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/ingridsantoslusabrasileira/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-[var(--primary)] p-3 rounded-full transition-all duration-300 group"
                  >
                    <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </a>
                  <a
                    href="https://web.facebook.com/ingrid.andrade.3726"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-[#1877F2] p-3 rounded-full transition-all duration-300 group"
                  >
                    <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </a>
                </div>
              </div>

              {/* Coluna 2: Links Rápidos */}
              <div>
                <h4 className="text-lg font-serif font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Explorar</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to={createPageUrl("Home")} onClick={handleNavigation} className="hover:text-[var(--primary)] hover:pl-1 transition-all">Início</Link></li>
                  <li><Link to={createPageUrl("Services")} onClick={handleNavigation} className="hover:text-[var(--primary)] hover:pl-1 transition-all">Serviços e Preços</Link></li>
                  <li><Link to={createPageUrl("Gallery")} onClick={handleNavigation} className="hover:text-[var(--primary)] hover:pl-1 transition-all">Portfólio</Link></li>
                  <li><Link to={createPageUrl("Booking")} onClick={handleNavigation} className="hover:text-[var(--primary)] hover:pl-1 transition-all">Agendamento Online</Link></li>
                  <li><Link to={createPageUrl("Contact")} onClick={handleNavigation} className="hover:text-[var(--primary)] hover:pl-1 transition-all">Fale Conosco</Link></li>
                </ul>
              </div>

              {/* Coluna 3: Contactos */}
              <div>
                <h4 className="text-lg font-serif font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Contactos</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>Rua Porto de Baixo 69<br />3865-262 Salreu - Estarreja</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                    <a href="tel:+351915429170" className="hover:text-white transition-colors">+351 91 542 9170</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                    <a href="mailto:ingridnunesandradesantos@gmail.com" className="hover:text-white transition-colors break-all">ingridnunesandradesantos@gmail.com</a>
                  </li>
                </ul>
              </div>

              {/* Coluna 4: Horários */}
              <div>
                <h4 className="text-lg font-serif font-bold mb-6 text-white border-b border-white/10 pb-2 inline-block">Horário</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span>Seg, Qua, Qui, Sex, Sab</span>
                    <span className="font-medium text-white">10h - 17h</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-2 text-white/50">
                    <span>Terça</span>
                    <span className="text-[var(--primary)] font-medium">Folga</span>
                  </li>
                  <li className="flex justify-between items-center text-white/50">
                    <span>Domingo</span>
                    <span className="text-[var(--primary)] font-medium">Fechado</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Copyright e Links Legais */}
          <div className="border-t border-white/10 bg-[#0a0f1d]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
              <p>&copy; {new Date().getFullYear()} Lusa Brasileira. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <Link to={createPageUrl("PrivacyPolicy")} onClick={handleNavigation} className="hover:text-white transition-colors">Política de Privacidade</Link>
                <Link to={createPageUrl("TermsOfUse")} onClick={handleNavigation} className="hover:text-white transition-colors">Termos de Uso</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
  
    </div>
  );
}