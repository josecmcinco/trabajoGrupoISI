package com.siger.backend;

import com.siger.backend.dto.AprobarSolicitudRequest;
import com.siger.backend.dto.CrearSolicitudRequest;
import com.siger.backend.dto.SolicitudResponse;
import com.siger.backend.exception.BusinessRuleException;
import com.siger.backend.exception.InvalidRequestException;
import com.siger.backend.model.Categoria;
import com.siger.backend.model.EstadoSolicitud;
import com.siger.backend.repository.CategoriaRepository;
import com.siger.backend.repository.ReporteroRepository;
import com.siger.backend.repository.SolicitudRepository;
import com.siger.backend.service.SolicitudService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class SolicitudServiceIntegrationTest {

	@Autowired
	private SolicitudService solicitudService;

	@Autowired
	private SolicitudRepository solicitudRepository;

	@Autowired
	private ReporteroRepository reporteroRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;

	@BeforeEach
	void limpiarDatos() {
		solicitudRepository.deleteAll();
		reporteroRepository.deleteAll();
	}

	@Test
	void crearPrimeraSolicitud_creaReporteroYSolicitudPendiente() {
		CrearSolicitudRequest request = new CrearSolicitudRequest(
				"12345678A", "Ana", "García López", "Calle Mayor 10",
				"Madrid", "28001", "600111222",
				LocalDate.of(2026, 1, 15), "Sony A7 IV", "10 años en prensa escrita"
		);

		SolicitudResponse response = solicitudService.crearSolicitud(request);

		assertThat(response.id()).isNotNull();
		assertThat(response.estado()).isEqualTo(EstadoSolicitud.PENDIENTE);
		assertThat(response.reportero().dni()).isEqualTo("12345678A");
		assertThat(response.reportero().nombre()).isEqualTo("Ana");
		assertThat(response.reportero().categoria()).isNull();
	}

	@Test
	void crearPrimeraSolicitud_sinDatosPersonales_lanzaInvalidRequestException() {
		CrearSolicitudRequest request = new CrearSolicitudRequest(
				"99999999Z", null, null, null, null, null, null,
				LocalDate.of(2026, 1, 15), "Nikon Z6", "CV breve"
		);

		assertThatThrownBy(() -> solicitudService.crearSolicitud(request))
				.isInstanceOf(InvalidRequestException.class);
	}

	@Test
	void crearSegundaSolicitud_enMismoMesOMenosDeUnMes_lanzaBusinessRuleException() {
		solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"12345678A", "Ana", "García", "Calle Mayor 10",
				"Madrid", "28001", "600111222",
				LocalDate.of(2026, 1, 15), "Sony A7 III", "CV inicial"
		));

		CrearSolicitudRequest intentoMismoMes = new CrearSolicitudRequest(
				"12345678A", null, null, null, null, null, null,
				LocalDate.of(2026, 1, 28), "Sony A7 IV", "CV actualizado"
		);

		assertThatThrownBy(() -> solicitudService.crearSolicitud(intentoMismoMes))
				.isInstanceOf(BusinessRuleException.class)
				.hasMessageContaining("más de una solicitud por mes");
	}

	@Test
	void crearSegundaSolicitud_mesSiguiente_mantieneHistoricoYDatosPersonalesInmutables() {
		solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"12345678A", "Ana", "García", "Calle Mayor 10",
				"Madrid", "28001", "600111222",
				LocalDate.of(2026, 1, 15), "Sony A7 III", "CV inicial"
		));

		SolicitudResponse segunda = solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"12345678a", "OtroNombre", "OtroApellido", "OtraCalle",
				"Sevilla", "41001", "699999999",
				LocalDate.of(2026, 2, 16), "Sony A7 IV + 24-70mm", "CV ampliado con reportajes"
		));

		assertThat(segunda.reportero().nombre()).isEqualTo("Ana");
		assertThat(segunda.reportero().ciudad()).isEqualTo("Madrid");
		assertThat(segunda.equipoFotografico()).isEqualTo("Sony A7 IV + 24-70mm");
		assertThat(segunda.resumenCv()).isEqualTo("CV ampliado con reportajes");
		assertThat(solicitudService.listarSolicitudes()).hasSize(2);
	}

	@Test
	void aprobarSolicitud_asignaCategoriaYApareceEnAceptadas() {
		SolicitudResponse creada = solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"22334455B", "Luis", "Martín", "Av. Sol 5",
				"Valencia", "46001", "611222333",
				LocalDate.of(2026, 1, 10), "Canon R6", "Periodista freelance"
		));
		Categoria nivel2 = categoriaRepository.findByNivel(2).orElseThrow();

		SolicitudResponse aprobada = solicitudService.aprobarSolicitud(creada.id(), new AprobarSolicitudRequest(nivel2.getId()));

		assertThat(aprobada.estado()).isEqualTo(EstadoSolicitud.APROBADA);
		assertThat(aprobada.reportero().categoria()).isNotNull();
		assertThat(aprobada.reportero().categoria().nivel()).isEqualTo(2);

		List<SolicitudResponse> aceptadas = solicitudService.listarSolicitudesAceptadas();
		assertThat(aceptadas).hasSize(1);
		assertThat(aceptadas.getFirst().id()).isEqualTo(creada.id());
	}

	@Test
	void rechazarSolicitud_impideAprobarlaPosteriormente() {
		SolicitudResponse creada = solicitudService.crearSolicitud(new CrearSolicitudRequest(
				"33445566C", "Marta", "Ruiz", "Plaza Norte 2",
				"Bilbao", "48001", "622333444",
				LocalDate.of(2026, 1, 5), null, "Recién graduada"
		));
		Categoria nivel1 = categoriaRepository.findByNivel(1).orElseThrow();

		SolicitudResponse rechazada = solicitudService.rechazarSolicitud(creada.id());
		assertThat(rechazada.estado()).isEqualTo(EstadoSolicitud.RECHAZADA);

		assertThatThrownBy(() -> solicitudService.aprobarSolicitud(creada.id(), new AprobarSolicitudRequest(nivel1.getId())))
				.isInstanceOf(BusinessRuleException.class);
	}
}
