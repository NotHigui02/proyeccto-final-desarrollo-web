import { TAMANO_MAX_COMPROBANTE_BYTES, TIPOS_COMPROBANTE_PERMITIDOS } from '@gastos/shared';
import { upload } from '@vercel/blob/client';
import { useId, useState } from 'react';
import { useSesion } from '../../context/sesion';
import { extensionDeArchivo, reducirArchivoSiEsImagen } from '../../lib/reducirImagen';
import {
  eliminarComprobante,
  ErrorApi,
  registrarComprobante,
  urlComprobante,
} from '../../services/clienteApi';
import styles from './SubidaComprobante.module.css';

interface Props {
  movimientoId: string;
  comprobanteUrl: string | null;
  onCambio: (url: string | null) => void;
}

export function SubidaComprobante({ movimientoId, comprobanteUrl, onCambio }: Props) {
  const { estado } = useSesion();
  const idInput = useId();
  const idProgreso = useId();
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = estado.tipo === 'autenticado' ? estado.usuario.uid : null;

  async function manejarArchivo(archivo: File | undefined) {
    if (!archivo || !uid) return;
    setError(null);

    if (!(TIPOS_COMPROBANTE_PERMITIDOS as readonly string[]).includes(archivo.type)) {
      setError('Solo se permiten JPEG, PNG, WebP o PDF');
      return;
    }

    setSubiendo(true);
    setProgreso(0);
    try {
      const reducido = await reducirArchivoSiEsImagen(archivo);
      if (reducido.size > TAMANO_MAX_COMPROBANTE_BYTES) {
        setError('El archivo supera el tamaño máximo permitido (4 MiB)');
        return;
      }

      const extension = extensionDeArchivo(archivo);
      const pathname = `usuarios/${uid}/comprobantes/${movimientoId}.${extension}`;
      const blob = await upload(pathname, reducido, {
        access: 'private',
        handleUploadUrl: '/api/comprobantes/upload',
        contentType: archivo.type,
        multipart: reducido.size > 1_000_000,
        onUploadProgress: (evento) => {
          setProgreso(Math.round(evento.percentage));
        },
      });

      const movimiento = await registrarComprobante(movimientoId, { pathname: blob.pathname });
      onCambio(movimiento.comprobanteUrl);
      setProgreso(100);
    } catch (err) {
      setError(
        err instanceof ErrorApi
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo subir el comprobante',
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function manejarEliminar() {
    setError(null);
    setSubiendo(true);
    try {
      const movimiento = await eliminarComprobante(movimientoId);
      onCambio(movimiento.comprobanteUrl);
      setProgreso(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el comprobante');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className={styles.bloque}>
      <p className={styles.estado}>
        {comprobanteUrl ? 'Hay un comprobante adjunto.' : 'Sin comprobante adjunto.'}
      </p>

      {comprobanteUrl ? (
        <div className={styles.acciones}>
          <a
            className={styles.enlace}
            href={urlComprobante(movimientoId)}
            target="_blank"
            rel="noreferrer"
          >
            Ver comprobante
          </a>
          <button
            type="button"
            className={styles.boton}
            disabled={subiendo}
            onClick={() => void manejarEliminar()}
          >
            Quitar comprobante
          </button>
        </div>
      ) : (
        <div className={styles.acciones}>
          <label htmlFor={idInput} className={`${styles.boton} ${styles.botonPrimario}`}>
            {subiendo ? 'Subiendo…' : 'Adjuntar comprobante'}
          </label>
          <input
            id={idInput}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            hidden
            disabled={subiendo || !uid}
            onChange={(evento) => {
              const archivo = evento.target.files?.[0];
              evento.target.value = '';
              void manejarArchivo(archivo);
            }}
          />
        </div>
      )}

      {subiendo || progreso > 0 ? (
        <div>
          <label htmlFor={idProgreso} className={styles.estado}>
            Progreso de subida: {progreso} %
          </label>
          <progress
            id={idProgreso}
            className={styles.progreso}
            max={100}
            value={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progreso}
          />
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
