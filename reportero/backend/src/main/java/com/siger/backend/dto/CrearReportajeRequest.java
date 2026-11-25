package com.siger.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CrearReportajeRequest(
		@NotNull(message = "El reportero es obligatorio")
		Long reporteroId,

		@NotNull(message = "El número de fotos es obligatorio")
		@Positive(message = "El número de fotos debe ser mayor que cero")
		Integer numeroFotos,

		@NotBlank(message = "La descripción del reportaje es obligatoria")
		@Size(max = 1000, message = "La descripción del reportaje no puede superar los 1000 caracteres")
		String descripcion
) {
}
