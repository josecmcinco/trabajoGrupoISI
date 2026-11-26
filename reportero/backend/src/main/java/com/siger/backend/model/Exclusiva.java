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

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Exclusiva fotográfica solicitada por una editorial y ofertada en la agencia.
 */
@Entity
@Table(name = "exclusivas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exclusiva {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "editorial_id", nullable = false)
	private Editorial editorial;

	@Column(nullable = false, length = 1000)
	private String tematica;

	@Column(name = "precio_reportero", nullable = false, precision = 12, scale = 2)
	private BigDecimal precioReportero;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private EstadoExclusiva estado = EstadoExclusiva.OFERTADA;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "reportero_id")
	private Reportero reportero;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDate fechaCreacion;

	@Column(name = "fecha_asignacion")
	private LocalDate fechaAsignacion;

	@Column(name = "fecha_finalizacion")
	private LocalDate fechaFinalizacion;
}
