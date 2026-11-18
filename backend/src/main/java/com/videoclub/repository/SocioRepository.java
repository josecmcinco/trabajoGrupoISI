package com.videoclub.repository;

import com.videoclub.model.Socio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocioRepository extends JpaRepository<Socio, Long> {
    List<Socio> findByVideoclubOrigenId(Long videoclubId);
}
