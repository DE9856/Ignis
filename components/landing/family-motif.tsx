import type { FamilyMotif as Motif } from "@/lib/integration/landing";

/**
 * Small schematic drawings of what each experiment family burned. Diagrams
 * of the setup, not pictures of real flames, and not to scale.
 */
export function FamilyMotif({ motif, id }: { motif: Motif; id: string }) {
  const glow = `motif-glow-${id}`;
  const blue = `motif-blue-${id}`;
  return (
    <svg viewBox="0 0 200 140" aria-hidden className="h-full w-full">
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="rgb(255 214 140)" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="rgb(240 150 70)" stopOpacity="0.35" />
          <stop offset="1" stopColor="rgb(240 120 60)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={blue}>
          <stop offset="0.55" stopColor="rgb(110 160 255)" stopOpacity="0" />
          <stop offset="0.8" stopColor="rgb(120 170 255)" stopOpacity="0.55" />
          <stop offset="1" stopColor="rgb(110 160 255)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {motif === "spread" ? (
        <g>
          <rect x="20" y="78" width="160" height="5" fill="var(--color-line-strong)" />
          <rect x="20" y="78" width="88" height="5" fill="var(--color-mark-muted)" opacity="0.5" />
          <ellipse cx="112" cy="74" rx="26" ry="14" fill={`url(#${glow})`} />
          <ellipse cx="112" cy="74" rx="34" ry="20" fill={`url(#${blue})`} />
          <path
            d="M44 102 h70 l-5 -3 m5 3 l-5 3"
            stroke="var(--color-ink-faint)"
            strokeWidth="1"
            fill="none"
          />
        </g>
      ) : null}

      {motif === "sheet" ? (
        <g>
          <rect x="34" y="22" width="132" height="96" fill="none" stroke="var(--color-line-strong)" />
          <rect x="34" y="22" width="60" height="96" fill="var(--color-mark-muted)" opacity="0.35" />
          <ellipse cx="98" cy="70" rx="16" ry="48" fill={`url(#${glow})`} />
          <ellipse cx="100" cy="70" rx="22" ry="56" fill={`url(#${blue})`} />
        </g>
      ) : null}

      {motif === "smoke" ? (
        <g>
          <rect x="84" y="96" width="32" height="10" fill="var(--color-line-strong)" />
          <rect x="84" y="96" width="32" height="3" fill="rgb(240 150 70)" opacity="0.7" />
          {[
            [92, 84, 2.4],
            [106, 78, 2],
            [98, 66, 3],
            [114, 58, 2.2],
            [88, 52, 2.6],
            [104, 42, 3.2],
            [120, 36, 2],
            [94, 30, 2.4],
            [110, 22, 2.8],
            [80, 40, 1.8],
            [126, 50, 1.6],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="var(--color-ink-faint)" opacity="0.7" />
          ))}
        </g>
      ) : null}

      {motif === "droplet" ? (
        <g>
          <path d="M30 70 H170" stroke="var(--color-line)" strokeWidth="0.75" />
          <circle cx="100" cy="70" r="44" fill={`url(#${blue})`} />
          <circle cx="100" cy="70" r="20" fill={`url(#${glow})`} />
          <circle cx="100" cy="70" r="4" fill="rgb(255 240 215)" />
        </g>
      ) : null}

      {motif === "burner" ? (
        <g>
          <path d="M100 118 V86" stroke="var(--color-line-strong)" strokeWidth="3" />
          <circle cx="100" cy="70" r="40" fill={`url(#${blue})`} />
          <circle cx="100" cy="70" r="26" fill={`url(#${glow})`} opacity="0.7" />
          <circle
            cx="100"
            cy="70"
            r="12"
            fill="none"
            stroke="var(--color-ink-faint)"
            strokeDasharray="1.5 2"
          />
        </g>
      ) : null}

      {motif === "jet" ? (
        <g>
          <rect x="94" y="104" width="12" height="20" fill="var(--color-line-strong)" />
          <path
            d="M70 124 V20 M130 124 V20"
            stroke="var(--color-line)"
            strokeWidth="0.75"
            strokeDasharray="3 3"
          />
          <ellipse cx="100" cy="76" rx="10" ry="30" fill={`url(#${glow})`} />
          <ellipse cx="100" cy="74" rx="16" ry="38" fill={`url(#${blue})`} />
        </g>
      ) : null}
    </svg>
  );
}
