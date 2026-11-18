package com.videoclub.service;

import com.videoclub.dto.SocioRequest;
import com.videoclub.dto.SocioResponse;
import com.videoclub.exception.ResourceNotFoundException;
import com.videoclub.model.Socio;
import com.videoclub.model.Videoclub;
import com.videoclub.repository.SocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SocioService {

    private final SocioRepository socioRepository;
    private final VideoclubService videoclubService;

    public SocioResponse crear(SocioRequest request) {
        Videoclub videoclubOrigen = videoclubService.obtenerEntidad(request.videoclubOrigenId());

        Socio socio = Socio.builder()
                .nombre(request.nombre())
                .edad(request.edad())
                .videoclubOrigen(videoclubOrigen)
                .build();

        return toResponse(socioRepository.save(socio));
    }

    public SocioResponse actualizar(Long id, SocioRequest request) {
        Socio socio = obtenerEntidad(id);
        Videoclub videoclubOrigen = videoclubService.obtenerEntidad(request.videoclubOrigenId());

        socio.setNombre(request.nombre());
        socio.setEdad(request.edad());
        socio.setVideoclubOrigen(videoclubOrigen);

        return toResponse(socioRepository.save(socio));
    }

    @Transactional(readOnly = true)
    public SocioResponse obtenerPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional(readOnly = true)
    public List<SocioResponse> listarTodos() {
        return socioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Socio obtenerEntidad(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Socio no encontrado con ID: " + id));
    }

    public SocioResponse toResponse(Socio s) {
        return new SocioResponse(
                s.getId(),
                s.getNombre(),
                s.getEdad(),
                s.getVideoclubOrigen().getId(),
                s.getVideoclubOrigen().getCiudad()
        );
    }
}
