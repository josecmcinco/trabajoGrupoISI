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

import java.time.LocalDateTime;

/**
 * Reportaje fotográfico registrado por un reportero perteneciente a la bolsa de Journ SL.
 */
@Entity
@Table(name = "reportajes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reportaje {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "reportero_id", nullable = false)
	private Reportero reportero;

	@Column(name = "numero_fotos", nullable = false)
	private Integer numeroFotos;

	@Column(nullable = false, length = 1000)
	private String descripcion;

	@Column(name = "fecha_creacion", nullable = false)
	private LocalDateTime fechaCreacion;
}
