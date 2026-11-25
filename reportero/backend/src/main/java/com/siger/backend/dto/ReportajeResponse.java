package com.siger.backend.dto;

import com.siger.backend.model.Reportaje;

import java.time.LocalDateTime;

public record ReportajeResponse(
		Long id,
		Integer numeroFotos,
		String descripcion,
		LocalDateTime fechaCreacion,
		ReporteroResponse reportero
) {
	public static ReportajeResponse from(Reportaje reportaje) {
		return new ReportajeResponse(
				reportaje.getId(),
				reportaje.getNumeroFotos(),
				reportaje.getDescripcion(),
				reportaje.getFechaCreacion(),
				ReporteroResponse.from(reportaje.getReportero())
		);
	}
}
