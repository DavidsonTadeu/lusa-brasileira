export const createPageUrl = (pageName) => {
  const routes = {
    Home: "/",
    Services: "/servicos",
    Gallery: "/galeria",
    Booking: "/agendar",
    Contact: "/contacto",
    AdminDashboard: "/admin",
    AdminAgenda: "/admin/agenda",
    AdminBookings: "/admin/agendamentos",
    AdminClients: "/admin/clientes",
    AdminMessages: "/admin/mensagens",
    AdminServices: "/admin/servicos",
    AdminGallery: "/admin/galeria",
    AdminScheduleSettings: "/admin/horarios",
    AdminAnnouncements: "/admin/avisos",
    PrivacyPolicy: "/politica-privacidade", 
    TermsOfUse: "/termos-uso",             
  };
  return routes[pageName] || "/";
};