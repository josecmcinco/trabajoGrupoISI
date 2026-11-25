package com.siger.backend.service;

import com.siger.backend.dto.AlbaranResponse;
import com.siger.backend.dto.CrearAlbaranRequest;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Albaran;
import com.siger.backend.model.Categoria;
import com.siger.backend.model.Editorial;
import com.siger.backend.model.Reportaje;
import com.siger.backend.repository.AlbaranRepository;
import com.siger.backend.repository.EditorialRepository;
import com.siger.backend.repository.ReportajeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlbaranService {

	private final AlbaranRepository albaranRepository;
	private final ReportajeRepository reportajeRepository;
	private final EditorialRepository editorialRepository;

	/**
	 * Genera un albarán de compra calculando en servidor el pago al reportero y validando el margen mínimo.
	 * Un mismo reportaje puede adquirirse múltiples veces de forma no exclusiva.
	 */
	@Transactional
	public AlbaranResponse crearAlbaran(CrearAlbaranRequest request) {
		Reportaje reportaje = reportajeRepository.findById(request.reportajeId())
				.orElseThrow(() -> new ResourceNotFoundException("Reportaje no encontrado con id: " + request.reportajeId()));

		Editorial editorial = editorialRepository.findById(request.editorialId())
				.orElseThrow(() -> new ResourceNotFoundException("Editorial no encontrada con id: " + request.editorialId()));

		Categoria categoria = reportaje.getReportero().getCategoria();
		if (categoria == null || categoria.getPrecioPorFoto() == null) {
			throw new BusinessRuleException("El reportero del reportaje no tiene una categoría con precio por foto definido");
		}

		BigDecimal precioReportero = categoria.getPrecioPorFoto()
				.multiply(BigDecimal.valueOf(reportaje.getNumeroFotos()))
				.setScale(2, RoundingMode.HALF_UP);
		BigDecimal precioEditorial = request.precioEditorial().setScale(2, RoundingMode.HALF_UP);

		if (precioEditorial.compareTo(precioReportero) < 0) {
			throw new BusinessRuleException(
					"El precio cobrado a la editorial (" + precioEditorial + " €) no puede ser menor que el importe a pagar al reportero (" + precioReportero + " €)"
			);
		}

		Albaran albaran = Albaran.builder()
				.reportaje(reportaje)
				.editorial(editorial)
				.precioEditorial(precioEditorial)
				.precioReportero(precioReportero)
				.fechaCreacion(LocalDateTime.now())
				.build();

		return AlbaranResponse.from(albaranRepository.save(albaran));
	}

	@Transactional(readOnly = true)
	public List<AlbaranResponse> listarAlbaranes() {
		return albaranRepository.findAllByOrderByFechaCreacionDescIdDesc()
				.stream()
				.map(AlbaranResponse::from)
				.toList();
	}
}
