package com.siger.backend.controller;

import com.siger.backend.dto.AprobarSolicitudRequest;
import com.siger.backend.dto.CrearSolicitudRequest;
import com.siger.backend.dto.SolicitudResponse;
import com.siger.backend.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

	private final SolicitudService solicitudService;

	@PostMapping
	public ResponseEntity<SolicitudResponse> crearSolicitud(@Valid @RequestBody CrearSolicitudRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crearSolicitud(request));
	}

	@GetMapping
	public ResponseEntity<List<SolicitudResponse>> listarSolicitudes() {
		return ResponseEntity.ok(solicitudService.listarSolicitudes());
	}

	@GetMapping("/aceptadas")
	public ResponseEntity<List<SolicitudResponse>> listarSolicitudesAceptadas() {
		return ResponseEntity.ok(solicitudService.listarSolicitudesAceptadas());
	}

	@PostMapping("/{id}/aprobar")
	public ResponseEntity<SolicitudResponse> aprobarSolicitud(
			@PathVariable Long id,
			@Valid @RequestBody AprobarSolicitudRequest request
	) {
		return ResponseEntity.ok(solicitudService.aprobarSolicitud(id, request));
	}

	@PostMapping("/{id}/rechazar")
	public ResponseEntity<SolicitudResponse> rechazarSolicitud(@PathVariable Long id) {
		return ResponseEntity.ok(solicitudService.rechazarSolicitud(id));
	}
}
