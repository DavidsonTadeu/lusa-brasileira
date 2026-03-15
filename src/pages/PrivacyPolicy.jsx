import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[var(--primary)]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-8" style={{fontFamily: "'Playfair Display', serif"}}>Política de Privacidade</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Última atualização: {new Date().getFullYear()}</p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Introdução</h2>
            <p>A <strong>Lusa Brasileira - A Ruiva dos Lisos</strong> respeita a sua privacidade e compromete-se a proteger os dados pessoais que partilha connosco. Esta política descreve como recolhemos e utilizamos as suas informações.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Dados Recolhidos</h2>
            <p>Recolhemos apenas os dados necessários para a prestação dos nossos serviços de agendamento e comunicação, incluindo: Nome, Email e Número de Telefone.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Finalidade dos Dados</h2>
            <p>Os seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Gerir os seus agendamentos;</li>
              <li>Enviar confirmações e lembretes de serviços;</li>
              <li>Comunicar promoções ou avisos importantes (caso consinta).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Partilha de Dados</h2>
            <p>Não vendemos, trocamos ou transferimos os seus dados pessoais para terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Os Seus Direitos</h2>
            <p>De acordo com o RGPD, tem o direito de aceder, retificar ou solicitar a eliminação dos seus dados pessoais a qualquer momento. Para tal, contacte-nos através do email: ingridnunesandradesantos@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}