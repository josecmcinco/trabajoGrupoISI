package com.siger.backend.service;

import com.siger.backend.dto.AprobarSolicitudRequest;
import com.siger.backend.dto.CrearSolicitudRequest;
import com.siger.backend.dto.SolicitudResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.InvalidRequestException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Categoria;
import com.siger.backend.model.EstadoSolicitud;
import com.siger.backend.model.Reportero;
import com.siger.backend.model.Solicitud;
import com.siger.backend.repository.CategoriaRepository;
import com.siger.backend.repository.ReporteroRepository;
import com.siger.backend.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

	private final SolicitudRepository solicitudRepository;
	private final ReporteroRepository reporteroRepository;
	private final CategoriaRepository categoriaRepository;

	/**
	 * Registra una nueva solicitud.
	 * Si el reportero ya existe (por DNI), sus datos personales permanecen inmutables.
	 * Impide presentar más de una solicitud por mes.
	 */
	@Transactional
	public SolicitudResponse crearSolicitud(CrearSolicitudRequest request) {
		String dniNormalizado = request.dni().trim().toUpperCase();
		LocalDate fechaSolicitud = request.fecha() != null ? request.fecha() : LocalDate.now();

		Reportero reportero = reporteroRepository.findByDniIgnoreCase(dniNormalizado)
				.orElseGet(() -> registrarNuevoReportero(dniNormalizado, request));

		validarLimiteMensual(reportero.getId(), fechaSolicitud);

		Solicitud solicitud = Solicitud.builder()
				.fecha(fechaSolicitud)
				.equipoFotografico(request.equipoFotografico())
				.resumenCv(request.resumenCv().trim())
				.estado(EstadoSolicitud.PENDIENTE)
				.reportero(reportero)
				.build();

		return SolicitudResponse.from(solicitudRepository.save(solicitud));
	}

	@Transactional(readOnly = true)
	public List<SolicitudResponse> listarSolicitudes() {
		return solicitudRepository.findAllByOrderByFechaDescIdDesc()
				.stream()
				.map(SolicitudResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<SolicitudResponse> listarSolicitudesAceptadas() {
		return solicitudRepository.findByEstadoOrderByFechaDescIdDesc(EstadoSolicitud.APROBADA)
				.stream()
				.map(SolicitudResponse::from)
				.toList();
	}

	@Transactional
	public SolicitudResponse aprobarSolicitud(Long solicitudId, AprobarSolicitudRequest request) {
		Solicitud solicitud = obtenerSolicitudPendiente(solicitudId);

		Categoria categoria = categoriaRepository.findById(request.categoriaId())
				.orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + request.categoriaId()));

		solicitud.setEstado(EstadoSolicitud.APROBADA);
		Reportero reportero = solicitud.getReportero();
		reportero.setCategoria(categoria);
		reporteroRepository.save(reportero);

		return SolicitudResponse.from(solicitudRepository.save(solicitud));
	}

	@Transactional
	public SolicitudResponse rechazarSolicitud(Long solicitudId) {
		Solicitud solicitud = obtenerSolicitudPendiente(solicitudId);
		solicitud.setEstado(EstadoSolicitud.RECHAZADA);
		return SolicitudResponse.from(solicitudRepository.save(solicitud));
	}

	private Solicitud obtenerSolicitudPendiente(Long solicitudId) {
		Solicitud solicitud = solicitudRepository.findById(solicitudId)
				.orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada con id: " + solicitudId));

		if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
			throw new BusinessRuleException("La solicitud ya fue procesada con estado: " + solicitud.getEstado());
		}
		return solicitud;
	}

	private Reportero registrarNuevoReportero(String dniNormalizado, CrearSolicitudRequest request) {
		if (!StringUtils.hasText(request.nombre())
				|| !StringUtils.hasText(request.apellidos())
				|| !StringUtils.hasText(request.direccion())
				|| !StringUtils.hasText(request.ciudad())
				|| !StringUtils.hasText(request.codigoPostal())
				|| !StringUtils.hasText(request.telefono())) {
			throw new InvalidRequestException(
					"Para la primera solicitud de un reportero son obligatorios todos los datos personales "
							+ "(nombre, apellidos, dirección, ciudad, código postal y teléfono)"
			);
		}

		Reportero nuevo = Reportero.builder()
				.dni(dniNormalizado)
				.nombre(request.nombre().trim())
				.apellidos(request.apellidos().trim())
				.direccion(request.direccion().trim())
				.ciudad(request.ciudad().trim())
				.codigoPostal(request.codigoPostal().trim())
				.telefono(request.telefono().trim())
				.build();

		return reporteroRepository.save(nuevo);
	}

	private void validarLimiteMensual(Long reporteroId, LocalDate fechaNueva) {
		solicitudRepository.findTopByReporteroIdOrderByFechaDescIdDesc(reporteroId)
				.ifPresent(ultima -> {
					LocalDate fechaUltima = ultima.getFecha();
					boolean mismoMes = YearMonth.from(fechaUltima).equals(YearMonth.from(fechaNueva));
					boolean menosDeUnMes = fechaNueva.isBefore(fechaUltima.plusMonths(1));
					if (mismoMes || menosDeUnMes) {
						throw new BusinessRuleException(
								"Un reportero no puede presentar más de una solicitud por mes (última solicitud: " + fechaUltima + ")"
						);
					}
				});
	}
}
