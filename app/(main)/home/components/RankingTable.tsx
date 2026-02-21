import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMedal,
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import TeamLogo from '@/global/components/TeamLogo';
import type { RowDataPacket } from 'mysql2';

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface RankingRow extends RowDataPacket {
  equipo_id: number;
  nombre: string;
  iniciales: string;
  puntos: number;
  victorias: number;
  derrotas: number;
  partidas: number;
}

interface Props {
  ranking: RankingRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcWR(victorias: number, partidas: number) {
  if (partidas === 0) return null;
  return (victorias / partidas) * 100;
}

function trendIcon(wr: number | null) {
  if (wr === null) return { icon: faMinus,          cls: 'trend-flat' };
  if (wr >= 60)    return { icon: faArrowTrendUp,   cls: 'trend-up'   };
  if (wr >= 40)    return { icon: faMinus,          cls: 'trend-flat' };
  return              { icon: faArrowTrendDown, cls: 'trend-down' };
}

function rankBadge(rank: number) {
  if (rank === 1) return <FontAwesomeIcon icon={faMedal} className="medal-gold"   />;
  if (rank === 2) return <FontAwesomeIcon icon={faMedal} className="medal-silver" />;
  if (rank === 3) return <FontAwesomeIcon icon={faMedal} className="medal-bronze" />;
  return <>{rank}</>;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function RankingTable({ ranking }: Props) {
  if (ranking.length === 0) {
    return (
      <div className="home-empty">
        <p>No hay datos de clasificación disponibles.</p>
      </div>
    );
  }

  return (
    <div className="home-ranking-wrap">

      {/* Cabecera de columnas */}
      <div className="home-ranking-cols">
        <span>#</span>
        <span>Equipo</span>
        <span className="rt-center">PJ</span>
        <span className="rt-center">V</span>
        <span className="rt-center">D</span>
        <span className="rt-center">WR%</span>
        <span className="rt-center">Pts</span>
        <span className="rt-center">Tendencia</span>
      </div>

      {/* Filas */}
      {ranking.map((team, idx) => {
        const rank  = idx + 1;
        const wr    = calcWR(team.victorias, team.partidas);
        const wrStr = wr !== null ? `${wr.toFixed(0)}%` : '—';
        const wrCls = wr === null ? '' : wr >= 60 ? 'wr-high' : wr >= 40 ? 'wr-mid' : 'wr-low';
        const trend = trendIcon(wr);

        return (
          <div
            key={team.equipo_id}
            className={`home-ranking-row${rank === 1 ? ' home-ranking-row--first' : ''}`}
          >
            {/* # */}
            <span className="home-ranking-pos">{rankBadge(rank)}</span>

            {/* Equipo */}
            <Link href={`/equipo/@${team.iniciales}`} className="home-ranking-team">
              <TeamLogo iniciales={team.iniciales} nombre={team.nombre} size={28} />
              <span className="home-ranking-name">{team.nombre}</span>
            </Link>

            {/* PJ */}
            <span className="home-ranking-cell rt-center">{team.partidas}</span>

            {/* V */}
            <span className="home-ranking-wins">{team.victorias}</span>

            {/* D */}
            <span className="home-ranking-losses">{team.derrotas}</span>

            {/* WR% */}
            <span className={`home-ranking-wr ${wrCls}`}>{wrStr}</span>

            {/* Pts */}
            <span className="home-ranking-pts">{team.puntos}</span>

            {/* Tendencia */}
            <span className={`home-ranking-trend rt-center ${trend.cls}`}>
              <FontAwesomeIcon icon={trend.icon} />
            </span>
          </div>
        );
      })}

    </div>
  );
}