import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTiktok, 
  faTwitch, 
  faYoutube, 
  faInstagram, 
  faFacebook, 
  faDiscord, 
  faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const socialLinks = [
    { name: 'TikTok', href: '#', icon: faTiktok },
    { name: 'Twitch', href: '#', icon: faTwitch },
    { name: 'YouTube', href: '#', icon: faYoutube },
    { name: 'Instagram', href: '#', icon: faInstagram },
    { name: 'Facebook', href: '#', icon: faFacebook },
    { name: 'Discord', href: '#', icon: faDiscord },
    { name: 'WhatsApp', href: '#', icon: faWhatsapp },
  ];

  const explorarLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Season 2026', href: '/season-2026' },
  ];

  const companiaLinks = [
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
    { name: 'FAQ', href: '/faq' },
  ];

  const torneosLinks = [
    { name: 'Nephyx League', href: '/torneos/league' },
    { name: 'Nephyx Circuit', href: '/torneos/circuit' },
    { name: 'Nephyx Clash', href: '/torneos/clash' },
    { name: 'Nephyx Pretemporada', href: '/torneos/pretemporada' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo and Description */}
        <div className="footer-section footer-header">
          <Link href="/" className="footer-logo">
            <Image 
              src="/logos/logo.svg" 
              alt="Nephyx Network" 
              width={100} 
              height={50}
            />
          </Link>
          <p className="footer-description">Competencia profesional de esports en México</p>
          
          {/* Social Links */}
          <div className="social-links">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title={social.name}
                aria-label={social.name}
              >
                <FontAwesomeIcon icon={social.icon} style={{ fontSize: '18px' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="footer-sections">
          <div className="footer-section">
            <h4>EXPLORAR</h4>
            <ul>
              {explorarLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>COMPAÑÍA</h4>
            <ul>
              {companiaLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>TORNEOS</h4>
            <ul>
              {torneosLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Section */}
      <div className="footer-legal">
        <p className="legal-disclaimer">
          Nephyx Esports no está afiliado, respaldado ni patrocinado por Riot Games ni por ninguna entidad oficial relacionada con la producción o gestión de sus juegos. Toda la información, torneos y eventos presentados en este sitio son de carácter independiente.
        </p>
        
        <div className="legal-links">
          <Link href="/privacidad">Política de Privacidad</Link>
          <span className="separator">·</span>
          <Link href="/terminos">Términos del Servicio</Link>
          <span className="separator">·</span>
          <Link href="/reglas">Reglas de Torneo</Link>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; 2025 Nephyx Esports. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
