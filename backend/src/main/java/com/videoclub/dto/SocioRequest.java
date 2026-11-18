package com.videoclub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SocioRequest(
        @NotBlank(message = "El nombre del socio es obligatorio")
        String nombre,

        @NotNull(message = "La edad es obligatoria")
        @Min(value = 0, message = "La edad no puede ser negativa")
        Integer edad,

        @NotNull(message = "El ID del videoclub de registro es obligatorio")
        Long videoclubOrigenId
) {}
