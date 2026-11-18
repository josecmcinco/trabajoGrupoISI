package com.videoclub.repository;

import com.videoclub.model.EstadisticaSocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstadisticaSocioRepository extends JpaRepository<EstadisticaSocio, Long> {
    boolean existsBySocioIdAndMesAnio(Long socioId, String mesAnio);
    List<EstadisticaSocio> findBySocioId(Long socioId);
}
