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
import java.util.Map;

@Service
public class TtsService {

    @Value("${tts.service.url}")
    private String ttsServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateAudio(String text, String languageCode) throws Exception {
        String requestBody = objectMapper.writeValueAsString(Map.of(
            "text", text,
            "lang", languageCode
        ));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(ttsServiceUrl + "/tts/generate"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode node = objectMapper.readTree(response.body());
            return node.path("filename").asText();
        }
        throw new RuntimeException("TTS service error: " + response.statusCode());
    }
}
