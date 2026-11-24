package com.siger.backend.config;

import com.siger.backend.model.Categoria;
import com.siger.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Precarga de forma idempotente las 4 categorías de calidad requeridas por SIGER.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

	private final CategoriaRepository categoriaRepository;

	@Override
	public void run(String... args) {
		if (categoriaRepository.count() == 0) {
			categoriaRepository.saveAll(List.of(
					Categoria.builder().nivel(1).nombre("Categoría 1 - Junior").precioPorHoja(new BigDecimal("15.00")).build(),
					Categoria.builder().nivel(2).nombre("Categoría 2 - Estándar").precioPorHoja(new BigDecimal("25.00")).build(),
					Categoria.builder().nivel(3).nombre("Categoría 3 - Senior").precioPorHoja(new BigDecimal("40.00")).build(),
					Categoria.builder().nivel(4).nombre("Categoría 4 - Especialista").precioPorHoja(new BigDecimal("60.00")).build()
			));
		}
	}
}
