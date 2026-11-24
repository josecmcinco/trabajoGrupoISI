package com.siger.backend.dto;

import com.siger.backend.model.Categoria;

import java.math.BigDecimal;

public record CategoriaResponse(
		Long id,
		Integer nivel,
		String nombre,
		BigDecimal precioPorHoja
) {
	public static CategoriaResponse from(Categoria categoria) {
		return new CategoriaResponse(
				categoria.getId(),
				categoria.getNivel(),
				categoria.getNombre(),
				categoria.getPrecioPorHoja()
		);
	}
}
