package com.videoclub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "videoclubs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Videoclub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del gerente es obligatorio")
    @Column(nullable = false)
    private String nombreGerente;

    @NotBlank(message = "La ciudad es obligatoria")
    @Column(nullable = false)
    private String ciudad;

    @NotBlank(message = "La calle es obligatoria")
    @Column(nullable = false)
    private String calle;

    @NotBlank(message = "El código postal es obligatorio")
    @Size(min = 5, max = 5, message = "El código postal debe tener exactamente 5 caracteres")
    @Column(nullable = false, length = 5)
    private String codigoPostal;
}
