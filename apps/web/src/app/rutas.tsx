import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { MesProvider } from '../context/MesProvider';
import { SesionProvider } from '../context/SesionProvider';
import { ConSuspense } from './ConSuspense';
import { GuardiaSesion } from './GuardiaSesion';

const LoginPage = lazy(async () => {
  const modulo = await import('../pages/LoginPage');
  return { default: modulo.LoginPage };
});
const InicioPage = lazy(async () => {
  const modulo = await import('../pages/InicioPage');
  return { default: modulo.InicioPage };
});
const MovimientosPage = lazy(async () => {
  const modulo = await import('../pages/MovimientosPage');
  return { default: modulo.MovimientosPage };
});
const NuevoMovimientoPage = lazy(async () => {
  const modulo = await import('../pages/NuevoMovimientoPage');
  return { default: modulo.NuevoMovimientoPage };
});
const CategoriasPage = lazy(async () => {
  const modulo = await import('../pages/CategoriasPage');
  return { default: modulo.CategoriasPage };
});
const NoEncontradoPage = lazy(async () => {
  const modulo = await import('../pages/NoEncontradoPage');
  return { default: modulo.NoEncontradoPage };
});

export const rutas: RouteObject[] = [
  {
    element: <SesionProvider />,
    children: [
      {
        path: 'login',
        element: (
          <ConSuspense>
            <LoginPage />
          </ConSuspense>
        ),
      },
      {
        element: <GuardiaSesion />,
        children: [
          {
            element: (
              <MesProvider>
                <AppLayout />
              </MesProvider>
            ),
            children: [
              {
                index: true,
                element: (
                  <ConSuspense>
                    <InicioPage />
                  </ConSuspense>
                ),
              },
              {
                path: 'movimientos',
                element: (
                  <ConSuspense>
                    <MovimientosPage />
                  </ConSuspense>
                ),
              },
              {
                path: 'movimientos/nuevo',
                element: (
                  <ConSuspense>
                    <NuevoMovimientoPage />
                  </ConSuspense>
                ),
              },
              {
                path: 'categorias',
                element: (
                  <ConSuspense>
                    <CategoriasPage />
                  </ConSuspense>
                ),
              },
              {
                path: '*',
                element: (
                  <ConSuspense>
                    <NoEncontradoPage />
                  </ConSuspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
