import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, Linkedin, Globe, Code2, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 animated-bg opacity-60" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "var(--wize-purple)" }} />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                  Sobre o <span className="gradient-text-purple">MIX</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Um marketplace regional moderno, seguro e eficiente que conecta vendedores locais a compradores de Jaraguá do Sul.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-black mb-6">Sobre a Plataforma</h2>
                <p className="text-muted-foreground mb-4">
                  O MIX Jaraguá do Sul é uma plataforma de e-commerce desenvolvida com as mais modernas tecnologias web, oferecendo uma experiência premium e segura para compradores e vendedores da região.
                </p>
                <p className="text-muted-foreground mb-6">
                  Com design dark mode elegante, integração de pagamentos via Stripe, upload de imagens em nuvem (S3), sistema de chat em tempo real com moderação por IA, e controle total de vendedores sobre seus produtos, o MIX é a solução ideal para quem quer vender online com confiança.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <Zap className="w-6 h-6 text-primary mb-2" />
                    <p className="text-sm font-semibold">Rápido</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <Shield className="w-6 h-6 text-primary mb-2" />
                    <p className="text-sm font-semibold">Seguro</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <TrendingUp className="w-6 h-6 text-primary mb-2" />
                    <p className="text-sm font-semibold">Escalável</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30" style={{ background: "linear-gradient(135deg, var(--wize-purple), var(--wize-blue))" }} />
                <div className="relative rounded-2xl p-8 bg-card border border-border">
                  <Code2 className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Stack Moderno</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ React 19 + Tailwind CSS 4</li>
                    <li>✓ Express.js + tRPC</li>
                    <li>✓ MySQL + Drizzle ORM</li>
                    <li>✓ Stripe Payments</li>
                    <li>✓ AWS S3 Storage</li>
                    <li>✓ LLM Moderation</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-16 md:py-24 border-t border-border/50">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">Desenvolvido por</h2>

              <div className="rounded-2xl p-8 md:p-12 bg-gradient-to-br from-card to-popover border border-border">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-2">Julio Cesar Campos Machado</h3>
                    <p className="text-lg text-primary font-semibold mb-1">Full Stack Developer</p>
                    <p className="text-muted-foreground">Like Look Solutions</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Desenvolvedor Full Stack com experiência em criar aplicações web modernas, escaláveis e focadas em experiência do usuário. Especializado em React, Node.js, e arquitetura de sistemas distribuídos.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Especialidades</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Full Stack Development</li>
                      <li>• React & TypeScript</li>
                      <li>• Node.js & Express</li>
                      <li>• Database Design</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Tecnologias</p>
                    <ul className="space-y-1 text-sm">
                      <li>• React, Next.js, Tailwind</li>
                      <li>• Node.js, Express, tRPC</li>
                      <li>• MySQL, PostgreSQL</li>
                      <li>• AWS, Docker, Git</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="tel:+5511992946628"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    +55 11 99294-6628
                  </a>
                  <a
                    href="mailto:juliocamposmachado@gmail.com"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <a
                    href="https://www.linkedin.com/in/juliocamposmachado/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a
                    href="https://likelook.wixsite.com/solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 border-t border-border/50">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Pronto para começar?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Explore o marketplace MIX Jaraguá do Sul e descubra produtos incríveis de vendedores locais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/marketplace">
                  <Button size="lg" className="gradient-purple text-white font-bold px-8 rounded-xl glow-purple hover:opacity-90 transition-opacity">
                    Explorar Marketplace
                  </Button>
                </a>
                <a href="/dashboard">
                  <Button size="lg" variant="outline" className="border-border hover:border-primary hover:text-primary px-8 rounded-xl font-bold">
                    Começar a Vender
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
