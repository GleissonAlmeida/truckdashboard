import React from 'react';

interface ClusterDialProps {
  type: 'rpm' | 'speed';
  value: number; // Current primary value
  subValue: number; // Embedded sub-meter value (Coolant Temp for RPM, Fuel Level for Speed)
  maxValue?: number;
  label: string;
  unit: string;
  subLabel: string;
  subUnit: string;
}

export const ClusterDial: React.FC<ClusterDialProps> = ({
  type,
  value,
  subValue,
  maxValue = type === 'rpm' ? 3000 : 140,
  label,
  unit,
  subLabel,
  subUnit,
}) => {
  // Angular range for main dial: 220 degrees sweep, starting from -200 deg (bottom-left) to +20 deg (bottom-right)
  const startAngle = -215;
  const endAngle = 35;
  const totalSweep = endAngle - startAngle; // 250 degrees

  // Clamped value
  const clampedVal = Math.max(0, Math.min(maxValue, value));
  const normalizedVal = clampedVal / maxValue;
  const needleAngle = startAngle + normalizedVal * totalSweep;

  // Center coordinate and radius
  const cx = 150;
  const cy = 150;
  const r = 120;

  // Generate tick marks
  const numMajorTicks = type === 'rpm' ? 6 : 7; // RPM: 0, 500, 1000, 1500, 2000, 2500, 3000. Speed: 0, 20, 40, 60, 80, 100, 120, 140
  const ticks = [];

  for (let i = 0; i <= numMajorTicks; i++) {
    const fraction = i / numMajorTicks;
    const angleDeg = startAngle + fraction * totalSweep;
    const angleRad = (angleDeg * Math.PI) / 180;

    const tickVal = Math.round(fraction * maxValue);
    const displayVal = type === 'rpm' ? `${tickVal / 100}` : `${tickVal}`;

    const x1 = cx + (r - 12) * Math.cos(angleRad);
    const y1 = cy + (r - 12) * Math.sin(angleRad);
    const x2 = cx + r * Math.cos(angleRad);
    const y2 = cy + r * Math.sin(angleRad);

    const textX = cx + (r - 28) * Math.cos(angleRad);
    const textY = cy + (r - 28) * Math.sin(angleRad);

    // Color zone highlight
    let tickColor = '#94a3b8';
    if (type === 'rpm') {
      if (tickVal >= 1000 && tickVal <= 1600) tickColor = '#10b981'; // Eco zone
      else if (tickVal >= 2300) tickColor = '#ef4444'; // Red line
    } else {
      if (tickVal === 80 || tickVal === 90) tickColor = '#06b6d4'; // Highway cruise zone
      else if (tickVal >= 120) tickColor = '#f59e0b';
    }

    ticks.push({
      x1,
      y1,
      x2,
      y2,
      textX,
      textY,
      val: displayVal,
      color: tickColor,
      isMajor: true,
    });

    // Sub-ticks
    if (i < numMajorTicks) {
      for (let s = 1; s <= 3; s++) {
        const subFrac = fraction + (s / 4) * (1 / numMajorTicks);
        const subAngleDeg = startAngle + subFrac * totalSweep;
        const subAngleRad = (subAngleDeg * Math.PI) / 180;
        const sx1 = cx + (r - 6) * Math.cos(subAngleRad);
        const sy1 = cy + (r - 6) * Math.sin(subAngleRad);
        const sx2 = cx + r * Math.cos(subAngleRad);
        const sy2 = cy + r * Math.sin(subAngleRad);
        ticks.push({
          x1: sx1,
          y1: sy1,
          x2: sx2,
          y2: sy2,
          isMajor: false,
          color: '#475569',
        });
      }
    }
  }

  // Sub-gauge arc calculations (Coolant 40-120°C or Fuel 0-100%)
  // Situated at bottom center of dial
  const subMin = type === 'rpm' ? 40 : 0;
  const subMax = type === 'rpm' ? 120 : 100;
  const subClamped = Math.max(subMin, Math.min(subMax, subValue));
  const subPct = (subClamped - subMin) / (subMax - subMin);
  const subAngleStart = 135;
  const subAngleEnd = 45; // Across bottom
  const subSweep = 90;
  const subNeedleAngle = subAngleStart - subPct * subSweep;

  const isSubWarning =
    type === 'rpm'
      ? subValue >= 102 // Coolant overheat
      : subValue <= 15; // Low fuel

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cluster-bezel p-3 border-4 border-slate-800 shadow-2xl flex items-center justify-center">
        <div className="w-full h-full rounded-full cluster-dial-surface relative flex items-center justify-center overflow-hidden border border-slate-700/60">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {/* Background circular guide ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Colored Arcs for Bands */}
            {type === 'rpm' && (
              <>
                {/* Eco Green Band (1000 - 1600 RPM) */}
                <path
                  d="M 68 108 A 120 120 0 0 1 150 30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeOpacity="0.8"
                />
                {/* Red danger zone (2300 - 3000 RPM) */}
                <path
                  d="M 226 68 A 120 120 0 0 1 254 130"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeOpacity="0.8"
                />
              </>
            )}

            {type === 'speed' && (
              <>
                {/* Cruising 80-90 km/h truck limiter zone */}
                <path
                  d="M 175 32 A 120 120 0 0 1 216 58"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="5"
                  strokeOpacity="0.8"
                />
              </>
            )}

            {/* Ticks and Numerical Labels */}
            {ticks.map((t, idx) => (
              <g key={idx}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.color}
                  strokeWidth={t.isMajor ? 2.5 : 1.2}
                />
                {t.isMajor && t.val && (
                  <text
                    x={t.textX}
                    y={t.textY}
                    fill={t.color}
                    fontSize="13"
                    fontFamily="var(--font-gauge)"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {t.val}
                  </text>
                )}
              </g>
            ))}

            {/* Main Dial Name & Multiplier */}
            <text
              x={cx}
              y={cy - 45}
              fill="#94a3b8"
              fontSize="12"
              fontFamily="var(--font-sans)"
              fontWeight="600"
              letterSpacing="1"
              textAnchor="middle"
            >
              {label.toUpperCase()}
            </text>
            <text
              x={cx}
              y={cy - 30}
              fill="#64748b"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {type === 'rpm' ? '1/min x 100' : 'km/h'}
            </text>

            {/* SUB-GAUGE: Embedded Coolant Temp or Fuel Level (Arc in lower section) */}
            <g transform={`translate(${cx}, ${cy + 45})`}>
              {/* Sub-gauge background track */}
              <path
                d="M -45 10 A 50 50 0 0 1 45 10"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
              />
              {/* Sub-gauge active color track */}
              <path
                d="M -45 10 A 50 50 0 0 1 45 10"
                fill="none"
                stroke={
                  type === 'rpm'
                    ? isSubWarning
                      ? '#ef4444'
                      : '#3b82f6'
                    : isSubWarning
                    ? '#f59e0b'
                    : '#10b981'
                }
                strokeWidth="4"
                strokeDasharray={`${subPct * 110} 200`}
              />

              {/* Sub-gauge icon and labels */}
              <text
                x="0"
                y="-6"
                fill={isSubWarning ? (type === 'rpm' ? '#ef4444' : '#f59e0b') : '#94a3b8'}
                fontSize="10"
                fontFamily="var(--font-gauge)"
                fontWeight="700"
                textAnchor="middle"
              >
                {subLabel}: {Math.round(subValue)} {subUnit}
              </text>
              <text
                x="-45"
                y="24"
                fill="#64748b"
                fontSize="8"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {type === 'rpm' ? '40°' : 'E'}
              </text>
              <text
                x="45"
                y="24"
                fill="#64748b"
                fontSize="8"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {type === 'rpm' ? '120°' : 'F'}
              </text>
            </g>

            {/* Physical Needle with Smooth Spring Rotation */}
            <g
              transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
              className="transition-transform duration-75 ease-out"
            >
              {/* Needle Shadow */}
              <line
                x1={cx - 16}
                y1={cy + 2}
                x2={cx + r - 12}
                y2={cy + 2}
                stroke="#000000"
                strokeWidth="4"
                opacity="0.4"
                strokeLinecap="round"
              />
              {/* Needle Body */}
              <polygon
                points={`${cx - 18},${cy - 2} ${cx + r - 12},${cy} ${cx - 18},${cy + 2}`}
                fill={type === 'rpm' ? '#06b6d4' : '#f8fafc'}
                className={type === 'rpm' ? 'cluster-glow-cyan' : ''}
              />
              <line
                x1={cx}
                y1={cy}
                x2={cx + r - 10}
                y2={cy}
                stroke={type === 'rpm' ? '#22d3ee' : '#38bdf8'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Needle Center Bezel Cap */}
            <circle cx={cx} cy={cy} r="16" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="8" fill="#334155" />
            <circle cx={cx} cy={cy} r="3" fill="#06b6d4" />
          </svg>

          {/* Digital ODO/Value display badge */}
          <div className="absolute bottom-5 flex flex-col items-center">
            <span className="font-mono tabular-nums text-2xl font-bold text-white tracking-wider font-gauge">
              {type === 'rpm' ? Math.round(value) : value.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase -mt-0.5">
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
