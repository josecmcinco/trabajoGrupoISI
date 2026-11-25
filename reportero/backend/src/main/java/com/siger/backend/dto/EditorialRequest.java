package com.siger.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EditorialRequest(
		@NotBlank(message = "El nombre de la editorial es obligatorio")
		@Size(max = 150, message = "El nombre de la editorial no puede superar los 150 caracteres")
		String nombre,

		@NotBlank(message = "El CIF de la editorial es obligatorio")
		@Size(max = 20, message = "El CIF de la editorial no puede superar los 20 caracteres")
		String cif,

		@NotBlank(message = "La dirección de la editorial es obligatoria")
		@Size(max = 250, message = "La dirección de la editorial no puede superar los 250 caracteres")
		String direccion
) {
}
