package com.videoclub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PeliculaResponse(
        Long id,
        String nombre,
        String director,
        LocalDate fechaEstreno,
        BigDecimal precioAlquiler,
        Long videoclubId,
        String videoclubCiudad
) {}
