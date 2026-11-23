import { useEffect, useRef, type RefObject } from 'react';

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal focus handling (WCAG 2.4.3): keeps Tab inside `caja`, closes with Escape and gives the focus back to the
 * element that opened the dialog.
 */
export function useTrampaFoco(caja: RefObject<HTMLElement | null>, activa: boolean, onEscape: () => void) {
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    if (!activa) return;
    const anterior = document.activeElement as HTMLElement | null;
    const elementos = () => Array.from(caja.current?.querySelectorAll<HTMLElement>(ENFOCABLES) ?? []);
    if (caja.current && !caja.current.contains(document.activeElement)) {
      (caja.current.querySelector<HTMLElement>('[autofocus]') ?? elementos()[0])?.focus();
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        escape.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const lista = elementos();
      if (lista.length === 0) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      anterior?.focus?.();
    };
  }, [activa, caja]);
}
