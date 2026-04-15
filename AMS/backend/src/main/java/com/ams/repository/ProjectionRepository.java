package com.ams.repository;

import com.ams.entity.Projection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectionRepository extends JpaRepository<Projection, Long> {
    List<Projection> findByUserUserIdOrderByCalculatedDateDesc(Long userId);
    Optional<Projection> findByProjectionIdAndUserUserId(Long projId, Long userId);
}
