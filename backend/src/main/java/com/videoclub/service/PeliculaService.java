package com.videoclub.service;

import com.videoclub.dto.PeliculaRequest;
import com.videoclub.dto.PeliculaResponse;
import com.videoclub.exception.ResourceNotFoundException;
import com.videoclub.model.Pelicula;
import com.videoclub.model.Videoclub;
import com.videoclub.repository.PeliculaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;
    private final VideoclubService videoclubService;

    public PeliculaResponse crear(PeliculaRequest request) {
        Videoclub videoclub = videoclubService.obtenerEntidad(request.videoclubId());

        Pelicula pelicula = Pelicula.builder()
                .nombre(request.nombre())
                .director(request.director())
                .fechaEstreno(request.fechaEstreno())
                .precioAlquiler(request.precioAlquiler())
                .videoclub(videoclub)
                .build();

        return toResponse(peliculaRepository.save(pelicula));
    }

    public PeliculaResponse actualizar(Long id, PeliculaRequest request) {
        Pelicula pelicula = obtenerEntidad(id);
        Videoclub videoclub = videoclubService.obtenerEntidad(request.videoclubId());

        pelicula.setNombre(request.nombre());
        pelicula.setDirector(request.director());
        pelicula.setFechaEstreno(request.fechaEstreno());
        pelicula.setPrecioAlquiler(request.precioAlquiler());
        pelicula.setVideoclub(videoclub);

        return toResponse(peliculaRepository.save(pelicula));
    }

    @Transactional(readOnly = true)
    public PeliculaResponse obtenerPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional(readOnly = true)
    public List<PeliculaResponse> listar(Long videoclubId) {
        List<Pelicula> peliculas = (videoclubId != null)
                ? peliculaRepository.findByVideoclubId(videoclubId)
                : peliculaRepository.findAll();

        return peliculas.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Pelicula obtenerEntidad(Long id) {
        return peliculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Película no encontrada con ID: " + id));
    }

    public PeliculaResponse toResponse(Pelicula p) {
        return new PeliculaResponse(
                p.getId(),
                p.getNombre(),
                p.getDirector(),
                p.getFechaEstreno(),
                p.getPrecioAlquiler(),
                p.getVideoclub().getId(),
                p.getVideoclub().getCiudad()
        );
    }
}
