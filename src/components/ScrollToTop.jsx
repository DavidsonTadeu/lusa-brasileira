import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sempre que a rota mudar (pathname), joga o scroll para o topo (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Este componente não renderiza nada visualmente
}