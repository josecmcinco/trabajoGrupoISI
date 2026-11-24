package com.videoclub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EstadisticaSocioResponse(
        Long id,
        Long socioId,
        String socioNombre,
        String mesAnio,
        LocalDate fechaCreacion,
        BigDecimal totalGastado
) {}
