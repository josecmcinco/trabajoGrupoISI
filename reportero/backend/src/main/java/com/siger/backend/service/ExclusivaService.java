package com.siger.backend.service;

import com.siger.backend.dto.AsignarExclusivaRequest;
import com.siger.backend.dto.CrearExclusivaRequest;
import com.siger.backend.dto.ExclusivaResponse;
import com.siger.backend.dto.FinalizarExclusivaRequest;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.InvalidRequestException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Editorial;
import com.siger.backend.model.EstadoExclusiva;
import com.siger.backend.model.Exclusiva;
import com.siger.backend.model.Reportero;
import com.siger.backend.repository.EditorialRepository;
import com.siger.backend.repository.ExclusivaRepository;
import com.siger.backend.repository.ReporteroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExclusivaService {

	private final ExclusivaRepository exclusivaRepository;
	private final EditorialRepository editorialRepository;
	private final ReporteroRepository reporteroRepository;

	/**
	 * Da de alta una nueva exclusiva ofertada por una editorial (3.1).
	 */
	@Transactional
	public ExclusivaResponse crearExclusiva(CrearExclusivaRequest request) {
		Editorial editorial = editorialRepository.findById(request.editorialId())
				.orElseThrow(() -> new ResourceNotFoundException("Editorial no encontrada con id: " + request.editorialId()));

		Exclusiva exclusiva = Exclusiva.builder()
				.editorial(editorial)
				.tematica(request.tematica().trim())
				.precioReportero(request.precioReportero())
				.estado(EstadoExclusiva.OFERTADA)
				.reportero(null)
				.fechaCreacion(request.fechaCreacion())
				.build();

		return ExclusivaResponse.from(exclusivaRepository.save(exclusiva));
	}

	/**
	 * Lista todas las exclusivas o las filtra por estado (OFERTADA, ASIGNADA, FINALIZADA).
	 */
	@Transactional(readOnly = true)
	public List<ExclusivaResponse> listarExclusivas(EstadoExclusiva estado) {
		List<Exclusiva> exclusivas = estado == null
				? exclusivaRepository.findAllByOrderByFechaCreacionDescIdDesc()
				: exclusivaRepository.findByEstadoOrderByFechaCreacionDescIdDesc(estado);

		return exclusivas.stream()
				.map(ExclusivaResponse::from)
				.toList();
	}

	/**
	 * Asigna una exclusiva ofertada a un reportero aprobado en bolsa (3.2).
	 */
	@Transactional
	public ExclusivaResponse asignarExclusiva(Long exclusivaId, AsignarExclusivaRequest request) {
		Exclusiva exclusiva = buscarExclusiva(exclusivaId);

		if (exclusiva.getEstado() == EstadoExclusiva.ASIGNADA) {
			throw new BusinessRuleException("La exclusiva ya está asignada a un reportero");
		}
		if (exclusiva.getEstado() == EstadoExclusiva.FINALIZADA) {
			throw new BusinessRuleException("Una exclusiva finalizada no puede asignarse a ningún reportero");
		}

		Reportero reportero = reporteroRepository.findById(request.reporteroId())
				.orElseThrow(() -> new ResourceNotFoundException("Reportero no encontrado con id: " + request.reporteroId()));

		if (reportero.getCategoria() == null) {
			throw new BusinessRuleException("Solo un reportero aprobado en bolsa puede aceptar una exclusiva");
		}

		if (request.fechaAsignacion().isBefore(exclusiva.getFechaCreacion())) {
			throw new InvalidRequestException(
					"La fecha de asignación no puede ser anterior a la fecha de creación de la exclusiva"
			);
		}

		exclusiva.setReportero(reportero);
		exclusiva.setFechaAsignacion(request.fechaAsignacion());
		exclusiva.setEstado(EstadoExclusiva.ASIGNADA);

		return ExclusivaResponse.from(exclusivaRepository.save(exclusiva));
	}

	/**
	 * Finaliza una exclusiva asignada, desasignando al reportero y registrando la fecha de finalización (3.3).
	 */
	@Transactional
	public ExclusivaResponse finalizarExclusiva(Long exclusivaId, FinalizarExclusivaRequest request) {
		Exclusiva exclusiva = buscarExclusiva(exclusivaId);

		if (exclusiva.getEstado() != EstadoExclusiva.ASIGNADA) {
			throw new BusinessRuleException("Solo se pueden finalizar exclusivas que estén actualmente asignadas");
		}

		if (request.fechaFinalizacion().isBefore(exclusiva.getFechaAsignacion())) {
			throw new InvalidRequestException(
					"La fecha de finalización debe ser igual o posterior a la fecha de asignación"
			);
		}

		exclusiva.setReportero(null);
		exclusiva.setFechaFinalizacion(request.fechaFinalizacion());
		exclusiva.setEstado(EstadoExclusiva.FINALIZADA);

		return ExclusivaResponse.from(exclusivaRepository.save(exclusiva));
	}

	private Exclusiva buscarExclusiva(Long exclusivaId) {
		return exclusivaRepository.findById(exclusivaId)
				.orElseThrow(() -> new ResourceNotFoundException("Exclusiva no encontrada con id: " + exclusivaId));
	}
}
