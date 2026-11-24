package com.siger.backend.repository;

import com.siger.backend.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

	List<Categoria> findAllByOrderByNivelAsc();

	Optional<Categoria> findByNivel(Integer nivel);
}
