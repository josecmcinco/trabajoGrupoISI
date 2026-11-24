package com.siger.backend;

import com.siger.backend.dto.ActualizarPrecioCategoriaRequest;
import com.siger.backend.dto.AprobarSolicitudRequest;
import com.siger.backend.dto.CategoriaResponse;
import com.siger.backend.dto.CrearSolicitudRequest;
import com.siger.backend.dto.PromocionarReporteroRequest;
import com.siger.backend.dto.ReporteroResponse;
import com.siger.backend.dto.SolicitudResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.model.Categoria;
import com.siger.backend.repository.CategoriaRepository;
import com.siger.backend.repository.ReporteroRepository;
import com.siger.backend.repository.SolicitudRepository;
import com.siger.backend.service.CategoriaService;
import com.siger.backend.service.ReporteroService;
import com.siger.backend.service.SolicitudService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class CategoriaAndReporteroIntegrationTest {

	@Autowired
	private CategoriaService categoriaService;

	@Autowired
	private ReporteroService reporteroService;

	@Autowired
	private SolicitudService solicitudService;

	@Autowired
	private CategoriaRepository categoriaRepository;

	@Autowired
	private SolicitudRepository solicitudRepository;

	@Autowired
	private ReporteroRepository reporteroRepository;

	@BeforeEach
	void limpiarDatos() {
		solicitudRepository.deleteAll();
		reporteroRepository.deleteAll();
	}

	@Test
	void dataInitializer_precargaCuatroCategoriasOrdenadasPorNivel() {
		List<CategoriaResponse> categorias = categoriaService.listarCategorias();

		assertThat(categorias).hasSize(4);
		assertThat(categorias).extracting(CategoriaResponse::nivel).containsExactly(1, 2, 3, 4);
	}

	@Test
	void actualizarPrecioCategoria_persisteNuevoPrecio() {
		Categoria nivel1 = categoriaRepository.findByNivel(1).orElseThrow();

		CategoriaResponse actualizada = categoriaService.actualizarPrecio(
				nivel1.getId(),
				new ActualizarPrecioCategoriaRequest(new BigDecimal("18.50"))
		);

		assertThat(actualizada.precioPorHoja()).isEqualByComparingTo("18.50");
	}

	@Test
	void promocionarReportero_soloPermiteAscenderACategoriaSuperior() {
		Categoria nivel1 = categoriaRepository.findByNivel(1).orElseThrow();
		Categoria nivel2 = categoriaRepository.findByNivel(2).orElseThrow();
		Categoria nivel3 = categoriaRepository.findByNivel(3).orElseThrow();

		SolicitudResponse solicitud = solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"44556677D", "Carlos", "Vega", "Calle Sur 8",
				"Granada", "18001", "633444555",
				LocalDate.of(2026, 1, 20), "Fujifilm X-T5", "Especialista en cultura"
		));
		solicitudService.aprobarSolicitud(solicitud.id(), new AprobarSolicitudRequest(nivel2.getId()));
		Long reporteroId = solicitud.reportero().id();

		// No puede bajar a nivel 1
		assertThatThrownBy(() -> reporteroService.promocionarReportero(reporteroId, new PromocionarReporteroRequest(nivel1.getId())))
				.isInstanceOf(BusinessRuleException.class);

		// No puede quedarse en el mismo nivel 2
		assertThatThrownBy(() -> reporteroService.promocionarReportero(reporteroId, new PromocionarReporteroRequest(nivel2.getId())))
				.isInstanceOf(BusinessRuleException.class);

		// Sí puede ascender a nivel 3
		ReporteroResponse promocionado = reporteroService.promocionarReportero(reporteroId, new PromocionarReporteroRequest(nivel3.getId()));
		assertThat(promocionado.categoria().nivel()).isEqualTo(3);
	}

	@Test
	void promocionarReportero_fueraDeBolsa_lanzaBusinessRuleException() {
		Categoria nivel2 = categoriaRepository.findByNivel(2).orElseThrow();
		SolicitudResponse solicitud = solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"55667788E", "Lucía", "Sanz", "Av. Libertad 3",
				"Zaragoza", "50001", "644555666",
				LocalDate.of(2026, 1, 20), null, "Redactora"
		));

		assertThatThrownBy(() -> reporteroService.promocionarReportero(
				solicitud.reportero().id(),
				new PromocionarReporteroRequest(nivel2.getId())
		)).isInstanceOf(BusinessRuleException.class)
				.hasMessageContaining("bolsa");
	}
}
