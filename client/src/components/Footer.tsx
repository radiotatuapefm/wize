import { Link } from "wouter";
import { Mail, Phone, Linkedin, Globe, Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center glow-purple">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg gradient-text-purple">MIX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Marketplace regional conectando vendedores locais a compradores com experiência moderna, segura e eficiente.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explorar Produtos
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Vender
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Credits */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Desenvolvido por</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Julio Cesar Campos Machado</p>
                <p className="text-xs text-muted-foreground">Full Stack Developer</p>
                <p className="text-xs text-muted-foreground">Like Look Solutions</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:+5511992946628"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  +55 11 99294-6628
                </a>
                <a
                  href="mailto:juliocamposmachado@gmail.com"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
                <a
                  href="https://www.linkedin.com/in/juliocamposmachado/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                </a>
                <a
                  href="https://likelook.wixsite.com/solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  Like Look Solutions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MIX Jaraguá do Sul. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido com ❤️ por <span className="font-semibold text-foreground">Julio Cesar Campos Machado</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
