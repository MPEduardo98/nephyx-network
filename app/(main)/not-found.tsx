import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-logo">
          <Image src="/logos/icon.png" alt="Nephyx" width={120} height={120} />
        </div>

        <h1 className="not-found-code">404</h1>

        <h2 className="not-found-title">Página no encontrada</h2>

        <p className="not-found-description">
          El lugar que estás buscando no existe, o fue movido a otra parte del mapa.
        </p>

        <Link href="/" className="not-found-button">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
