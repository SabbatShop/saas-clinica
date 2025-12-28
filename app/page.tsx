'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  CheckCircle, Zap, Shield, Users, 
  ArrowRight, Star, Menu, X, 
  BarChart3, Calendar, Smartphone, FileText 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Agenda Inteligente",
      desc: "Evite conflitos e buracos. Confirmação automática via WhatsApp.",
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Prontuário Seguro",
      desc: "Histórico completo criptografado. Acesse de qualquer lugar.",
      icon: <Shield className="w-6 h-6 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Financeiro Automático",
      desc: "Saiba exatamente quanto você ganhou no mês sem abrir o Excel.",
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      color: "bg-emerald-500"
    },
    {
      title: "Documentos em 1-Click",
      desc: "Gere atestados, recibos e receitas prontos para imprimir.",
      icon: <FileText className="w-6 h-6 text-white" />,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      
      {/* --- BACKGROUND ANIMADO (AURORA) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
        {/* Grid Pattern sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">M</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MedControl</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Preços</a>
            <button 
              onClick={() => router.push('/login')} 
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => router.push('/login')} 
              className="group relative bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Começar Grátis
              <span className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></span>
            </button>
          </div>

          {/* Mobile Button */}
          <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
        >
          <div className="flex flex-col gap-6 text-xl font-medium">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Preços</a>
            <a href="/login" className="text-blue-600">Entrar no Sistema</a>
          </div>
        </motion.div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 shadow-sm mb-8 hover:border-blue-300 transition-colors cursor-pointer"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-600">Versão 2.0 com WhatsApp integrado</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Seu consultório no<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
              piloto automático.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Organize agenda, prontuários e financeiro em um sistema feito para profissionais de saúde que valorizam seu tempo livre.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => router.push('/login')} 
              className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Criar Conta Grátis
            </button>
            <button className="w-full sm:w-auto h-14 px-8 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Smartphone className="w-5 h-5" />
              Ver demonstração
            </button>
          </motion.div>

          {/* DASHBOARD MOCKUP FLUTUANTE */}
          <motion.div 
            style={{ y: y1 }}
            className="mt-20 relative mx-auto max-w-6xl z-10"
          >
            {/* Efeito de brilho atrás do print */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
            
            <div className="relative rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/10">
              <div className="rounded-xl overflow-hidden bg-slate-50 aspect-[16/9] relative group">
                {/* Substituir pelo Print Real */}
                <img 
                  src="https://cdn.dribbble.com/userupload/12476536/file/original-06248c89c894982635951664c39f16d8.png?resize=1600x1200" // Exemplo genérico
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover"
                />
                
                {/* Botão de Play Fake */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all cursor-pointer">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-blue-600 border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section id="features" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Funcionalidades</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Tudo o que você precisa,<br/>nada do que atrapalha.</h3>
            <p className="text-lg text-slate-500">Desenvolvemos cada detalhe pensando em economizar seus cliques. Menos burocracia, mais atendimento.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Feature Destaque (Lado a Lado) */}
          <div className="mt-20 bg-slate-900 rounded-[3rem] p-8 md:p-20 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold mb-6">
                  <Star className="w-3 h-3 fill-current" /> EXCLUSIVO
                </div>
                <h3 className="text-3xl md:text-5xl font-bold mb-6">Seus pacientes no WhatsApp em 1 clique.</h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Pare de salvar contatos manualmente. Com o MedControl, você clica no ícone do WhatsApp e o sistema já abre a conversa com a mensagem de confirmação pronta.
                </p>
                <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors">
                  Ver na prática
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 md:hidden"></div>
                <img 
                  src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=2940&auto=format&fit=crop" 
                  alt="WhatsApp Integration" 
                  className="rounded-2xl shadow-2xl border border-slate-700/50 transform md:rotate-3 hover:rotate-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS / SOCIAL PROOF --- */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Profissionais Ativos", value: "+2.000" },
              { label: "Consultas Agendadas", value: "+150k" },
              { label: "Tempo Economizado", value: "30h/mês" },
              { label: "Satisfação", value: "4.9/5.0" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simples como deve ser.</h2>
            <p className="text-lg text-slate-500">Sem taxas de instalação. Sem fidelidade. Cancele quando quiser.</p>
          </div>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Plano Profissional</h3>
                  <div className="text-slate-400 text-sm mt-1">Tudo incluso</div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-extrabold text-slate-900">R$49</div>
                  <div className="text-slate-400 font-medium">/mês</div>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {[
                  "Pacientes Ilimitados",
                  "Agenda Inteligente",
                  "Prontuário Criptografado",
                  "Gestão Financeira",
                  "Disparo de WhatsApp",
                  "Suporte Humanizado"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => router.push('/login')} 
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:-translate-y-1"
              >
                Testar Grátis por 7 dias
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">Não pedimos cartão de crédito no teste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold text-white">MedControl</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
            <div className="text-sm text-slate-500">
              © 2025 MedControl Inc.
            </div>
          </div>
        </div>
      </footer>
      
      {/* CSS para Animações Extras */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}