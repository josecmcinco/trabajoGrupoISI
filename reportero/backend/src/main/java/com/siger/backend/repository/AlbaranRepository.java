package com.siger.backend.repository;

import com.siger.backend.model.Albaran;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlbaranRepository extends JpaRepository<Albaran, Long> {

	List<Albaran> findAllByOrderByFechaCreacionDescIdDesc();

	boolean existsByEditorialId(Long editorialId);
}
