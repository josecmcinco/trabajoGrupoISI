package com.siger.backend.dto;

import com.siger.backend.model.EstadoExclusiva;
import com.siger.backend.model.Exclusiva;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExclusivaResponse(
		Long id,
		EditorialResponse editorial,
		String tematica,
		BigDecimal precioReportero,
		EstadoExclusiva estado,
		ReporteroResponse reportero,
		LocalDate fechaCreacion,
		LocalDate fechaAsignacion,
		LocalDate fechaFinalizacion
) {
	public static ExclusivaResponse from(Exclusiva exclusiva) {
		return new ExclusivaResponse(
				exclusiva.getId(),
				EditorialResponse.from(exclusiva.getEditorial()),
				exclusiva.getTematica(),
				exclusiva.getPrecioReportero(),
				exclusiva.getEstado(),
				exclusiva.getReportero() != null ? ReporteroResponse.from(exclusiva.getReportero()) : null,
				exclusiva.getFechaCreacion(),
				exclusiva.getFechaAsignacion(),
				exclusiva.getFechaFinalizacion()
		);
	}
}
