
import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Zurück zum Start
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Nutzungsbedingungen</h1>
        <p className="text-zinc-500 mb-12">Zuletzt aktualisiert: 22. April 2026</p>

        <div className="space-y-12 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Akzeptanz der Bedingungen</h2>
            <p>
              Durch den Zugriff auf Pro Stencils Art erklären Sie sich mit diesen Nutzungsbedingungen einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Beschreibung des Dienstes</h2>
            <p>
              Pro Stencils Art ist ein KI-gestütztes Tool für Tätowierer. Die Ergebnisse werden durch KI generiert und MÜSSEN vor der Verwendung am Kunden von einem Fachmann überprüft werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Nutzerverhalten</h2>
            <p>
              Sie sind für alle hochgeladenen Bilder verantwortlich und garantieren, keine Rechte Dritter zu verletzen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Nutzungslimits</h2>
            <p>
              Der Dienst bietet eine begrenzte Anzahl von Generationen pro Nutzer. Wir behalten uns das Recht vor, diese Limits jederzeit zu ändern.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Gewährleistungsausschluss</h2>
            <p className="italic">
              DER DIENST WIRD "WIE BESEHEN" BEREITGESTELLT. DIE VERANTWORTUNG FÜR DIE VERWENDUNG DES STENCILS LIEGT ALLEIN BEIM TÄTOWIERER.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex justify-center">
          <button 
            onClick={onBack}
            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Zurück zum Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
