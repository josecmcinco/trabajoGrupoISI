package com.siger.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AprobarSolicitudRequest(
		@NotNull(message = "La categoría de ingreso es obligatoria")
		Long categoriaId
) {
}
