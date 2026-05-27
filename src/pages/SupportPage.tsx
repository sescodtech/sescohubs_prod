import { useState } from 'react';
import { MessageCircle, Mail, Phone, HelpCircle, ChevronDown, ChevronUp, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { info } from '../lib/api';

const FAQS = [
  {
    q: 'How long does it take for data to be delivered?',
    a: 'Most data purchases are delivered within seconds of payment. If you experience a delay over 5 minutes, contact us with your transaction reference and we will resolve it immediately.',
  },
  {
    q: 'What happens if I enter the wrong phone number?',
    a: 'Once a transaction is processed and delivered, we cannot reverse it. Please always double-check your number before confirming. If delivery fails, we will retry or refund within 24 hours.',
  },
  {
    q: 'Which networks are supported?',
    a: 'We support MTN, Airtel, Glo, and 9Mobile for data and airtime. For cable TV we support DStv, GOtv, and StarTimes.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All payments are processed by Paystack. You can pay with debit/credit cards, USSD, bank transfer, or Paystack balance.',
  },
  {
    q: 'I paid but my data was not delivered. What do I do?',
    a: 'Go to Transactions, find your order, and click "Retry". If the issue persists, send your transaction reference to support via WhatsApp or email and we will resolve within 30 minutes.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If your order failed and was not delivered, you will receive a full refund within 24–48 hours. Successful deliveries cannot be refunded as the value has already been sent.',
  },
  {
    q: 'Is there a bulk purchase option?',
    a: 'Yes. For bulk or recurring data purchases, contact us on WhatsApp for a custom arrangement and better rates.',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const SUPPORT_PHONE = '08140112803';
  const WHATSAPP_URL = `https://wa.me/234${SUPPORT_PHONE.slice(1)}?text=Hi%20DATAHUB%20Support%2C%20I%20need%20help%20with%20my%20order.`;

  const filteredFaqs = FAQS.filter(
    (f) =>
      !searchTerm ||
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to your backend or a form service like Formspree
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex items-center gap-4">
        <Link to="/app" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Support Center</h1>
          <p className="text-gray-500 text-sm">We're here to help. Average response time: 5 minutes.</p>
        </div>
      </header>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-50 border border-green-100 p-6 rounded-3xl flex flex-col items-center text-center group hover:border-green-300 transition-all hover:shadow-md"
        >
          <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-green-100">
            <MessageCircle size={26} />
          </div>
          <h3 className="font-extrabold text-gray-900 mb-1">WhatsApp Chat</h3>
          <p className="text-xs text-gray-500 font-medium mb-3">Fastest way to reach us</p>
          <span className="text-green-700 font-bold text-sm">{SUPPORT_PHONE}</span>
        </a>

        <a
          href="mailto:sescodtech@gmail.com"
          className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col items-center text-center group hover:border-blue-300 transition-all hover:shadow-md"
        >
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-100">
            <Mail size={26} />
          </div>
          <h3 className="font-extrabold text-gray-900 mb-1">Email Support</h3>
          <p className="text-xs text-gray-500 font-medium mb-3">Response within 2 hours</p>
          <span className="text-blue-700 font-bold text-sm">sescodtech@gmail.com</span>
        </a>

        <a
          href={`tel:+234${SUPPORT_PHONE.slice(1)}`}
          className="bg-purple-50 border border-purple-100 p-6 rounded-3xl flex flex-col items-center text-center group hover:border-purple-300 transition-all hover:shadow-md"
        >
          <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-100">
            <Phone size={26} />
          </div>
          <h3 className="font-extrabold text-gray-900 mb-1">Phone Call</h3>
          <p className="text-xs text-gray-500 font-medium mb-3">Mon – Sun, 8AM – 10PM</p>
          <span className="text-purple-700 font-bold text-sm">{SUPPORT_PHONE}</span>
        </a>
      </div>

      {/* Quick WhatsApp CTA */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-bold">Chat us on WhatsApp right now</p>
            <p className="text-green-100 text-sm">We typically reply within 2–5 minutes</p>
          </div>
        </div>
        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
      </a>

      {/* FAQ */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2 text-lg">
            <HelpCircle size={22} className="text-blue-600" />
            Frequently Asked Questions
          </h3>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100 focus:border-blue-200 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No FAQs match your search.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-blue-600 shrink-0" />
                    : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-gray-600 leading-relaxed bg-gray-50/50">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h3 className="font-extrabold text-gray-900 text-lg mb-2">Send a Message</h3>
        <p className="text-gray-500 text-sm mb-6">Can't find your answer above? We'll get back to you within 2 hours.</p>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h4 className="font-extrabold text-gray-900 mb-2">Message Sent!</h4>
            <p className="text-gray-500 text-sm max-w-sm">We'll respond to your email within 2 hours. For urgent issues, please use WhatsApp.</p>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Your Name</label>
                <input
                  type="text" required
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Adebayo Samuel"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Email</label>
                <input
                  type="email" required
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Message</label>
              <textarea
                required rows={4}
                value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Describe your issue. Include your transaction reference if applicable..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
              />
            </div>
            <button type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
              <Send size={18} /> Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
