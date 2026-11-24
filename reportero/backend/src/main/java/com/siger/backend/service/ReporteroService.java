package com.siger.backend.service;

import com.siger.backend.dto.PromocionarReporteroRequest;
import com.siger.backend.dto.ReporteroResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Categoria;
import com.siger.backend.model.Reportero;
import com.siger.backend.repository.CategoriaRepository;
import com.siger.backend.repository.ReporteroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteroService {

	private final ReporteroRepository reporteroRepository;
	private final CategoriaRepository categoriaRepository;

	@Transactional(readOnly = true)
	public List<ReporteroResponse> listarReporteros(boolean soloEnBolsa) {
		List<Reportero> reporteros = soloEnBolsa
				? reporteroRepository.findByCategoriaIsNotNullOrderByApellidosAscNombreAsc()
				: reporteroRepository.findAllByOrderByApellidosAscNombreAsc();
		return reporteros.stream()
				.map(ReporteroResponse::from)
				.toList();
	}

	/**
	 * Promociona a un reportero en bolsa a una categoría estrictamente superior.
	 */
	@Transactional
	public ReporteroResponse promocionarReportero(Long reporteroId, PromocionarReporteroRequest request) {
		Reportero reportero = reporteroRepository.findById(reporteroId)
				.orElseThrow(() -> new ResourceNotFoundException("Reportero no encontrado con id: " + reporteroId));

		if (reportero.getCategoria() == null) {
			throw new BusinessRuleException("El reportero aún no pertenece a la bolsa de reporteros");
		}

		Categoria nuevaCategoria = categoriaRepository.findById(request.categoriaId())
				.orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + request.categoriaId()));

		if (nuevaCategoria.getNivel() <= reportero.getCategoria().getNivel()) {
			throw new BusinessRuleException(
					"Solo se puede ascender a una categoría superior; nunca se puede mantener ni bajar la categoría"
			);
		}

		reportero.setCategoria(nuevaCategoria);
		return ReporteroResponse.from(reporteroRepository.save(reportero));
	}
}
