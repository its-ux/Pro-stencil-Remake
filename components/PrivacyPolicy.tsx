import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

            <h1 className="text-4xl font-bold text-white mb-2">Datenschutzerklärung</h1>
            <p className="text-zinc-500 mb-12">Zuletzt aktualisiert: 22. April 2026</p>

            <div className="space-y-12 text-zinc-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-white mb-4">1. Erhobene Informationen</h2>
                <ul className="space-y-3 list-disc pl-5">
                  <li><span className="text-white font-semibold">Kontoinformationen:</span> Name und E-Mail-Adresse (bei Erstellung eines Kontos).</li>
                  <li><span className="text-white font-semibold">Inhalte:</span> Von Ihnen hochgeladene Bilder und die für Sie generierten Stencils.</li>
                  <li><span className="text-white font-semibold">Nutzungsdaten:</span> Auswahlmöglichkeiten (Stile, Verarbeitungsoptionen), Geräte- und Protokolldaten (IP-Adresse, Zeitstempel).</li>
                  <li><span className="text-white font-semibold">Authentifizierung:</span> Google-Login-Profil/Token; wir erhalten keinen Zugriff auf Ihr Google-Passwort.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">2. Verwendung der Informationen</h2>
                <ul className="space-y-3 list-disc pl-5">
                  <li>Bereitstellung des Dienstes (Stencils generieren, Galerie speichern, Limits durchsetzen).</li>
                  <li>Kommunikation wichtiger Servicemeldungen (Konto, Sicherheit, Updates). Kein Marketing ohne Zustimmung.</li>
                  <li>Diagnose und Analyse zur Verbesserung der Leistung und Qualität.</li>
                  <li><span className="text-white font-semibold">Modelltraining:</span> Wir verwenden Ihre Bilder NICHT zum Trainieren unserer KI-Modelle.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">3. Speicherung & Sicherheit</h2>
                <ul className="space-y-3 list-disc pl-5">
                  <li>Daten werden bei renommierten Cloud-Anbietern mit Verschlüsselung und Zugriffskontrollen gehostet.</li>
                  <li>Ihre Bilder und Stencils sind privat, sofern Sie sie nicht explizit teilen.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">4. Bildverarbeitung</h2>
                <ul className="space-y-3 list-disc pl-5">
                  <li>Bilder werden von unserer KI-Pipeline verarbeitet, um Stencils zu erstellen.</li>
                  <li>Das Original und das Ergebnis werden in Ihrer privaten Bibliothek gespeichert, bis Sie sie löschen.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">5. Ihre Rechte</h2>
                <p className="mb-4">
                  Sie können Ihre Daten einsehen, korrigieren und löschen. Im Rahmen der DSGVO haben Sie zudem das Recht auf Datenübertragbarkeit und Widerspruch gegen bestimmte Verarbeitungen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4">6. Kontakt</h2>
                <p className="mb-2">Fragen zum Datenschutz?</p>
                <p>E-Mail: <a href="mailto:kennygoossens@icloud.com" className="text-white hover:underline">kennygoossens@icloud.com</a></p>
              </section>
            </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex justify-center">
          <button 
            onClick={onBack}
            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;