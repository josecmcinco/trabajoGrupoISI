package com.siger.backend.repository;

import com.siger.backend.model.EstadoSolicitud;
import com.siger.backend.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

	List<Solicitud> findAllByOrderByFechaDescIdDesc();

	List<Solicitud> findByEstadoOrderByFechaDescIdDesc(EstadoSolicitud estado);

	Optional<Solicitud> findTopByReporteroIdOrderByFechaDescIdDesc(Long reporteroId);
}
