package com.siger.backend.service;

import com.siger.backend.dto.CrearReportajeRequest;
import com.siger.backend.dto.ReportajeResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Reportaje;
import com.siger.backend.model.Reportero;
import com.siger.backend.repository.ReportajeRepository;
import com.siger.backend.repository.ReporteroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportajeService {

	private final ReportajeRepository reportajeRepository;
	private final ReporteroRepository reporteroRepository;

	/**
	 * Registra un nuevo reportaje fotográfico para un reportero aprobado en bolsa.
	 */
	@Transactional
	public ReportajeResponse crearReportaje(CrearReportajeRequest request) {
		Reportero reportero = reporteroRepository.findById(request.reporteroId())
				.orElseThrow(() -> new ResourceNotFoundException("Reportero no encontrado con id: " + request.reporteroId()));

		if (reportero.getCategoria() == null) {
			throw new BusinessRuleException("Solo un reportero aprobado en bolsa puede dar de alta un reportaje");
		}

		Reportaje reportaje = Reportaje.builder()
				.reportero(reportero)
				.numeroFotos(request.numeroFotos())
				.descripcion(request.descripcion().trim())
				.fechaCreacion(LocalDateTime.now())
				.build();

		return ReportajeResponse.from(reportajeRepository.save(reportaje));
	}

	@Transactional(readOnly = true)
	public List<ReportajeResponse> listarReportajes() {
		return reportajeRepository.findAllByOrderByFechaCreacionDescIdDesc()
				.stream()
				.map(ReportajeResponse::from)
				.toList();
	}
}
