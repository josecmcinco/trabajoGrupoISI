package com.siger.backend.repository;

import com.siger.backend.model.Reportero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReporteroRepository extends JpaRepository<Reportero, Long> {

	Optional<Reportero> findByDniIgnoreCase(String dni);

	List<Reportero> findByCategoriaIsNotNullOrderByApellidosAscNombreAsc();

	List<Reportero> findAllByOrderByApellidosAscNombreAsc();
}
