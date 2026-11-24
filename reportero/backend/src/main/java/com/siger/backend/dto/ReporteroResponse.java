package com.siger.backend.dto;

import com.siger.backend.model.Reportero;

public record ReporteroResponse(
		Long id,
		String dni,
		String nombre,
		String apellidos,
		String direccion,
		String ciudad,
		String codigoPostal,
		String telefono,
		CategoriaResponse categoria
) {
	public static ReporteroResponse from(Reportero reportero) {
		return new ReporteroResponse(
				reportero.getId(),
				reportero.getDni(),
				reportero.getNombre(),
				reportero.getApellidos(),
				reportero.getDireccion(),
				reportero.getCiudad(),
				reportero.getCodigoPostal(),
				reportero.getTelefono(),
				reportero.getCategoria() != null ? CategoriaResponse.from(reportero.getCategoria()) : null
		);
	}
}
