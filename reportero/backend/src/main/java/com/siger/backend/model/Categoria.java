package com.siger.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Categoría de calidad para reporteros en bolsa (niveles 1 a 4) con precio fijo por hoja escrita.
 */
@Entity
@Table(name = "categorias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private Integer nivel;

	@Column(nullable = false, length = 100)
	private String nombre;

	@Column(name = "precio_por_hoja", nullable = false, precision = 10, scale = 2)
	private BigDecimal precioPorHoja;

	@Column(name = "precio_por_foto", precision = 10, scale = 2)
	private BigDecimal precioPorFoto;
}
