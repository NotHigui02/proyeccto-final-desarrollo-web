import type { Categoria, MovimientoEntrada } from '@gastos/shared';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FormularioMovimiento } from '../components/forms/FormularioMovimiento';
import { EstadoCarga } from '../components/ui/EstadoCarga';
import { EstadoError } from '../components/ui/EstadoError';
import { EstadoVacio } from '../components/ui/EstadoVacio';
import { crearMovimiento, listarCategorias } from '../services/clienteApi';

export function NuevoMovimientoPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estado, setEstado] = useState<'carga' | 'listo' | 'vacio' | 'error'>('carga');
  const [mensajeError, setMensajeError] = useState('No se pudieron cargar las categorías');
  const [aviso, setAviso] = useState<string | null>(null);

  async function cargarCategorias() {
    setEstado('carga');
    try {
      const datos = await listarCategorias();
      setCategorias(datos);
      setEstado(datos.length === 0 ? 'vacio' : 'listo');
    } catch (error) {
      setMensajeError(
        error instanceof Error ? error.message : 'No se pudieron cargar las categorías',
      );
      setEstado('error');
    }
  }

  useEffect(() => {
    void cargarCategorias();
  }, []);

  async function manejarCrear(entrada: MovimientoEntrada) {
    await crearMovimiento(entrada);
    setAviso('Movimiento registrado');
    await navigate('/movimientos');
  }

  return (
    <>
      <title>Nuevo movimiento · Gastos con gráficos</title>
      <h1>Registrar movimiento</h1>

      <p aria-live="polite">{aviso ?? ''}</p>

      {estado === 'carga' ? <EstadoCarga mensaje="Cargando categorías…" /> : null}
      {estado === 'error' ? (
        <EstadoError mensaje={mensajeError} onReintentar={() => void cargarCategorias()} />
      ) : null}
      {estado === 'vacio' ? (
        <>
          <EstadoVacio mensaje="Necesitas al menos una categoría antes de registrar un movimiento." />
          <p>
            <Link to="/categorias">Ir a categorías</Link>
          </p>
        </>
      ) : null}
      {estado === 'listo' ? (
        <FormularioMovimiento
          categorias={categorias}
          textoEnvio="Registrar movimiento"
          onEnviar={manejarCrear}
        />
      ) : null}
    </>
  );
}
