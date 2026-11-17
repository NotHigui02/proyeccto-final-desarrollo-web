import { Link } from 'react-router';

export function NoEncontradoPage() {
  return (
    <>
      <title>Página no encontrada · Gastos con gráficos</title>
      <h1>Página no encontrada</h1>
      <p>
        La página que buscas no existe. <Link to="/">Volver al resumen</Link>
      </p>
    </>
  );
}
