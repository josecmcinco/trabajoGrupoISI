import { Pelicula } from './pelicula.model';

export interface Alquiler {
  id: number;
  socioId: number;
  socioNombre: string;
  videoclubId: number;
  videoclubCiudad: string;
  fechaRecogida: string; // Formato YYYY-MM-DD
  fechaDevolucion: string;
  totalPagar: number;
  peliculas: Pelicula[];
}

export interface CrearAlquilerRequest {
  socioId: number;
  videoclubId: number;
  peliculaIds: number[];
  fechaRecogida: string;
  fechaDevolucion: string;
}

export interface ModificarDevolucionRequest {
  nuevaFechaDevolucion: string;
  fechaReferenciaUsuario: string;
}
