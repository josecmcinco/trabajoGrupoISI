package com.videoclub.config;

import com.videoclub.model.*;
import com.videoclub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final VideoclubRepository videoclubRepository;
    private final PeliculaRepository peliculaRepository;
    private final SocioRepository socioRepository;
    private final AlquilerRepository alquilerRepository;
    private final AdministradorRepository administradorRepository;

    @Override
    public void run(String... args) {
        if (videoclubRepository.count() > 0) {
            log.info("Base de datos ya inicializada con datos previos. Saltando DataSeeder.");
            return;
        }

        log.info("Inicializando datos de prueba para la cadena de videoclubs APPV...");

        // 1. Videoclubs
        Videoclub vMadrid = videoclubRepository.save(Videoclub.builder()
                .nombreGerente("Carlos Gómez")
                .ciudad("Madrid")
                .calle("Gran Vía 42")
                .codigoPostal("28013")
                .build());

        Videoclub vBarcelona = videoclubRepository.save(Videoclub.builder()
                .nombreGerente("Laura Martínez")
                .ciudad("Barcelona")
                .calle("Paseo de Gracia 15")
                .codigoPostal("08007")
                .build());

        // 2. Películas (Nota: 'Matrix' existe en ambas sedes con mismo nombre pero distinto código/videoclub)
        Pelicula p1 = peliculaRepository.save(Pelicula.builder()
                .nombre("Inception")
                .director("Christopher Nolan")
                .fechaEstreno(LocalDate.of(2010, 7, 16))
                .precioAlquiler(new BigDecimal("3.50"))
                .videoclub(vMadrid)
                .build());

        Pelicula p2 = peliculaRepository.save(Pelicula.builder()
                .nombre("Matrix")
                .director("Hermanas Wachowski")
                .fechaEstreno(LocalDate.of(1999, 3, 31))
                .precioAlquiler(new BigDecimal("2.99"))
                .videoclub(vMadrid)
                .build());

        Pelicula p3 = peliculaRepository.save(Pelicula.builder()
                .nombre("Matrix")
                .director("Hermanas Wachowski")
                .fechaEstreno(LocalDate.of(1999, 3, 31))
                .precioAlquiler(new BigDecimal("3.20"))
                .videoclub(vBarcelona)
                .build());

        Pelicula p4 = peliculaRepository.save(Pelicula.builder()
                .nombre("Interstellar")
                .director("Christopher Nolan")
                .fechaEstreno(LocalDate.of(2014, 11, 7))
                .precioAlquiler(new BigDecimal("3.80"))
                .videoclub(vBarcelona)
                .build());

        // 3. Socios (El socio se registra en un videoclub pero puede alquilar en cualquiera)
        Socio s1 = socioRepository.save(Socio.builder()
                .nombre("Alejandro Pérez")
                .edad(28)
                .videoclubOrigen(vMadrid)
                .build());

        Socio s2 = socioRepository.save(Socio.builder()
                .nombre("Beatriz Sánchez")
                .edad(34)
                .videoclubOrigen(vBarcelona)
                .build());

        // 4. Administrador
        administradorRepository.save(Administrador.builder()
                .nombre("Admin General APPV")
                .build());

        // 5. Alquiler de ejemplo (demuestra que el socio de Madrid puede alquilar en Barcelona)
        BigDecimal totalAlquiler = p3.getPrecioAlquiler().add(p4.getPrecioAlquiler());
        alquilerRepository.save(Alquiler.builder()
                .socio(s1)
                .videoclub(vBarcelona)
                .fechaRecogida(LocalDate.of(2026, 11, 1))
                .fechaDevolucion(LocalDate.of(2026, 11, 8))
                .totalPagar(totalAlquiler)
                .peliculas(List.of(p3, p4))
                .build());

        log.info("Inicialización de datos de prueba completada con éxito.");
    }
}
