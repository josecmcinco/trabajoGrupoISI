export interface Socio {
  id: number;
  nombre: string;
  edad: number;
  videoclubOrigenId: number;
  videoclubOrigenCiudad: string;
}

export interface SocioRequest {
  nombre: string;
  edad: number;
  videoclubOrigenId: number;
}
