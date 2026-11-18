package com.videoclub.controller;

import com.videoclub.dto.CalcularEstadisticaRequest;
import com.videoclub.dto.EstadisticaSocioResponse;
import com.videoclub.service.EstadisticaSocioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadisticas")
@RequiredArgsConstructor
public class EstadisticaSocioController {

    private final EstadisticaSocioService estadisticaSocioService;

    @PostMapping("/calcular")
    public ResponseEntity<EstadisticaSocioResponse> calcularYGuardar(
            @Valid @RequestBody CalcularEstadisticaRequest request
    ) {
        return new ResponseEntity<>(estadisticaSocioService.calcularYGuardar(request), HttpStatus.CREATED);
    }

    @GetMapping("/socio/{socioId}")
    public ResponseEntity<List<EstadisticaSocioResponse>> listarPorSocio(@PathVariable Long socioId) {
        return ResponseEntity.ok(estadisticaSocioService.listarPorSocio(socioId));
    }

    @GetMapping
    public ResponseEntity<List<EstadisticaSocioResponse>> listarTodas() {
        return ResponseEntity.ok(estadisticaSocioService.listarTodas());
    }
}
