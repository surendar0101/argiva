export function Ghungroo() {
  const bells = Array.from({ length: 9 }, (_, i) => 20 + i * 40);
  return (
    <svg viewBox="0 0 360 28" width="360" height="28" aria-hidden="true" focusable="false">
      <path d="M0 8 H360" stroke="currentColor" strokeWidth="1" fill="none" pathLength={1} />
      {bells.map((x) => (
        <g key={x}>
          <path d={`M${x} 8 v4`} stroke="currentColor" strokeWidth="1" />
          <circle cx={x} cy={18} r={5.5} fill="none" stroke="currentColor" strokeWidth="1" />
          <path d={`M${x - 3} 20.5 h6`} stroke="currentColor" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}
