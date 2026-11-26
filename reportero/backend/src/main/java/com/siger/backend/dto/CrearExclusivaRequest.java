package com.siger.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CrearExclusivaRequest(
		@NotNull(message = "La editorial es obligatoria")
		Long editorialId,

		@NotBlank(message = "La temática de la exclusiva es obligatoria")
		@Size(max = 1000, message = "La temática no puede superar los 1000 caracteres")
		String tematica,

		@NotNull(message = "El precio a pagar al reportero es obligatorio")
		@DecimalMin(value = "0.01", message = "El precio a pagar al reportero debe ser mayor que cero")
		BigDecimal precioReportero,

		@NotNull(message = "La fecha de creación es obligatoria")
		LocalDate fechaCreacion
) {
}
