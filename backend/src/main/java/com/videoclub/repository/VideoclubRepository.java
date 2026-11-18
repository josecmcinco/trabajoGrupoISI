package com.videoclub.repository;

import com.videoclub.model.Videoclub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoclubRepository extends JpaRepository<Videoclub, Long> {
}
