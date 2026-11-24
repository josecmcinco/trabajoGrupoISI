package com.siger.backend.controller;

import com.siger.backend.dto.ActualizarPrecioCategoriaRequest;
import com.siger.backend.dto.CategoriaResponse;
import com.siger.backend.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

	private final CategoriaService categoriaService;

	@GetMapping
	public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
		return ResponseEntity.ok(categoriaService.listarCategorias());
	}

	@PutMapping("/{id}/precio")
	public ResponseEntity<CategoriaResponse> actualizarPrecio(
			@PathVariable Long id,
			@Valid @RequestBody ActualizarPrecioCategoriaRequest request
	) {
		return ResponseEntity.ok(categoriaService.actualizarPrecio(id, request));
	}
}
