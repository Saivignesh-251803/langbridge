package com.langbridge.repository;

import com.langbridge.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    List<Translation> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Translation> findByDocumentId(Long documentId);
}
