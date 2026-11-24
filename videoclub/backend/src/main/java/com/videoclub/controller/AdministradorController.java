package com.videoclub.controller;

import com.videoclub.dto.AdministradorRequest;
import com.videoclub.dto.AdministradorResponse;
import com.videoclub.service.AdministradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/administradores")
@RequiredArgsConstructor
public class AdministradorController {

    private final AdministradorService administradorService;

    @PostMapping
    public ResponseEntity<AdministradorResponse> crear(@Valid @RequestBody AdministradorRequest request) {
        return new ResponseEntity<>(administradorService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdministradorResponse> actualizar(@PathVariable Long id, @Valid @RequestBody AdministradorRequest request) {
        return ResponseEntity.ok(administradorService.actualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministradorResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(administradorService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AdministradorResponse>> listarTodos() {
        return ResponseEntity.ok(administradorService.listarTodos());
    }
}
