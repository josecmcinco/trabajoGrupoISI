package com.videoclub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "estadisticas_socios",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_socio_mes_anio", columnNames = {"socio_id", "mes_anio"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticaSocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El socio es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    @NotBlank(message = "El mes/año es obligatorio")
    @Column(name = "mes_anio", nullable = false)
    private String mesAnio; // Formato esperado "YYYY-MM" o "MM"

    @NotNull(message = "La fecha de creación es obligatoria")
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDate fechaCreacion;

    @NotNull(message = "El total gastado es obligatorio")
    @Column(name = "total_gastado", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalGastado;
}
