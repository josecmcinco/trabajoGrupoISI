package com.videoclub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AlquilerResponse(
        Long id,
        Long socioId,
        String socioNombre,
        Long videoclubId,
        String videoclubCiudad,
        LocalDate fechaRecogida,
        LocalDate fechaDevolucion,
        BigDecimal totalPagar,
        List<PeliculaResponse> peliculas
) {}
