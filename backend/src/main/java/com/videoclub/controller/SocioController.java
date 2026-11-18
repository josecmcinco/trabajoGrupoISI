package com.videoclub.controller;

import com.videoclub.dto.SocioRequest;
import com.videoclub.dto.SocioResponse;
import com.videoclub.service.SocioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/socios")
@RequiredArgsConstructor
public class SocioController {

    private final SocioService socioService;

    @PostMapping
    public ResponseEntity<SocioResponse> crear(@Valid @RequestBody SocioRequest request) {
        return new ResponseEntity<>(socioService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SocioResponse> actualizar(@PathVariable Long id, @Valid @RequestBody SocioRequest request) {
        return ResponseEntity.ok(socioService.actualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SocioResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(socioService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<SocioResponse>> listarTodos() {
        return ResponseEntity.ok(socioService.listarTodos());
    }
}
