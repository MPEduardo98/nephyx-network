import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faChevronRight, faMedal,
  faArrowTrendUp, faArrowTrendDown, faMinus,
} from '@fortawesome/free-solid-svg-icons';
import TeamLogo from '@/global/components/TeamLogo';
import type { RowDataPacket } from 'mysql2';
import '@/global/styles/ranking-table.css';

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
  return (
    <section className="home-section home-section-alt">
      {/* Cabecera de sección */}
      <div className="home-section-header">
        <div>
          <h2 className="home-section-title">
            <FontAwesomeIcon icon={faChartLine} className="home-section-icon" />
            Ranking de equipos
          </h2>
          <p className="home-section-sub">Clasificatoria 2026</p>
        </div>
        <Link href="/clasificatoria" className="home-see-all">
          Ver ranking completo <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>

      {/* Tabla */}
      {ranking.length === 0 ? (
        <div className="rt-empty">
          <FontAwesomeIcon icon={faChartLine} />
          <p>No hay datos de clasificación disponibles.</p>
        </div>
      ) : (
        <div className="rt-table">

          {/* Header */}
          <div className="rt-header">
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
            const rank   = idx + 1;
            const wr     = calcWR(team.victorias, team.partidas);
            const wrStr  = wr !== null ? `${wr.toFixed(0)}%` : '—';
            const wrCls  = wr === null ? '' : wr >= 60 ? 'wr-high' : wr >= 40 ? 'wr-mid' : 'wr-low';
            const trend  = trendIcon(wr);

            return (
              <div
                key={team.equipo_id}
                className={`rt-row${rank === 1 ? ' rt-row--first' : ''}`}
              >
                {/* # */}
                <span className="rt-pos">{rankBadge(rank)}</span>

                {/* Equipo */}
                <Link href={`/equipo/@${team.iniciales}`} className="rt-team">
                  <TeamLogo
                    iniciales={team.iniciales}
                    nombre={team.nombre}
                    size={28}
                  />
                  <span className="rt-name">{team.nombre}</span>
                </Link>

                {/* PJ */}
                <span className="rt-center rt-stat">{team.partidas}</span>

                {/* V */}
                <span className="rt-center rt-wins">{team.victorias}</span>

                {/* D */}
                <span className="rt-center rt-losses">{team.derrotas}</span>

                {/* WR% */}
                <span className={`rt-center rt-wr ${wrCls}`}>{wrStr}</span>

                {/* Pts */}
                <span className="rt-center rt-pts">{team.puntos}</span>

                {/* Tendencia */}
                <span className={`rt-center rt-trend ${trend.cls}`}>
                  <FontAwesomeIcon icon={trend.icon} />
                </span>
              </div>
            );
          })}

        </div>
      )}
    </section>
  );
}