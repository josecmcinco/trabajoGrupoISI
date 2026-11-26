package com.siger.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AsignarExclusivaRequest(
		@NotNull(message = "El reportero es obligatorio")
		Long reporteroId,

		@NotNull(message = "La fecha de asignación es obligatoria")
		LocalDate fechaAsignacion
) {
}
