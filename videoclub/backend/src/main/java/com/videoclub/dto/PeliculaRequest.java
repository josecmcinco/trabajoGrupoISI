package com.videoclub.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PeliculaRequest(
        @NotBlank(message = "El nombre de la película es obligatorio")
        String nombre,

        String director,

        @NotNull(message = "La fecha de estreno es obligatoria")
        LocalDate fechaEstreno,

        @NotNull(message = "El precio de alquiler es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de alquiler debe ser mayor que 0")
        BigDecimal precioAlquiler,

        @NotNull(message = "El ID del videoclub es obligatorio")
        Long videoclubId
) {}
