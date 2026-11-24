package com.siger.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ActualizarPrecioCategoriaRequest(
		@NotNull(message = "El precio por hoja es obligatorio")
		@DecimalMin(value = "0.01", message = "El precio por hoja debe ser mayor que cero")
		BigDecimal precioPorHoja
) {
}
