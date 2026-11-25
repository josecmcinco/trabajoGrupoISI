package com.siger.backend.controller;

import com.siger.backend.dto.EditorialRequest;
import com.siger.backend.dto.EditorialResponse;
import com.siger.backend.service.EditorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/editoriales")
@RequiredArgsConstructor
public class EditorialController {

	private final EditorialService editorialService;

	@GetMapping
	public ResponseEntity<List<EditorialResponse>> listarEditoriales() {
		return ResponseEntity.ok(editorialService.listarEditoriales());
	}

	@PostMapping
	public ResponseEntity<EditorialResponse> crearEditorial(@Valid @RequestBody EditorialRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(editorialService.crearEditorial(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<EditorialResponse> actualizarEditorial(
			@PathVariable Long id,
			@Valid @RequestBody EditorialRequest request
	) {
		return ResponseEntity.ok(editorialService.actualizarEditorial(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarEditorial(@PathVariable Long id) {
		editorialService.eliminarEditorial(id);
		return ResponseEntity.noContent().build();
	}
}
