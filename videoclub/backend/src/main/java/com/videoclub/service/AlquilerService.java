package com.videoclub.service;

import com.videoclub.dto.AlquilerResponse;
import com.videoclub.dto.CrearAlquilerRequest;
import com.videoclub.dto.ModificarDevolucionRequest;
import com.videoclub.dto.PeliculaResponse;
import com.videoclub.exception.BusinessException;
import com.videoclub.exception.ResourceNotFoundException;
import com.videoclub.model.Alquiler;
import com.videoclub.model.Pelicula;
import com.videoclub.model.Socio;
import com.videoclub.model.Videoclub;
import com.videoclub.repository.AlquilerRepository;
import com.videoclub.repository.PeliculaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AlquilerService {

    private final AlquilerRepository alquilerRepository;
    private final PeliculaRepository peliculaRepository;
    private final SocioService socioService;
    private final VideoclubService videoclubService;
    private final PeliculaService peliculaService;

    public AlquilerResponse crear(CrearAlquilerRequest request) {
        if (!request.fechaDevolucion().isAfter(request.fechaRecogida())) {
            throw new BusinessException("La fecha de devolución (" + request.fechaDevolucion() + 
                    ") debe ser posterior a la fecha de recogida (" + request.fechaRecogida() + ").");
        }

        Socio socio = socioService.obtenerEntidad(request.socioId());
        Videoclub videoclub = videoclubService.obtenerEntidad(request.videoclubId());

        List<Pelicula> peliculas = peliculaRepository.findAllById(request.peliculaIds());
        if (peliculas.size() != request.peliculaIds().size()) {
            throw new ResourceNotFoundException("Una o más películas no fueron encontradas.");
        }

        // Validar que las películas pertenezcan a la sede donde se realiza el alquiler
        for (Pelicula p : peliculas) {
            if (!p.getVideoclub().getId().equals(videoclub.getId())) {
                throw new BusinessException("La película '" + p.getNombre() + 
                        "' (ID: " + p.getId() + ") no pertenece al videoclub seleccionado (ID: " + videoclub.getId() + ").");
            }
        }

        // Cálculo derivado del total a pagar
        BigDecimal totalPagar = peliculas.stream()
                .map(Pelicula::getPrecioAlquiler)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Alquiler alquiler = Alquiler.builder()
                .socio(socio)
                .videoclub(videoclub)
                .fechaRecogida(request.fechaRecogida())
                .fechaDevolucion(request.fechaDevolucion())
                .totalPagar(totalPagar)
                .peliculas(peliculas)
                .build();

        return toResponse(alquilerRepository.save(alquiler));
    }

    public AlquilerResponse modificarFechaDevolucion(Long id, ModificarDevolucionRequest request) {
        Alquiler alquiler = obtenerEntidad(id);

        if (!request.nuevaFechaDevolucion().isAfter(request.fechaReferenciaUsuario())) {
            throw new BusinessException("La fecha de devolución (" + request.nuevaFechaDevolucion() + 
                    ") debe ser estrictamente posterior a la fecha actual indicada (" + request.fechaReferenciaUsuario() + ").");
        }

        // Modifica solo fechaDevolucion; fechaRecogida permanece intacta
        alquiler.setFechaDevolucion(request.nuevaFechaDevolucion());

        return toResponse(alquilerRepository.save(alquiler));
    }

    @Transactional(readOnly = true)
    public AlquilerResponse obtenerPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional(readOnly = true)
    public List<AlquilerResponse> listar(Long socioId, Long videoclubId) {
        List<Alquiler> lista;
        if (socioId != null) {
            lista = alquilerRepository.findBySocioId(socioId);
        } else if (videoclubId != null) {
            lista = alquilerRepository.findByVideoclubId(videoclubId);
        } else {
            lista = alquilerRepository.findAll();
        }

        return lista.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Alquiler obtenerEntidad(Long id) {
        return alquilerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alquiler no encontrado con ID: " + id));
    }

    public AlquilerResponse toResponse(Alquiler a) {
        List<PeliculaResponse> peliculasDto = a.getPeliculas().stream()
                .map(peliculaService::toResponse)
                .toList();

        return new AlquilerResponse(
                a.getId(),
                a.getSocio().getId(),
                a.getSocio().getNombre(),
                a.getVideoclub().getId(),
                a.getVideoclub().getCiudad(),
                a.getFechaRecogida(),
                a.getFechaDevolucion(),
                a.getTotalPagar(),
                peliculasDto
        );
    }
}
