package com.siger.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CrearAlbaranRequest(
		@NotNull(message = "El reportaje es obligatorio")
		Long reportajeId,

		@NotNull(message = "La editorial es obligatoria")
		Long editorialId,

		@NotNull(message = "El precio a cobrar a la editorial es obligatorio")
		@DecimalMin(value = "0.00", inclusive = true, message = "El precio de la editorial no puede ser negativo")
		BigDecimal precioEditorial
) {
}
