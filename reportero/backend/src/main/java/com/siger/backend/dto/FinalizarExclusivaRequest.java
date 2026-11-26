package com.siger.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record FinalizarExclusivaRequest(
		@NotNull(message = "La fecha de finalización es obligatoria")
		LocalDate fechaFinalizacion
) {
}
