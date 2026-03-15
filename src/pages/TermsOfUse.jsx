import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[var(--primary)]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-8" style={{fontFamily: "'Playfair Display', serif"}}>Termos e Condições de Uso</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Agendamentos</h2>
            <p>Ao realizar um agendamento na <strong>Lusa Brasileira</strong>, o cliente compromete-se a comparecer no horário marcado. Pedimos que chegue com 5 a 10 minutos de antecedência.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Cancelamentos e Atrasos</h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Cancelamentos:</strong> Devem ser feitos com pelo menos 24 horas de antecedência.</li>
              <li><strong>Atrasos:</strong> Tolerância máxima de 15 minutos. Após este período, o agendamento poderá ser cancelado ou reduzido para não prejudicar o próximo cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Pagamentos</h2>
            <p>Os pagamentos devem ser realizados no local após a prestação do serviço, aceitando-se numerário ou transferência imediata (MBWay).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Satisfação do Cliente</h2>
            <p>A nossa prioridade é a sua satisfação. Caso haja alguma questão com o serviço prestado, por favor informe-nos no momento ou até 24 horas após o procedimento para avaliação.</p>
          </section>
        </div>
      </div>
    </div>
  );
}