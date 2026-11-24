package com.siger.backend.dto;

import jakarta.validation.constraints.NotNull;

public record PromocionarReporteroRequest(
		@NotNull(message = "La categoría destino es obligatoria")
		Long categoriaId
) {
}
