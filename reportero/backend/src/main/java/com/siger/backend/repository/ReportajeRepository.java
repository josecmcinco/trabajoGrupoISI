package com.siger.backend.repository;

import com.siger.backend.model.Reportaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportajeRepository extends JpaRepository<Reportaje, Long> {

	List<Reportaje> findAllByOrderByFechaCreacionDescIdDesc();
}
