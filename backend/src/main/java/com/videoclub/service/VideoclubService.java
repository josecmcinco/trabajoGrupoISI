package com.videoclub.service;

import com.videoclub.dto.VideoclubRequest;
import com.videoclub.dto.VideoclubResponse;
import com.videoclub.exception.ResourceNotFoundException;
import com.videoclub.model.Videoclub;
import com.videoclub.repository.VideoclubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VideoclubService {

    private final VideoclubRepository videoclubRepository;

    public VideoclubResponse crear(VideoclubRequest request) {
        Videoclub videoclub = Videoclub.builder()
                .nombreGerente(request.nombreGerente())
                .ciudad(request.ciudad())
                .calle(request.calle())
                .codigoPostal(request.codigoPostal())
                .build();
        return toResponse(videoclubRepository.save(videoclub));
    }

    public VideoclubResponse actualizar(Long id, VideoclubRequest request) {
        Videoclub videoclub = obtenerEntidad(id);
        videoclub.setNombreGerente(request.nombreGerente());
        videoclub.setCiudad(request.ciudad());
        videoclub.setCalle(request.calle());
        videoclub.setCodigoPostal(request.codigoPostal());
        return toResponse(videoclubRepository.save(videoclub));
    }

    @Transactional(readOnly = true)
    public VideoclubResponse obtenerPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional(readOnly = true)
    public List<VideoclubResponse> listarTodos() {
        return videoclubRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Videoclub obtenerEntidad(Long id) {
        return videoclubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Videoclub no encontrado con ID: " + id));
    }

    public VideoclubResponse toResponse(Videoclub v) {
        return new VideoclubResponse(
                v.getId(),
                v.getNombreGerente(),
                v.getCiudad(),
                v.getCalle(),
                v.getCodigoPostal()
        );
    }
}
