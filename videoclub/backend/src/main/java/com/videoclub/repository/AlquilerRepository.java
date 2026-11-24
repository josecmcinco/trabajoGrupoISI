package com.videoclub.repository;

import com.videoclub.model.Alquiler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AlquilerRepository extends JpaRepository<Alquiler, Long> {
    List<Alquiler> findBySocioId(Long socioId);
    List<Alquiler> findByVideoclubId(Long videoclubId);

    @Query("SELECT a FROM Alquiler a WHERE a.socio.id = :socioId AND a.fechaRecogida BETWEEN :inicio AND :fin")
    List<Alquiler> findBySocioIdAndFechaRecogidaBetween(
            @Param("socioId") Long socioId,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );
}
