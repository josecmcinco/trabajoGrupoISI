package com.siger.backend.service;

import com.siger.backend.dto.ActualizarPrecioCategoriaRequest;
import com.siger.backend.dto.CategoriaResponse;
import com.siger.backend.exception.ResourceNotFoundException;
import com.siger.backend.model.Categoria;
import com.siger.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

	private final CategoriaRepository categoriaRepository;

	@Transactional(readOnly = true)
	public List<CategoriaResponse> listarCategorias() {
		return categoriaRepository.findAllByOrderByNivelAsc()
				.stream()
				.map(CategoriaResponse::from)
				.toList();
	}

	@Transactional
	public CategoriaResponse actualizarPrecio(Long id, ActualizarPrecioCategoriaRequest request) {
		Categoria categoria = categoriaRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
		categoria.setPrecioPorHoja(request.precioPorHoja());
		return CategoriaResponse.from(categoriaRepository.save(categoria));
	}
}
