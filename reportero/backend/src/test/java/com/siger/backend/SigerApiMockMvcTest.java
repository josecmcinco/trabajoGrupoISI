package com.siger.backend;

import com.siger.backend.model.Categoria;
import com.siger.backend.repository.CategoriaRepository;
import com.siger.backend.repository.ReporteroRepository;
import com.siger.backend.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SigerApiMockMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CategoriaRepository categoriaRepository;

	@Autowired
	private SolicitudRepository solicitudRepository;

	@Autowired
	private ReporteroRepository reporteroRepository;

	@BeforeEach
	void limpiar() {
		solicitudRepository.deleteAll();
		reporteroRepository.deleteAll();
	}

	@Test
	void flujoCompletoApiRest_ejercicio1() throws Exception {
		// 1. Listar categorías iniciales
		mockMvc.perform(get("/api/categorias"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(4));

		Categoria nivel1 = categoriaRepository.findByNivel(1).orElseThrow();
		Categoria nivel2 = categoriaRepository.findByNivel(2).orElseThrow();

		// 2. Actualizar precio de categoría
		mockMvc.perform(put("/api/categorias/{id}/precio", nivel1.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"precioPorHoja\": 19.95}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.precioPorHoja").value(19.95));

		// 3. Crear primera solicitud
		String bodySolicitud = """
				{
				  "dni": "77889900F",
				  "nombre": "Elena",
				  "apellidos": "Navarro",
				  "direccion": "Calle Real 12",
				  "ciudad": "Málaga",
				  "codigoPostal": "29001",
				  "telefono": "655666777",
				  "fecha": "2026-01-12",
				  "equipoFotografico": "Canon EOS R5",
				  "resumenCv": "Reportera internacional"
				}
				""";

		mockMvc.perform(post("/api/solicitudes")
						.contentType(MediaType.APPLICATION_JSON)
						.content(bodySolicitud))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.estado").value("PENDIENTE"))
				.andExpect(jsonPath("$.reportero.dni").value("77889900F"));

		// 4. Intentar segunda solicitud en el mismo mes -> 409 Conflict
		String bodyMismoMes = """
				{
				  "dni": "77889900F",
				  "fecha": "2026-01-25",
				  "resumenCv": "Nuevo CV"
				}
				""";

		mockMvc.perform(post("/api/solicitudes")
						.contentType(MediaType.APPLICATION_JSON)
						.content(bodyMismoMes))
				.andExpect(status().isConflict());

		Long solicitudId = solicitudRepository.findAll().getFirst().getId();

		// 5. Aprobar solicitud
		mockMvc.perform(post("/api/solicitudes/{id}/aprobar", solicitudId)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"categoriaId\": " + nivel1.getId() + "}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.estado").value("APROBADA"))
				.andExpect(jsonPath("$.reportero.categoria.nivel").value(1));

		// 6. Listar aceptadas
		mockMvc.perform(get("/api/solicitudes/aceptadas"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1));

		// 7. Promocionar reportero a nivel 2
		Long reporteroId = reporteroRepository.findByDniIgnoreCase("77889900F").orElseThrow().getId();
		mockMvc.perform(post("/api/reporteros/{id}/promocionar", reporteroId)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"categoriaId\": " + nivel2.getId() + "}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.categoria.nivel").value(2));
	}
}
