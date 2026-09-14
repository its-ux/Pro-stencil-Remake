import React, { useState } from 'react';
import { ArrowLeft, Mail, Search, HelpCircle, Clock, ExternalLink, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { sendMessageToAdmin } from '../src/firebase';

interface SupportCenterProps {
  onBack: () => void;
  language: Language;
  translations: any;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ onBack, language, translations: t }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await sendMessageToAdmin(message);
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  const faqs = [
    {
      question: language === 'es' ? "¿Cómo creo un stencil?" : (language === 'de' ? "Wie erstelle ich ein Stencil?" : "How do I create a stencil?"),
      answer: (
        <ol className="list-decimal pl-5 space-y-1">
          {language === 'es' ? (
            <>
              <li>Sube tu imagen (JPEG, PNG o GIF)</li>
              <li>Elige tu estilo de artista preferido</li>
              <li>Ajusta la configuración (fondo, color de línea)</li>
              <li>Haz clic en "Crear Stencil" y espera el procesamiento</li>
              <li>Descarga tu stencil completado</li>
            </>
          ) : language === 'de' ? (
            <>
              <li>Laden Sie Ihr Bild hoch (JPEG, PNG oder GIF)</li>
              <li>Wählen Sie Ihren bevorzugten Künstler-Stil</li>
              <li>Passen Sie die Einstellungen an (Hintergrund, Linienfarbe)</li>
              <li>Klicken Sie auf "Stencil generieren" und warten Sie auf die Verarbeitung</li>
              <li>Laden Sie Ihr fertiges Stencil herunter</li>
            </>
          ) : (
            <>
              <li>Upload your image (JPEG, PNG, or GIF)</li>
              <li>Choose your preferred artist style</li>
              <li>Adjust settings (background, line color)</li>
              <li>Click "Create Stencil" and wait for processing</li>
              <li>Download your completed stencil</li>
            </>
          )}
        </ol>
      )
    },
    {
      question: language === 'es' ? "¿Qué formatos de imagen son compatibles?" : (language === 'de' ? "Welche Bildformate werden unterstützt?" : "What image formats are supported?"),
      answer: language === 'es' 
        ? "Admitimos imágenes JPEG, PNG y GIF de hasta 10 MB. Para obtener mejores resultados, utiliza imágenes de alta calidad con detalles claros." 
        : language === 'de'
        ? "Wir unterstützen JPEG-, PNG- und GIF-Bilder bis zu einer Größe von 10 MB. Für beste Ergebnisse verwenden Sie hochwertige Bilder mit klaren Details."
        : "We support JPEG, PNG, and GIF images up to 10MB in size. For best results, use high-quality images with clear details."
    },
    {
      question: language === 'es' ? "¿Cuáles son los diferentes estilos de artista?" : (language === 'de' ? "Was sind die verschiedenen Künstler-Stile?" : "What are the different artist styles?"),
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-white font-semibold">{language === 'es' ? 'Recomendado' : (language === 'de' ? 'Empfohlen' : 'Recommended')}:</span> {language === 'es' ? 'Máximo detalle para transferencia térmica.' : (language === 'de' ? 'Maximale Details, optimiert für den Thermotransfer.' : 'Maximum detail optimized for thermal transfer.')}</li>
          <li><span className="text-white font-semibold">{language === 'es' ? 'Tatuaje a Color' : (language === 'de' ? 'Farbtattoo' : 'Color Tattoo')}:</span> {language === 'es' ? 'Contornos gruesos ideales como base para color.' : (language === 'de' ? 'Kräftige Umrisse, ideal als Basis für Farbarbeiten.' : 'Bold outlines ideal as a base for color work.')}</li>
          <li><span className="text-white font-semibold">{language === 'es' ? 'Detalles Realistas' : (language === 'de' ? 'Realistische Details' : 'Realistic Details')}:</span> {language === 'es' ? 'Estilo realista de Darwin Enriquez.' : (language === 'de' ? 'Von Darwin Enriquez inspirierter realistischer Stil.' : 'Darwin Enriquez inspired realistic style.')}</li>
          <li><span className="text-white font-semibold">{language === 'es' ? 'Línea Fina' : (language === 'de' ? 'Mikro-Linie' : 'Fine Line')}:</span> {language === 'es' ? 'Estilo Neo-tradicional y fluido de Stiven Hernandez.' : (language === 'de' ? 'Von Stiven Hernandez inspirierter glatter neo-traditioneller Stil.' : 'Stiven Hernandez inspired smooth Neo-traditional style.')}</li>
          <li><span className="text-white font-semibold">Stippling:</span> {language === 'es' ? 'Texturas de puntillismo para sombreado.' : (language === 'de' ? 'Punktierungstexturen für künstlerische Schattierungen.' : 'Dotwork textures for artistic shading.')}</li>
        </ul>
      )
    },
    {
      question: language === 'es' ? "¿Cuánto tiempo toma el procesamiento?" : (language === 'de' ? "Wie lange dauert die Verarbeitung?" : "How long does processing take?"),
      answer: language === 'es'
        ? "La mayoría de los stencils se procesan en 30-60 segundos. Las imágenes complejas pueden tardar un poco más."
        : language === 'de'
        ? "Die meisten Stencils werden innerhalb von 30-60 Sekunden verarbeitet. Komplexe Bilder können etwas länger dauern."
        : "Most stencils are processed within 30-60 seconds. Complex images may take slightly longer."
    },
    {
      question: language === 'es' ? "¿Puedo usar los stencils comercialmente?" : (language === 'de' ? "Kann ich die Stencils kommerziell nutzen?" : "Can I use the stencils commercially?"),
      answer: language === 'es'
        ? "¡Sí! Eres el dueño de todos los stencils que creas. Asegúrate de tener los derechos de la imagen original."
        : language === 'de'
        ? "Ja! Sie besitzen alle Stencils, die Sie erstellen. Stellen Sie nur sicher, dass Sie die Rechte am Originalbild haben."
        : "Yes! You own all stencils you create. Just ensure you have rights to the original image."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {language === 'es' ? 'Volver al Inicio' : (language === 'de' ? 'Zurück zum Start' : 'Back to Home')}
        </button>

        <h1 className="text-4xl font-bold text-white mb-4">{t.supportTitle}</h1>
        <p className="text-zinc-400 mb-12 max-w-2xl">{t.supportSub}</p>

        {/* Contact Section */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-zinc-800 rounded-2xl">
              <Mail className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{language === 'es' ? 'Contacto' : (language === 'de' ? 'Support kontaktieren' : 'Contact Support')}</h2>
              <p className="text-zinc-400 mt-2">
                {language === 'es' ? '¿Tienes alguna pregunta? Envíanos un correo y te responderemos pronto.' : (language === 'de' ? 'Haben Sie eine Frage? Senden Sie uns eine E-Mail und wir werden uns in Kürze bei Ihnen melden.' : 'Have a question? Send us an email and our team will get back to you.')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-8 p-6 bg-black/40 rounded-2xl border border-white/5">
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block mb-1">{language === 'es' ? 'Correo electrónico:' : (language === 'de' ? 'E-Mail an uns:' : 'Email us at:')}</span>
              <a href="mailto:kennygoossens@icloud.com" className="text-lg font-bold text-white hover:underline flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                kennygoossens@icloud.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>{language === 'es' ? 'Respuesta en 24-48 horas' : (language === 'de' ? 'Antwort innerhalb von 24-48 Stunden' : 'Response within 24-48 hours')}</span>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="mt-8 space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'es' ? "Escribe tu mensaje aquí..." : (language === 'de' ? "Schreiben Sie hier Ihre Nachricht..." : "Write your message here...")}
              required
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : sent ? (
                <><CheckCircle className="w-5 h-5" /> {language === 'es' ? '¡Enviado!' : (language === 'de' ? 'Gesendet!' : 'Sent!')}</>
              ) : (
                <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {language === 'es' ? 'Enviar Mensaje' : (language === 'de' ? 'Nachricht senden' : 'Send Message')}</>
              )}
            </button>
          </form>
        </div>

        {/* Search Help */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-white mb-6">{t.searchHelp}</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholderHelp} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
            />
          </div>
        </div>

        {/* FAQ Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 pb-4 border-b border-white/5">{language === 'es' ? 'Preguntas Frecuentes' : (language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions')}</h3>
          <div className="space-y-12">
            {faqs.map((faq, idx) => (
              <div key={idx} className="group">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                  {faq.question}
                </h4>
                <div className="text-zinc-400 leading-relaxed max-w-3xl">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-center">
          <button 
            onClick={onBack}
            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-zinc-200 transition-colors"
          >
            {language === 'es' ? 'Volver al Inicio' : (language === 'de' ? 'Zurück zum Start' : 'Back to Home')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;