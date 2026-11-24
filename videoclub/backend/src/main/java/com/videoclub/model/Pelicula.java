package com.videoclub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "peliculas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pelicula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la película es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @Column
    private String director;

    @NotNull(message = "La fecha de estreno es obligatoria")
    @Column(nullable = false)
    private LocalDate fechaEstreno;

    @NotNull(message = "El precio de alquiler es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio de alquiler debe ser mayor que 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAlquiler;

    @NotNull(message = "El videoclub al que pertenece es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "videoclub_id", nullable = false)
    private Videoclub videoclub;
}
