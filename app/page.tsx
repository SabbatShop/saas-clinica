'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Smartphone, 
  Clock,
  ArrowRight,
  Star,
  Menu,
  X,
  Zap,
  TrendingUp,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* NAVBAR MODERNA */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:shadow-blue-300 transition-all transform group-hover:scale-105">
                M
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                MedControl
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#precos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Preços</a>
              <a href="#depoimentos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
              <button 
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5"
              >
                Começar Grátis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium">Recursos</a>
              <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium">Preços</a>
              <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 font-medium">Depoimentos</a>
              <button 
                onClick={() => router.push('/login')}
                className="block w-full text-left text-gray-600 hover:text-blue-600 font-medium"
              >
                Entrar
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION REDESENHADA */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
        {/* Background Melhorado */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 px-4 py-2 rounded-full text-blue-700 text-sm font-semibold mb-8 shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-4 h-4 fill-blue-600" />
              <span>Novo: Integração com WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Gerencie seu consultório com
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                inteligência e simplicidade
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A plataforma completa para psicólogos, nutricionistas e terapeutas que querem <strong>focar no paciente</strong>, não na burocracia.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button 
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  const recursosSec = document.getElementById('recursos');
                  recursosSec?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Smartphone className="w-5 h-5" />
                Ver Demonstração
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">7 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-6xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 backdrop-blur-sm lg:rounded-3xl lg:p-4">
              <div className="rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 min-h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Dashboard Intuitivo</h3>
                    <p className="text-gray-600 max-w-md">Visualize todos os seus agendamentos, receitas e pacientes em uma interface limpa e moderna</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '2.5k+', label: 'Profissionais ativos' },
              { number: '50k+', label: 'Consultas realizadas' },
              { number: '98%', label: 'Satisfação' },
              { number: '24/7', label: 'Suporte disponível' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION MODERNA */}
      <section id="recursos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> crescer profissionalmente</span>
            </h2>
            <p className="text-lg text-gray-600">Ferramentas poderosas, design simples. É assim que trabalhamos.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Agenda Inteligente',
                desc: 'Visualização diária, semanal e mensal. Confirme consultas por WhatsApp com um clique.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Prontuário Digital',
                desc: 'Histórico completo, anotações seguras e evolução do paciente em um só lugar.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: 'Gestão Financeira',
                desc: 'Controle de receitas, despesas e gráficos automáticos de faturamento.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: 'Segurança Total',
                desc: 'Dados criptografados e backups automáticos. Conforme LGPD.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Gestão de Pacientes',
                desc: 'Cadastro completo, histórico de sessões e lembretes automáticos.',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Relatórios & Insights',
                desc: 'Dashboards visuais para acompanhar o crescimento do seu consultório.',
                color: 'from-pink-500 to-rose-500'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quem usa, recomenda</h2>
            <p className="text-lg text-gray-600">Mais de 2.500 profissionais confiam no MedControl</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Transformou completamente minha rotina. Economizo pelo menos 2 horas por dia em tarefas administrativas.',
                author: 'Dra. Juliana Martins',
                role: 'Psicóloga Clínica',
                avatar: 'JM',
                rating: 5
              },
              {
                quote: 'Interface linda e intuitiva. Meus pacientes elogiam a organização das consultas e lembretes.',
                author: 'Dr. Carlos Eduardo',
                role: 'Nutricionista',
                avatar: 'CE',
                rating: 5
              },
              {
                quote: 'O suporte é excepcional. Qualquer dúvida é resolvida rapidamente. Recomendo muito!',
                author: 'Fernanda Lima',
                role: 'Fisioterapeuta',
                avatar: 'FL',
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Preço justo e transparente</h2>
            <p className="text-lg text-gray-600">Sem surpresas, sem taxas escondidas. Cancele quando quiser.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden relative transform hover:scale-105 transition-transform">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-lg">
                🔥 MAIS POPULAR
              </div>
              
              <div className="p-10 text-white">
                <h3 className="text-lg font-semibold uppercase tracking-wide opacity-90 mb-2">Plano Profissional</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-extrabold">R$ 49</span>
                  <span className="text-xl opacity-80">/mês</span>
                </div>
                <p className="text-blue-100 mb-8">Tudo ilimitado para gerenciar seu consultório com excelência.</p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    'Pacientes Ilimitados',
                    'Agenda Visual Completa',
                    'Prontuário Eletrônico Seguro',
                    'Gestão Financeira Completa',
                    'Emissão de Documentos',
                    'Integração WhatsApp',
                    'Suporte Prioritário 24/7',
                    'Atualizações Gratuitas'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-white text-blue-700 font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  Começar 7 Dias Grátis
                </button>
                <p className="text-center text-sm text-blue-200 mt-4">
                  ✓ Não precisa cartão • ✓ Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar seu consultório?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já economizam horas toda semana.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-white text-blue-700 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1 inline-flex items-center gap-3"
          >
            Começar Agora - É Grátis
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  M
                </div>
                <span className="text-xl font-bold">MedControl</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A plataforma completa para gestão de consultórios de saúde.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Atualizações</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 MedControl. Feito com 💙 para a saúde.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}