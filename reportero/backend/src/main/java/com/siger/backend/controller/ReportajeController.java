package com.siger.backend.controller;

import com.siger.backend.dto.CrearReportajeRequest;
import com.siger.backend.dto.ReportajeResponse;
import com.siger.backend.service.ReportajeService;
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
@RequestMapping("/api/reportajes")
@RequiredArgsConstructor
public class ReportajeController {

	private final ReportajeService reportajeService;

	@GetMapping
	public ResponseEntity<List<ReportajeResponse>> listarReportajes() {
		return ResponseEntity.ok(reportajeService.listarReportajes());
	}

	@PostMapping
	public ResponseEntity<ReportajeResponse> crearReportaje(@Valid @RequestBody CrearReportajeRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(reportajeService.crearReportaje(request));
	}
}
