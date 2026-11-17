import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { EstadoCarga } from '../components/ui/EstadoCarga';

export function ConSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<EstadoCarga mensaje="Cargando página…" />}>{children}</Suspense>;
}
