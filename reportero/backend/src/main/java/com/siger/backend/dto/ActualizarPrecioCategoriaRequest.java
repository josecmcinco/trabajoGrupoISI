package com.siger.backend.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

public record ActualizarPrecioCategoriaRequest(
		@DecimalMin(value = "0.01", message = "El precio por hoja debe ser mayor que cero")
		BigDecimal precioPorHoja,
		@DecimalMin(value = "0.01", message = "El precio por foto debe ser mayor que cero")
		BigDecimal precioPorFoto
) {
	public ActualizarPrecioCategoriaRequest(BigDecimal precioPorHoja) {
		this(precioPorHoja, null);
	}
}
