package com.langbridge.controller;

import com.langbridge.security.LangBridgeUserDetails;
import com.langbridge.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    @Autowired private DocumentService documentService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/documents/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetLanguage") String targetLanguage,
            @AuthenticationPrincipal LangBridgeUserDetails user) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File is empty"));
            }
            if (file.getSize() > 20 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File too large (max 20MB)"));
            }

            Map<String, Object> result = documentService.uploadAndProcess(file, user.getUserId(), targetLanguage);
            return ResponseEntity.ok(Map.of("success", true, "data", result));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("success", false, "message", "Processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/documents/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal LangBridgeUserDetails user) {
        try {
            List<Map<String, Object>> history = documentService.getUserHistory(user.getUserId());
            return ResponseEntity.ok(Map.of("success", true, "data", history));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "LangBridge API v1.0"));
    }

    @GetMapping("/audio/{filename}")
    public ResponseEntity<Resource> getAudio(@PathVariable String filename) throws Exception {
        Path audioPath = Paths.get("./audio-files").resolve(filename);
        Resource resource = new UrlResource(audioPath.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("audio/mpeg"))
            .body(resource);
    }
}
