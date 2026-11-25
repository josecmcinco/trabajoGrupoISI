package com.siger.backend.controller;

import com.siger.backend.dto.AlbaranResponse;
import com.siger.backend.dto.CrearAlbaranRequest;
import com.siger.backend.service.AlbaranService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/albaranes")
@RequiredArgsConstructor
public class AlbaranController {

	private final AlbaranService albaranService;

	@GetMapping
	public ResponseEntity<List<AlbaranResponse>> listarAlbaranes() {
		return ResponseEntity.ok(albaranService.listarAlbaranes());
	}

	@PostMapping
	public ResponseEntity<AlbaranResponse> crearAlbaran(@Valid @RequestBody CrearAlbaranRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(albaranService.crearAlbaran(request));
	}
}
