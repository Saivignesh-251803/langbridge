package com.langbridge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "translations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Translation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "source_language", length = 50)
    private String sourceLanguage = "auto";

    @Column(name = "target_language", nullable = false, length = 50)
    private String targetLanguage;

    @Column(name = "original_text", columnDefinition = "LONGTEXT")
    private String originalText;

    @Column(name = "simplified_text", columnDefinition = "LONGTEXT")
    private String simplifiedText;

    @Column(name = "action_steps", columnDefinition = "JSON")
    private String actionSteps;

    @Column(name = "deadline_date")
    private LocalDate deadlineDate;

    @Column(name = "document_category", length = 100)
    private String documentCategory;

    @Column(name = "urgency_level", length = 20)
    private String urgencyLevel = "NORMAL";

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "processing_status", length = 50)
    private String processingStatus = "PENDING";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
