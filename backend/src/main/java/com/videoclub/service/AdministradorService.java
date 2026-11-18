package com.videoclub.service;

import com.videoclub.dto.AdministradorRequest;
import com.videoclub.dto.AdministradorResponse;
import com.videoclub.exception.ResourceNotFoundException;
import com.videoclub.model.Administrador;
import com.videoclub.repository.AdministradorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdministradorService {

    private final AdministradorRepository administradorRepository;

    public AdministradorResponse crear(AdministradorRequest request) {
        Administrador admin = Administrador.builder()
                .nombre(request.nombre())
                .build();
        return toResponse(administradorRepository.save(admin));
    }

    public AdministradorResponse actualizar(Long id, AdministradorRequest request) {
        Administrador admin = obtenerEntidad(id);
        admin.setNombre(request.nombre());
        return toResponse(administradorRepository.save(admin));
    }

    @Transactional(readOnly = true)
    public AdministradorResponse obtenerPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional(readOnly = true)
    public List<AdministradorResponse> listarTodos() {
        return administradorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Administrador obtenerEntidad(Long id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador no encontrado con ID: " + id));
    }

    public AdministradorResponse toResponse(Administrador a) {
        return new AdministradorResponse(
                a.getId(),
                a.getNombre()
        );
    }
}
