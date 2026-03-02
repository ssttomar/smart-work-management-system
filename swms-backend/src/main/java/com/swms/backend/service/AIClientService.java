package com.swms.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * AIClientService — thin HTTP client for the OpenAI Chat Completions API.
 *
 * Uses Java 11's built-in {@link java.net.http.HttpClient} so no extra
 * Maven dependency is required. Jackson (already on classpath via
 * spring-boot-starter-web) handles JSON serialisation.
 *
 * API CALL STRUCTURE:
 * ┌─────────────────────────────────────────────────────────┐
 * │ POST {apiUrl}                                           │
 * │   Authorization: Bearer {apiKey}                        │
 * │   Content-Type:  application/json                       │
 * │                                                         │
 * │ Body: {                                                 │
 * │   "model": "gpt-3.5-turbo",                            │
 * │   "temperature": 0.7,                                   │
 * │   "max_tokens": 800,                                    │
 * │   "messages": [                                         │
 * │     { "role": "system",    "content": "..." },          │
 * │     { "role": "user",      "content": "..." },          │ ← history
 * │     { "role": "assistant", "content": "..." },          │ ← history
 * │     { "role": "user",      "content": "new message" }  │
 * │   ]                                                     │
 * │ }                                                       │
 * └─────────────────────────────────────────────────────────┘
 *
 * SECURITY NOTE:
 *   API key is read from application.properties and NEVER logged.
 */
@Service
public class AIClientService {

    private static final Logger log = LoggerFactory.getLogger(AIClientService.class);

    @Value("${app.ai.openai.api-key}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${app.ai.openai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient   httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    // ─────────────────────────────────────────────────────────────────────
    // STARTUP VALIDATION
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Fails fast at startup if the API key is still the placeholder value.
     * This surfaces the misconfiguration immediately in the console instead of
     * causing a cryptic "temporarily unavailable" error at runtime.
     */
    @PostConstruct
    public void validateConfiguration() {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_OPENAI_API_KEY_HERE")) {
            throw new IllegalStateException(
                    "[SWMS AI] *** CONFIGURATION ERROR ***\n" +
                    "OpenAI API key is not set. Open application.properties and replace\n" +
                    "  app.ai.openai.api-key=YOUR_OPENAI_API_KEY_HERE\n" +
                    "with your real key from https://platform.openai.com/api-keys\n" +
                    "The server will not start until this is fixed.");
        }
        log.info("[SWMS AI] AIClientService ready. Model={}, URL={}", model, apiUrl);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Send a chat completion request to OpenAI.
     *
     * @param systemPrompt the full role-aware system prompt (persona + DB context)
     * @param history      previous conversation turns (chronological, may be empty)
     * @param userMessage  the user's latest message
     * @return the AI's reply text
     * @throws RuntimeException if the API call fails or returns a non-200 status
     */
    public String chat(String systemPrompt,
                       List<Map<String, String>> history,
                       String userMessage) {
        try {
            String requestBody = buildRequestBody(systemPrompt, history, userMessage);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type",  "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("OpenAI API error {}: {}", response.statusCode(), response.body());
                throw new RuntimeException(
                        "AI service returned HTTP " + response.statusCode() +
                        ". Check your API key and quota.");
            }

            return parseReply(response.body());

        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            log.error("Failed to call AI API", e);
            throw new RuntimeException("AI service is temporarily unavailable. Please try again.", e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // PRIVATE — Request / Response helpers
    // ─────────────────────────────────────────────────────────────────────

    private String buildRequestBody(String systemPrompt,
                                    List<Map<String, String>> history,
                                    String userMessage) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model",       model);
        root.put("temperature", 0.7);
        root.put("max_tokens",  800);

        ArrayNode messages = root.putArray("messages");

        // 1. System prompt
        addMessage(messages, "system", systemPrompt);

        // 2. Conversation history (chronological)
        for (Map<String, String> turn : history) {
            addMessage(messages, turn.get("role"), turn.get("content"));
        }

        // 3. Current user message
        addMessage(messages, "user", userMessage);

        return objectMapper.writeValueAsString(root);
    }

    private void addMessage(ArrayNode messages, String role, String content) {
        ObjectNode msg = objectMapper.createObjectNode();
        msg.put("role",    role);
        msg.put("content", content);
        messages.add(msg);
    }

    /**
     * Extract the assistant's reply from the OpenAI response JSON.
     *
     * Response structure:
     * {
     *   "choices": [ { "message": { "role": "assistant", "content": "..." } } ]
     * }
     */
    private String parseReply(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new RuntimeException("Unexpected AI API response: no choices returned.");
        }
        return choices.get(0).path("message").path("content").asText();
    }
}
