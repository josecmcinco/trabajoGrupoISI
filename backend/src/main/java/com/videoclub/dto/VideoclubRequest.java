package com.videoclub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VideoclubRequest(
        @NotBlank(message = "El nombre del gerente es obligatorio")
        String nombreGerente,

        @NotBlank(message = "La ciudad es obligatoria")
        String ciudad,

        @NotBlank(message = "La calle es obligatoria")
        String calle,

        @NotBlank(message = "El código postal es obligatorio")
        @Size(min = 5, max = 5, message = "El código postal debe tener exactamente 5 caracteres")
        String codigoPostal
) {}
