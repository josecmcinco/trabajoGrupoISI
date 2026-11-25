package com.siger.backend.config;

import com.siger.backend.model.Categoria;
import com.siger.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Precarga de forma idempotente las 4 categorías de calidad requeridas por SIGER.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

	private static final Map<Integer, BigDecimal> PRECIOS_FOTO_DEFECTO = Map.of(
			1, new BigDecimal("10.00"),
			2, new BigDecimal("18.00"),
			3, new BigDecimal("30.00"),
			4, new BigDecimal("45.00")
	);

	private final CategoriaRepository categoriaRepository;

	@Override
	@Transactional
	public void run(String... args) {
		if (categoriaRepository.count() == 0) {
			categoriaRepository.saveAll(List.of(
					Categoria.builder()
							.nivel(1)
							.nombre("Categoría 1 - Junior")
							.precioPorHoja(new BigDecimal("15.00"))
							.precioPorFoto(PRECIOS_FOTO_DEFECTO.get(1))
							.build(),
					Categoria.builder()
							.nivel(2)
							.nombre("Categoría 2 - Estándar")
							.precioPorHoja(new BigDecimal("25.00"))
							.precioPorFoto(PRECIOS_FOTO_DEFECTO.get(2))
							.build(),
					Categoria.builder()
							.nivel(3)
							.nombre("Categoría 3 - Senior")
							.precioPorHoja(new BigDecimal("40.00"))
							.precioPorFoto(PRECIOS_FOTO_DEFECTO.get(3))
							.build(),
					Categoria.builder()
							.nivel(4)
							.nombre("Categoría 4 - Especialista")
							.precioPorHoja(new BigDecimal("60.00"))
							.precioPorFoto(PRECIOS_FOTO_DEFECTO.get(4))
							.build()
			));
			return;
		}

		// Asegurar compatibilidad idempotente si ya existían categorías previas sin precioPorFoto
		List<Categoria> categoriasSinPrecioFoto = categoriaRepository.findAll().stream()
				.filter(c -> c.getPrecioPorFoto() == null)
				.toList();
		if (!categoriasSinPrecioFoto.isEmpty()) {
			for (Categoria categoria : categoriasSinPrecioFoto) {
				BigDecimal defecto = PRECIOS_FOTO_DEFECTO.getOrDefault(categoria.getNivel(), new BigDecimal("10.00"));
				categoria.setPrecioPorFoto(defecto);
			}
			categoriaRepository.saveAll(categoriasSinPrecioFoto);
		}
	}
}
