import type { RouteObject } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { MesProvider } from '../context/MesProvider';
import { SesionProvider } from '../context/SesionProvider';
import { CategoriasPage } from '../pages/CategoriasPage';
import { InicioPage } from '../pages/InicioPage';
import { LoginPage } from '../pages/LoginPage';
import { MovimientosPage } from '../pages/MovimientosPage';
import { NoEncontradoPage } from '../pages/NoEncontradoPage';
import { NuevoMovimientoPage } from '../pages/NuevoMovimientoPage';
import { GuardiaSesion } from './GuardiaSesion';

export const rutas: RouteObject[] = [
  {
    element: <SesionProvider />,
    children: [
      { path: 'login', element: <LoginPage /> },
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
              { index: true, element: <InicioPage /> },
              { path: 'movimientos', element: <MovimientosPage /> },
              { path: 'movimientos/nuevo', element: <NuevoMovimientoPage /> },
              { path: 'categorias', element: <CategoriasPage /> },
              { path: '*', element: <NoEncontradoPage /> },
            ],
          },
        ],
      },
    ],
  },
];
