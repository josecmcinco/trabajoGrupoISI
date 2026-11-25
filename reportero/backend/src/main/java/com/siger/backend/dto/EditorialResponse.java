package com.siger.backend.dto;

import com.siger.backend.model.Editorial;

public record EditorialResponse(
		Long id,
		String nombre,
		String cif,
		String direccion
) {
	public static EditorialResponse from(Editorial editorial) {
		return new EditorialResponse(
				editorial.getId(),
				editorial.getNombre(),
				editorial.getCif(),
				editorial.getDireccion()
		);
	}
}
