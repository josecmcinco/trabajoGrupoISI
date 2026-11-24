package com.siger.backend.controller;

import com.siger.backend.dto.PromocionarReporteroRequest;
import com.siger.backend.dto.ReporteroResponse;
import com.siger.backend.service.ReporteroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reporteros")
@RequiredArgsConstructor
public class ReporteroController {

	private final ReporteroService reporteroService;

	@GetMapping
	public ResponseEntity<List<ReporteroResponse>> listarReporteros(
			@RequestParam(defaultValue = "true") boolean soloEnBolsa
	) {
		return ResponseEntity.ok(reporteroService.listarReporteros(soloEnBolsa));
	}

	@PostMapping("/{id}/promocionar")
	public ResponseEntity<ReporteroResponse> promocionarReportero(
			@PathVariable Long id,
			@Valid @RequestBody PromocionarReporteroRequest request
	) {
		return ResponseEntity.ok(reporteroService.promocionarReportero(id, request));
	}
}
