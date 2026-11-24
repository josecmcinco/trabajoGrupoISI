package com.siger.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDate;

/**
 * Solicitud presentada por un reportero para ingresar en la bolsa de Journ SL.
 */
@Entity
@Table(name = "solicitudes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private LocalDate fecha;

	@Column(name = "equipo_fotografico", length = 1000)
	private String equipoFotografico;

	@Column(name = "resumen_cv", nullable = false, length = 2000)
	private String resumenCv;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "reportero_id", nullable = false)
	private Reportero reportero;
}
