package com.siger.backend.service;

import com.siger.backend.dto.EditorialRequest;
import com.siger.backend.dto.EditorialResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Editorial;
import com.siger.backend.repository.AlbaranRepository;
import com.siger.backend.repository.EditorialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EditorialService {

	private final EditorialRepository editorialRepository;
	private final AlbaranRepository albaranRepository;

	@Transactional(readOnly = true)
	public List<EditorialResponse> listarEditoriales() {
		return editorialRepository.findAllByOrderByNombreAsc()
				.stream()
				.map(EditorialResponse::from)
				.toList();
	}

	@Transactional
	public EditorialResponse crearEditorial(EditorialRequest request) {
		String cifNormalizado = normalizarCif(request.cif());
		if (editorialRepository.existsByCifIgnoreCase(cifNormalizado)) {
			throw new BusinessRuleException("Ya existe una editorial registrada con el CIF: " + cifNormalizado);
		}

		Editorial editorial = Editorial.builder()
				.nombre(request.nombre().trim())
				.cif(cifNormalizado)
				.direccion(request.direccion().trim())
				.build();

		return EditorialResponse.from(editorialRepository.save(editorial));
	}

	@Transactional
	public EditorialResponse actualizarEditorial(Long id, EditorialRequest request) {
		Editorial editorial = buscarEditorial(id);
		String cifNormalizado = normalizarCif(request.cif());
		if (editorialRepository.existsByCifIgnoreCaseAndIdNot(cifNormalizado, id)) {
			throw new BusinessRuleException("Ya existe otra editorial registrada con el CIF: " + cifNormalizado);
		}

		editorial.setNombre(request.nombre().trim());
		editorial.setCif(cifNormalizado);
		editorial.setDireccion(request.direccion().trim());

		return EditorialResponse.from(editorialRepository.save(editorial));
	}

	@Transactional
	public void eliminarEditorial(Long id) {
		Editorial editorial = buscarEditorial(id);
		if (albaranRepository.existsByEditorialId(id)) {
			throw new BusinessRuleException("No se puede eliminar la editorial porque tiene albaranes de compra asociados");
		}
		editorialRepository.delete(editorial);
	}

	private Editorial buscarEditorial(Long id) {
		return editorialRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Editorial no encontrada con id: " + id));
	}

	private String normalizarCif(String cif) {
		return cif.trim().toUpperCase();
	}
}
