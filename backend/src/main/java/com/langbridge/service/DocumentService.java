package com.langbridge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.langbridge.model.Document;
import com.langbridge.model.Translation;
import com.langbridge.model.User;
import com.langbridge.repository.DocumentRepository;
import com.langbridge.repository.TranslationRepository;
import com.langbridge.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@Service
public class DocumentService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Autowired private DocumentRepository documentRepository;
    @Autowired private TranslationRepository translationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GeminiService geminiService;
    @Autowired private TtsService ttsService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> uploadAndProcess(MultipartFile file, Long userId, String targetLanguage) throws IOException {
        // Save file
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + "." + ext;
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Save document record
        Document document = Document.builder()
            .user(user)
            .originalFilename(originalName)
            .storedFilename(storedName)
            .fileType(ext.toUpperCase())
            .fileSize(file.getSize())
            .uploadStatus("PROCESSING")
            .build();
        document = documentRepository.save(document);

        // Create pending translation record
        Translation translation = Translation.builder()
            .document(document)
            .user(user)
            .targetLanguage(targetLanguage)
            .processingStatus("PROCESSING")
            .build();
        translation = translationRepository.save(translation);

        // Process based on file type
        Map<String, Object> result;
        String contentType = file.getContentType();

        if (isImage(contentType)) {
            result = processImage(file, targetLanguage);
        } else if ("application/pdf".equals(contentType) || "pdf".equalsIgnoreCase(ext)) {
            result = processPdf(filePath, targetLanguage);
        } else if (isWordDoc(contentType, ext)) {
            result = processWord(filePath, targetLanguage);
        } else {
            // Plain text
            String text = new String(file.getBytes());
            result = geminiService.analyzeAndTranslateDocument(text, targetLanguage);
        }

        // Save translation result
        String simplifiedText = (String) result.getOrDefault("simplifiedExplanation", "");
        String actionStepsJson = objectMapper.writeValueAsString(result.get("actionSteps"));

        translation.setSimplifiedText(simplifiedText);
        translation.setActionSteps(actionStepsJson);
        translation.setDocumentCategory((String) result.getOrDefault("documentCategory", "OTHER"));
        translation.setUrgencyLevel((String) result.getOrDefault("urgencyLevel", "NORMAL"));
        translation.setOriginalText((String) result.getOrDefault("extractedText", ""));

        String deadlineStr = (String) result.get("deadlineDate");
        if (deadlineStr != null && !deadlineStr.equals("null")) {
            try { translation.setDeadlineDate(LocalDate.parse(deadlineStr)); } catch (Exception ignored) {}
        }

        // Generate audio via TTS Node service
        try {
            String audioFilename = ttsService.generateAudio(simplifiedText, targetLanguage);
            translation.setAudioUrl("/audio/" + audioFilename);
        } catch (Exception e) {
            // Audio is optional — don't fail if TTS fails
        }

        translation.setProcessingStatus("COMPLETED");
        translationRepository.save(translation);

        document.setUploadStatus("PROCESSED");
        documentRepository.save(document);

        // Build response
        result.put("translationId", translation.getId());
        result.put("documentId", document.getId());
        result.put("audioUrl", translation.getAudioUrl());
        return result;
    }

    private Map<String, Object> processImage(MultipartFile file, String targetLanguage) throws IOException {
        byte[] bytes = file.getBytes();
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String mimeType = file.getContentType();
        String rawJson = geminiService.analyzeImageDocument(base64, mimeType, targetLanguage);
        return objectMapper.readValue(rawJson, Map.class);
    }

    private Map<String, Object> processPdf(Path filePath, String targetLanguage) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdf);
            if (text.trim().isEmpty()) {
                // Scanned PDF - would need OCR in production
                text = "[Scanned PDF detected. Text extraction limited. Please use a clearer image or text-based PDF.]";
            }
            return geminiService.analyzeAndTranslateDocument(text, targetLanguage);
        }
    }

    private Map<String, Object> processWord(Path filePath, String targetLanguage) throws IOException {
        try (InputStream is = Files.newInputStream(filePath);
             XWPFDocument doc = new XWPFDocument(is)) {
            StringBuilder sb = new StringBuilder();
            doc.getParagraphs().forEach(p -> sb.append(p.getText()).append("\n"));
            return geminiService.analyzeAndTranslateDocument(sb.toString(), targetLanguage);
        }
    }

    public List<Map<String, Object>> getUserHistory(Long userId) {
        return translationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(t -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("translationId", t.getId());
                map.put("documentId", t.getDocument().getId());
                map.put("filename", t.getDocument().getOriginalFilename());
                map.put("documentCategory", t.getDocumentCategory());
                map.put("urgencyLevel", t.getUrgencyLevel());
                map.put("targetLanguage", t.getTargetLanguage());
                map.put("simplifiedText", t.getSimplifiedText());
                map.put("actionSteps", t.getActionSteps());
                map.put("audioUrl", t.getAudioUrl());
                map.put("deadlineDate", t.getDeadlineDate());
                map.put("createdAt", t.getCreatedAt());
                return map;
            }).toList();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private boolean isImage(String contentType) {
        return contentType != null && (contentType.startsWith("image/jpeg") ||
            contentType.startsWith("image/png") || contentType.startsWith("image/webp"));
    }

    private boolean isWordDoc(String contentType, String ext) {
        return "docx".equalsIgnoreCase(ext) ||
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType);
    }
}
