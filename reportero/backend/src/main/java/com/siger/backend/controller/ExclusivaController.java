package com.siger.backend.controller;

import com.siger.backend.dto.AsignarExclusivaRequest;
import com.siger.backend.dto.CrearExclusivaRequest;
import com.siger.backend.dto.ExclusivaResponse;
import com.siger.backend.dto.FinalizarExclusivaRequest;
import com.siger.backend.model.EstadoExclusiva;
import com.siger.backend.service.ExclusivaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exclusivas")
@RequiredArgsConstructor
public class ExclusivaController {

	private final ExclusivaService exclusivaService;

	@GetMapping
	public ResponseEntity<List<ExclusivaResponse>> listarExclusivas(
			@RequestParam(required = false) EstadoExclusiva estado
	) {
		return ResponseEntity.ok(exclusivaService.listarExclusivas(estado));
	}

	@PostMapping
	public ResponseEntity<ExclusivaResponse> crearExclusiva(@Valid @RequestBody CrearExclusivaRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(exclusivaService.crearExclusiva(request));
	}

	@PatchMapping("/{id}/asignar")
	public ResponseEntity<ExclusivaResponse> asignarExclusiva(
			@PathVariable Long id,
			@Valid @RequestBody AsignarExclusivaRequest request
	) {
		return ResponseEntity.ok(exclusivaService.asignarExclusiva(id, request));
	}

	@PatchMapping("/{id}/finalizar")
	public ResponseEntity<ExclusivaResponse> finalizarExclusiva(
			@PathVariable Long id,
			@Valid @RequestBody FinalizarExclusivaRequest request
	) {
		return ResponseEntity.ok(exclusivaService.finalizarExclusiva(id, request));
	}
}
