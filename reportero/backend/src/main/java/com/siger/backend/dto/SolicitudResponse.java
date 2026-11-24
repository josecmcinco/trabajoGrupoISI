package com.siger.backend.dto;

import com.siger.backend.model.EstadoSolicitud;
import com.siger.backend.model.Solicitud;

import java.time.LocalDate;

public record SolicitudResponse(
		Long id,
		LocalDate fecha,
		String equipoFotografico,
		String resumenCv,
		EstadoSolicitud estado,
		ReporteroResponse reportero
) {
	public static SolicitudResponse from(Solicitud solicitud) {
		return new SolicitudResponse(
				solicitud.getId(),
				solicitud.getFecha(),
				solicitud.getEquipoFotografico(),
				solicitud.getResumenCv(),
				solicitud.getEstado(),
				ReporteroResponse.from(solicitud.getReportero())
		);
	}
}
