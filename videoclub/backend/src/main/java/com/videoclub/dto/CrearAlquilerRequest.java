package com.videoclub.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CrearAlquilerRequest(
        @NotNull(message = "El ID del socio es obligatorio")
        Long socioId,

        @NotNull(message = "El ID del videoclub es obligatorio")
        Long videoclubId,

        @NotEmpty(message = "Debe incluir al menos una película en el alquiler")
        List<Long> peliculaIds,

        @NotNull(message = "La fecha de recogida manual es obligatoria")
        LocalDate fechaRecogida,

        @NotNull(message = "La fecha de devolución manual es obligatoria")
        LocalDate fechaDevolucion
) {}
