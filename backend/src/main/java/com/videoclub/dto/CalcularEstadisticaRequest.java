package com.videoclub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CalcularEstadisticaRequest(
        @NotNull(message = "El ID del socio es obligatorio")
        Long socioId,

        @NotBlank(message = "El mes/año es obligatorio")
        @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "El formato de mes/año debe ser YYYY-MM (ej. 2026-11)")
        String mesAnio,

        @NotNull(message = "La fecha manual de la operación es obligatoria")
        LocalDate fechaOperacion
) {}
