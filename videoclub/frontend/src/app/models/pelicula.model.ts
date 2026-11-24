export interface Pelicula {
  id: number;
  nombre: string;
  director?: string;
  fechaEstreno: string; // Formato YYYY-MM-DD
  precioAlquiler: number;
  videoclubId: number;
  videoclubCiudad: string;
}

export interface PeliculaRequest {
  nombre: string;
  director?: string;
  fechaEstreno: string;
  precioAlquiler: number;
  videoclubId: number;
}
