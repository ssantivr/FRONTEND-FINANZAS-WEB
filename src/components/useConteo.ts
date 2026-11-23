import { useEffect, useRef, useState } from 'react';

const sinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates a number from its previous value to {@code destino} (ease-out, 700 ms), so totals "count up" when the
 * page loads or the period changes. Users who ask for reduced motion get the final value at once.
 */
export function useConteo(destino: number, duracion = 700): number {
  const [valor, setValor] = useState(destino);
  const desde = useRef(0);

  useEffect(() => {
    if (sinMovimiento() || duracion <= 0) {
      desde.current = destino;
      setValor(destino);
      return;
    }
    const inicio = performance.now();
    const origen = desde.current;
    let marco = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - (1 - t) ** 3;
      const actual = origen + (destino - origen) * suave;
      setValor(t < 1 ? actual : destino);
      desde.current = actual;
      if (t < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [destino, duracion]);

  return valor;
}
