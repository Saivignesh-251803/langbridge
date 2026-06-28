package com.langbridge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class GeminiService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final String MODEL = "llama3-70b-8192";

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30))
        .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> analyzeAndTranslateDocument(String documentText, String targetLanguage) {
        String languageName = getLanguageName(targetLanguage);
        String prompt = buildPrompt(documentText, languageName);
        try {
            String response = callGroq(prompt);
            return parseResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("AI processing failed: " + e.getMessage(), e);
        }
    }

    public String analyzeImageDocument(String base64Image, String mimeType, String targetLanguage) {
        String languageName = getLanguageName(targetLanguage);
        String prompt = "Analyze this legal document image. Respond ONLY in JSON with fields: documentCategory, urgencyLevel, deadlineDate, simplifiedExplanation in " + languageName + ", keyPoints array, actionSteps array, warningMessage, officialOffice";
        try { return callGroq(prompt); } catch (Exception e) { throw new RuntimeException(e.getMessage(), e); }
    }

    private String buildPrompt(String documentText, String languageName) {
        return "You are a legal expert helping rural Indian citizens. Analyze the document and respond ONLY in valid JSON (no markdown).\n\nDOCUMENT:\n" + documentText + "\n\nJSON:{\"documentCategory\":\"COURT_NOTICE\",\"urgencyLevel\":\"NORMAL\",\"deadlineDate\":null,\"simplifiedExplanation\":\"explanation in " + languageName + "\",\"keyPoints\":[\"point in " + languageName + "\"],\"actionSteps\":[{\"stepNumber\":1,\"action\":\"step in " + languageName + "\",\"deadline\":null,\"where\":null}],\"warningMessage\":null,\"officialOffice\":null}";
    }

    private String callGroq(String prompt) throws Exception {
        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> body = Map.of("model", MODEL, "messages", List.of(message), "temperature", 0.1, "max_tokens", 2048);
        String requestBody = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(GROQ_URL))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .timeout(Duration.ofSeconds(60))
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new RuntimeException("Groq error " + response.statusCode() + ": " + response.body());
        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseResponse(String jsonText) {
        try {
            String cleaned = jsonText.trim();
            if (cleaned.contains("```")) {
                cleaned = cleaned.replaceAll("(?s)```json", "").replaceAll("(?s)```", "").trim();
            }
            int start = cleaned.indexOf("{");
            int end = cleaned.lastIndexOf("}");
            if (start >= 0 && end >= 0) cleaned = cleaned.substring(start, end + 1);
            return objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) { throw new RuntimeException("Parse failed: " + e.getMessage()); }
    }

    private String getLanguageName(String code) {
        return switch (code) {
            case "hi" -> "Hindi";
            case "te" -> "Telugu";
            case "ta" -> "Tamil";
            case "mr" -> "Marathi";
            case "bn" -> "Bengali";
            case "ml" -> "Malayalam";
            default -> "English";
        };
    }
}
