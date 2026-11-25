package com.siger.backend.repository;

import com.siger.backend.model.Editorial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EditorialRepository extends JpaRepository<Editorial, Long> {

	List<Editorial> findAllByOrderByNombreAsc();

	boolean existsByCifIgnoreCase(String cif);

	boolean existsByCifIgnoreCaseAndIdNot(String cif, Long id);
}
