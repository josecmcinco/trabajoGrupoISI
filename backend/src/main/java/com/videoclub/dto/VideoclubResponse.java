package com.videoclub.dto;

public record VideoclubResponse(
        Long id,
        String nombreGerente,
        String ciudad,
        String calle,
        String codigoPostal
) {}
