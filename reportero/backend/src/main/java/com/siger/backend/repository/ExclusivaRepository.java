package com.siger.backend.repository;

import com.siger.backend.model.EstadoExclusiva;
import com.siger.backend.model.Exclusiva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExclusivaRepository extends JpaRepository<Exclusiva, Long> {

	List<Exclusiva> findAllByOrderByFechaCreacionDescIdDesc();

	List<Exclusiva> findByEstadoOrderByFechaCreacionDescIdDesc(EstadoExclusiva estado);
}
