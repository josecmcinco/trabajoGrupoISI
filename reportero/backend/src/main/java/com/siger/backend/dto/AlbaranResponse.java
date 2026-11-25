package com.siger.backend.dto;

import com.siger.backend.model.Albaran;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlbaranResponse(
		Long id,
		ReportajeResponse reportaje,
		EditorialResponse editorial,
		BigDecimal precioEditorial,
		BigDecimal precioReportero,
		BigDecimal beneficioAgencia,
		LocalDateTime fechaCreacion
) {
	public static AlbaranResponse from(Albaran albaran) {
		return new AlbaranResponse(
				albaran.getId(),
				ReportajeResponse.from(albaran.getReportaje()),
				EditorialResponse.from(albaran.getEditorial()),
				albaran.getPrecioEditorial(),
				albaran.getPrecioReportero(),
				albaran.getPrecioEditorial().subtract(albaran.getPrecioReportero()),
				albaran.getFechaCreacion()
		);
	}
}
