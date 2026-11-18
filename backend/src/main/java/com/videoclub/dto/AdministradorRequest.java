package com.videoclub.dto;

import jakarta.validation.constraints.NotBlank;

public record AdministradorRequest(
        @NotBlank(message = "El nombre del administrador es obligatorio")
        String nombre
) {}
