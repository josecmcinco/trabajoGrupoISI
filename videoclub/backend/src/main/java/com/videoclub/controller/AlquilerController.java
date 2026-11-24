package com.videoclub.controller;

import com.videoclub.dto.AlquilerResponse;
import com.videoclub.dto.CrearAlquilerRequest;
import com.videoclub.dto.ModificarDevolucionRequest;
import com.videoclub.service.AlquilerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alquileres")
@RequiredArgsConstructor
public class AlquilerController {

    private final AlquilerService alquilerService;

    @PostMapping
    public ResponseEntity<AlquilerResponse> crear(@Valid @RequestBody CrearAlquilerRequest request) {
        return new ResponseEntity<>(alquilerService.crear(request), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/fecha-devolucion")
    public ResponseEntity<AlquilerResponse> modificarFechaDevolucion(
            @PathVariable Long id,
            @Valid @RequestBody ModificarDevolucionRequest request
    ) {
        return ResponseEntity.ok(alquilerService.modificarFechaDevolucion(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlquilerResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(alquilerService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AlquilerResponse>> listar(
            @RequestParam(required = false) Long socioId,
            @RequestParam(required = false) Long videoclubId
    ) {
        return ResponseEntity.ok(alquilerService.listar(socioId, videoclubId));
    }
}
