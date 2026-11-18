package com.videoclub.controller;

import com.videoclub.dto.VideoclubRequest;
import com.videoclub.dto.VideoclubResponse;
import com.videoclub.service.VideoclubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videoclubs")
@RequiredArgsConstructor
public class VideoclubController {

    private final VideoclubService videoclubService;

    @PostMapping
    public ResponseEntity<VideoclubResponse> crear(@Valid @RequestBody VideoclubRequest request) {
        return new ResponseEntity<>(videoclubService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VideoclubResponse> actualizar(@PathVariable Long id, @Valid @RequestBody VideoclubRequest request) {
        return ResponseEntity.ok(videoclubService.actualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoclubResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(videoclubService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<VideoclubResponse>> listarTodos() {
        return ResponseEntity.ok(videoclubService.listarTodos());
    }
}
