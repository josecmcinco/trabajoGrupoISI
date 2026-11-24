package com.videoclub.controller;

import com.videoclub.dto.PeliculaRequest;
import com.videoclub.dto.PeliculaResponse;
import com.videoclub.service.PeliculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peliculas")
@RequiredArgsConstructor
public class PeliculaController {

    private final PeliculaService peliculaService;

    @PostMapping
    public ResponseEntity<PeliculaResponse> crear(@Valid @RequestBody PeliculaRequest request) {
        return new ResponseEntity<>(peliculaService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PeliculaResponse> actualizar(@PathVariable Long id, @Valid @RequestBody PeliculaRequest request) {
        return ResponseEntity.ok(peliculaService.actualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeliculaResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(peliculaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<PeliculaResponse>> listar(@RequestParam(required = false) Long videoclubId) {
        return ResponseEntity.ok(peliculaService.listar(videoclubId));
    }
}
