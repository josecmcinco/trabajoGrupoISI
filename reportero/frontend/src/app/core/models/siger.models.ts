export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Categoria {
  id: number;
  nivel: number;
  nombre: string;
  precioPorHoja: number;
  precioPorFoto: number;
}

export interface Reportero {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  categoria: Categoria | null;
}

export interface Solicitud {
  id: number;
  fecha: string;
  equipoFotografico: string | null;
  resumenCv: string;
  estado: EstadoSolicitud;
  reportero: Reportero;
}

export interface CrearSolicitudRequest {
  dni: string;
  nombre?: string;
  apellidos?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  telefono?: string;
  fecha?: string;
  equipoFotografico?: string;
  resumenCv: string;
}

export interface AprobarSolicitudRequest {
  categoriaId: number;
}

export interface ActualizarPrecioCategoriaRequest {
  precioPorHoja?: number;
  precioPorFoto?: number;
}

export interface PromocionarReporteroRequest {
  categoriaId: number;
}

export interface Editorial {
  id: number;
  nombre: string;
  cif: string;
  direccion: string;
}

export interface EditorialRequest {
  nombre: string;
  cif: string;
  direccion: string;
}

export interface Reportaje {
  id: number;
  numeroFotos: number;
  descripcion: string;
  fechaCreacion: string;
  reportero: Reportero;
}

export interface CrearReportajeRequest {
  reporteroId: number;
  numeroFotos: number;
  descripcion: string;
}

export interface Albaran {
  id: number;
  reportaje: Reportaje;
  editorial: Editorial;
  precioEditorial: number;
  precioReportero: number;
  beneficioAgencia: number;
  fechaCreacion: string;
}

export interface CrearAlbaranRequest {
  reportajeId: number;
  editorialId: number;
  precioEditorial: number;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}
