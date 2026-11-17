import type { RouteObject } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { CategoriasPage } from '../pages/CategoriasPage';
import { InicioPage } from '../pages/InicioPage';
import { MovimientosPage } from '../pages/MovimientosPage';
import { NoEncontradoPage } from '../pages/NoEncontradoPage';
import { NuevoMovimientoPage } from '../pages/NuevoMovimientoPage';

export const rutas: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'movimientos', element: <MovimientosPage /> },
      { path: 'movimientos/nuevo', element: <NuevoMovimientoPage /> },
      { path: 'categorias', element: <CategoriasPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
];
