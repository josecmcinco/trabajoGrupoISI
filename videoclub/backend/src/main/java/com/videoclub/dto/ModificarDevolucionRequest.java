package com.videoclub.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ModificarDevolucionRequest(
        @NotNull(message = "La nueva fecha de devolución es obligatoria")
        LocalDate nuevaFechaDevolucion,

        @NotNull(message = "La fecha actual de referencia indicada por el usuario es obligatoria")
        LocalDate fechaReferenciaUsuario
) {}
