export interface EstadisticaSocio {
  id: number;
  socioId: number;
  socioNombre: string;
  mesAnio: string; // Formato YYYY-MM
  fechaCreacion: string;
  totalGastado: number;
}

export interface CalcularEstadisticaRequest {
  socioId: number;
  mesAnio: string;
  fechaOperacion: string;
}
