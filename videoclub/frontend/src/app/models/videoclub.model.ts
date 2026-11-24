export interface Videoclub {
  id: number;
  nombreGerente: string;
  ciudad: string;
  calle: string;
  codigoPostal: string;
}

export interface VideoclubRequest {
  nombreGerente: string;
  ciudad: string;
  calle: string;
  codigoPostal: string;
}
