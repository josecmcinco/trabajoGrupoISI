package com.videoclub.dto;

public record SocioResponse(
        Long id,
        String nombre,
        Integer edad,
        Long videoclubOrigenId,
        String videoclubOrigenCiudad
) {}
