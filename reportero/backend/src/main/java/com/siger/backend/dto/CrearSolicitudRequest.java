package com.siger.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CrearSolicitudRequest(
		@NotBlank(message = "El DNI del reportero es obligatorio")
		String dni,

		String nombre,
		String apellidos,
		String direccion,
		String ciudad,
		String codigoPostal,
		String telefono,

		LocalDate fecha,
		String equipoFotografico,

		@NotBlank(message = "El resumen del CV es obligatorio")
		String resumenCv
) {
}
