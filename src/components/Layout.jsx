import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Menu, X, Calendar, Home, Briefcase, Image, Phone,
  LayoutDashboard, LogOut, LogIn, Mail, Megaphone,
  Instagram, Facebook, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import NotificationBell from "@/components/NotificationBell";
import CookieBanner from "@/components/CookieBanner";
import { Helmet } from "react-helmet-async"; // Mantendo o SEO

export default function Layout({ children, currentPageName = "Home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, openLogin, openTeaser, isAuthModalOpen } = useAuth();

  const handleNavigation = () => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  };

  // --- LÓGICA DO TEASER (RESTAURADA) ---
  useEffect(() => {
    if (!user && !isAuthModalOpen) {
      const timer = setTimeout(() => {
        // Verifica se a função existe antes de chamar (segurança)
        if (openTeaser) openTeaser();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [user, isAuthModalOpen, openTeaser]);

  const isAdmin = user?.role === 'admin';
  // Verifica se estamos numa página que começa por /admin
  const isAdminPage = location.pathname.startsWith('/admin');

  // --- CONFIGURAÇÃO DE SEO (MANTIDA) ---
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

  // --- DEFINIÇÃO DOS MENUS (RESTAURADA) ---
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
    { name: "Pedidos", path: createPageUrl("AdminBookings"), icon: Calendar }, // Mudei nome pra caber melhor
    { name: "Clientes", path: createPageUrl("AdminClients"), icon: Phone },
    { name: "Avisos", path: createPageUrl("AdminAnnouncements"), icon: Megaphone },
    { name: "Msgs", path: createPageUrl("AdminMessages"), icon: Mail },
    { name: "Serviços", path: createPageUrl("AdminServices"), icon: Briefcase },
    { name: "Galeria", path: createPageUrl("AdminGallery"), icon: Image },
    { name: "Horários", path: createPageUrl("AdminScheduleSettings"), icon: Calendar },
  ];

  // Menu inteligente: Mostra menu Admin se for admin E estiver na área admin
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

            {/* --- LOGO (RESTAURADO O ORIGINAL GRANDE) --- */}
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
              {/* Espaçador invisível para empurrar o menu, já que a logo é absolute */}
              <div className="w-32 md:w-44 h-20"></div>
            </div>

            {/* Desktop Navigation */}
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

              {/* Botão para ir para Admin (se estiver na área pública) */}
              {user && !isAdminPage && isAdmin && (
                <Link to="/admin" onClick={handleNavigation}>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Área Admin
                  </Button>
                </Link>
              )}

              {/* Botão para ir para o Site (se estiver na área admin) */}
              {user && isAdminPage && (
                <Link to="/" onClick={handleNavigation}>
                  <Button size="sm" variant="outline">
                    Ver Site
                  </Button>
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gray-200">
                  {/* --- NOTIFICATION BELL RESTAURADO --- */}
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

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
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

      {/* Modal de Autenticação Global */}
      <AuthModal />
      
      {/* Banner de Cookies Restaurado */}
      <CookieBanner />

      {/* --- FOOTER DETALHADO (RESTAURADO) --- */}
      {!isAdminPage && (
        <footer className="bg-gray-900 text-white mt-32 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Coluna 1: Marca */}
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  LUSA BRASILEIRA
                </h3>
                <p className="text-sm text-[var(--primary)] uppercase tracking-wider font-medium mb-4">
                  A Ruiva dos Lisos
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Realçando a sua beleza natural com dedicação, técnica e produtos de excelência.
                </p>
                {/* Redes Sociais */}
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/ingridsantoslusabrasileira/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-[var(--primary)] transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://web.facebook.com/ingrid.andrade.3726?_rdc=1&_rdr#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-[var(--primary)] transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Coluna 2: Navegação */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Navegação</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl("Services")} onClick={handleNavigation} className="hover:text-[var(--primary)] transition-colors">Serviços e Preços</Link></li>
                  <li><Link to={createPageUrl("Gallery")} onClick={handleNavigation} className="hover:text-[var(--primary)] transition-colors">Portfólio</Link></li>
                  <li><Link to={createPageUrl("Booking")} onClick={handleNavigation} className="hover:text-[var(--primary)] transition-colors">Agendar Horário</Link></li>
                  <li><Link to={createPageUrl("Contact")} onClick={handleNavigation} className="hover:text-[var(--primary)] transition-colors">Fale Conosco</Link></li>
                </ul>
              </div>

              {/* Coluna 3: Horário (Restaurado o "Folga na Terça") */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Horário</h4>
                <ul className="space-y-2 text-sm text-gray-400 max-w-[200px]">
                  <li className="flex justify-between">
                    <span>Seg, Qua - Sab:</span>
                    <span>09h - 19h</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-red-400">Terça:</span>
                    <span>Folga</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-red-400">Domingo:</span>
                    <span>Fechado</span>
                  </li>
                </ul>
              </div>

              {/* Coluna 4: Contactos (Restaurado Endereço Completo) */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Contactos</h4>
                <div className="space-y-3 text-sm text-gray-400">
                  <p className="flex items-start gap-3">
                    <span className="mt-1">📍</span>
                    <span>Rua Porto de Baixo 69<br />3865-262 Salreu - Estarreja</span>
                  </p>

                  <a href="tel:+351915429170" className="flex items-center gap-3 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>+351 91 542 9170</span>
                  </a>

                  <a href="mailto:ingridnunesandradesantos@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors break-all">
                    <Mail className="w-4 h-4" />
                    <span>ingridnunesandradesantos@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
              <p>&copy; {new Date().getFullYear()} Lusa Brasileira. Todos os direitos reservados.</p>
              <div className="flex gap-4 mt-2 md:mt-0">
                <Link to={createPageUrl("PrivacyPolicy")} onClick={handleNavigation} className="hover:text-[var(--primary)]">Política de Privacidade</Link>
                <Link to={createPageUrl("TermsOfUse")} onClick={handleNavigation} className="hover:text-[var(--primary)]">Termos de Uso</Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Botão Flutuante do WhatsApp */}
      {!isAdminPage && (
        <a
          href="https://wa.me/351915429170"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
          title="Fale connosco no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  );
}