import { describe, expect, it } from 'vitest';
import { ActualizarCategoria } from '../src/application/use-cases/actualizar-categoria.js';
import { CrearCategoria } from '../src/application/use-cases/crear-categoria.js';
import { EliminarCategoria } from '../src/application/use-cases/eliminar-categoria.js';
import { ListarCategorias } from '../src/application/use-cases/listar-categorias.js';
import { ErrorConflicto, ErrorNoEncontrado } from '../src/domain/errors/errores-dominio.js';
import { RepositorioCategoriasMemoria } from '../src/infrastructure/memoria/repositorio-categorias-memoria.js';
import { RepositorioMovimientosMemoria } from '../src/infrastructure/memoria/repositorio-movimientos-memoria.js';
import { UID_DEMO } from '../src/infrastructure/memoria/semilla.js';

describe('casos de uso de categorías', () => {
  it('lista las categorías semilla', async () => {
    const categorias = new RepositorioCategoriasMemoria();
    const items = await new ListarCategorias(categorias).ejecutar(UID_DEMO);
    expect(items.length).toBeGreaterThan(0);
  });

  it('crea una categoría nueva', async () => {
    const categorias = new RepositorioCategoriasMemoria([]);
    const creada = await new CrearCategoria(categorias).ejecutar(UID_DEMO, {
      nombre: 'Salud',
      color: '#7C3AED',
    });
    expect(creada.nombre).toBe('Salud');
    expect(creada.id).toBeTruthy();
  });

  it('rechaza nombre duplicado sin distinguir mayúsculas', async () => {
    const categorias = new RepositorioCategoriasMemoria([
      { id: '1', nombre: 'Comida', color: '#E11D48' },
    ]);
    await expect(
      new CrearCategoria(categorias).ejecutar(UID_DEMO, { nombre: 'comida', color: '#111111' }),
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('actualiza una categoría existente', async () => {
    const categorias = new RepositorioCategoriasMemoria([
      { id: '1', nombre: 'Casa', color: '#CA8A04' },
    ]);
    const actualizada = await new ActualizarCategoria(categorias).ejecutar(UID_DEMO, '1', {
      nombre: 'Hogar',
      color: '#CA8A04',
    });
    expect(actualizada.nombre).toBe('Hogar');
  });

  it('no actualiza una categoría inexistente', async () => {
    const categorias = new RepositorioCategoriasMemoria([]);
    await expect(
      new ActualizarCategoria(categorias).ejecutar(UID_DEMO, 'x', {
        nombre: 'X',
        color: '#000000',
      }),
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });

  it('no borra una categoría con movimientos', async () => {
    const categorias = new RepositorioCategoriasMemoria([
      { id: 'comida', nombre: 'Comida', color: '#E11D48' },
    ]);
    const movimientos = new RepositorioMovimientosMemoria();
    await expect(
      new EliminarCategoria(categorias, movimientos).ejecutar(UID_DEMO, 'comida'),
    ).rejects.toBeInstanceOf(ErrorConflicto);
  });

  it('borra una categoría sin movimientos', async () => {
    const categorias = new RepositorioCategoriasMemoria([
      { id: 'extra', nombre: 'Extra', color: '#111111' },
    ]);
    const movimientos = new RepositorioMovimientosMemoria([]);
    await new EliminarCategoria(categorias, movimientos).ejecutar(UID_DEMO, 'extra');
    expect(await categorias.obtener(UID_DEMO, 'extra')).toBeNull();
  });
});
