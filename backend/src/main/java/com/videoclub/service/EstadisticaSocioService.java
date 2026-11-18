package com.videoclub.service;

import com.videoclub.dto.CalcularEstadisticaRequest;
import com.videoclub.dto.EstadisticaSocioResponse;
import com.videoclub.exception.BusinessException;
import com.videoclub.model.Alquiler;
import com.videoclub.model.EstadisticaSocio;
import com.videoclub.model.Socio;
import com.videoclub.repository.AlquilerRepository;
import com.videoclub.repository.EstadisticaSocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EstadisticaSocioService {

    private final EstadisticaSocioRepository estadisticaSocioRepository;
    private final AlquilerRepository alquilerRepository;
    private final SocioService socioService;

    public EstadisticaSocioResponse calcularYGuardar(CalcularEstadisticaRequest request) {
        Socio socio = socioService.obtenerEntidad(request.socioId());

        // Restricción: En un mes, no se puede almacenar más de un dato estadístico por socio
        if (estadisticaSocioRepository.existsBySocioIdAndMesAnio(request.socioId(), request.mesAnio())) {
            throw new BusinessException("En un mes, no se puede almacenar más de un dato estadístico por socio. " +
                    "Ya existe un registro para el socio '" + socio.getNombre() + "' en el mes " + request.mesAnio());
        }

        // Rango de fechas del mes indicado
        YearMonth ym = YearMonth.parse(request.mesAnio());
        LocalDate inicio = ym.atDay(1);
        LocalDate fin = ym.atEndOfMonth();

        // Buscar alquileres realizados por ese socio en ese mes (por fecha de recogida)
        List<Alquiler> alquileresMes = alquilerRepository.findBySocioIdAndFechaRecogidaBetween(
                socio.getId(), inicio, fin
        );

        BigDecimal totalGastado = alquileresMes.stream()
                .map(Alquiler::getTotalPagar)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Crear la entidad con la fecha manual proporcionada por el usuario (sin LocalDate.now())
        EstadisticaSocio estadistica = EstadisticaSocio.builder()
                .socio(socio)
                .mesAnio(request.mesAnio())
                .fechaCreacion(request.fechaOperacion())
                .totalGastado(totalGastado)
                .build();

        return toResponse(estadisticaSocioRepository.save(estadistica));
    }

    @Transactional(readOnly = true)
    public List<EstadisticaSocioResponse> listarPorSocio(Long socioId) {
        // Valida que el socio exista
        socioService.obtenerEntidad(socioId);
        return estadisticaSocioRepository.findBySocioId(socioId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EstadisticaSocioResponse> listarTodas() {
        return estadisticaSocioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public EstadisticaSocioResponse toResponse(EstadisticaSocio e) {
        return new EstadisticaSocioResponse(
                e.getId(),
                e.getSocio().getId(),
                e.getSocio().getNombre(),
                e.getMesAnio(),
                e.getFechaCreacion(),
                e.getTotalGastado()
        );
    }
}
