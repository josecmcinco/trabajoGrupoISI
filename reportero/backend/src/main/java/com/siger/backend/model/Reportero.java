package com.siger.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Reportero profesional libre. Sus datos personales son inmutables entre solicitudes.
 * La categoría permanece nula hasta que alguna de sus solicitudes es aprobada.
 */
@Entity
@Table(name = "reporteros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reportero {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 20)
	private String dni;

	@Column(nullable = false, length = 100)
	private String nombre;

	@Column(nullable = false, length = 150)
	private String apellidos;

	@Column(nullable = false, length = 250)
	private String direccion;

	@Column(nullable = false, length = 100)
	private String ciudad;

	@Column(name = "codigo_postal", nullable = false, length = 10)
	private String codigoPostal;

	@Column(nullable = false, length = 20)
	private String telefono;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "categoria_id")
	private Categoria categoria;
}
