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

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Albarán de compra emitido cuando una editorial adquiere un reportaje fotográfico.
 */
@Entity
@Table(name = "albaranes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Albaran {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "reportaje_id", nullable = false)
	private Reportaje reportaje;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "editorial_id", nullable = false)
	private Editorial editorial;

	@Column(name = "precio_editorial", nullable = false, precision = 12, scale = 2)
	private BigDecimal precioEditorial;

	@Column(name = "precio_reportero", nullable = false, precision = 12, scale = 2)
	private BigDecimal precioReportero;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion;
}
