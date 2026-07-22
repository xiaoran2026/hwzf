package com.storeai.doctor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeai.doctor.config.DeepSeekConfig;
import com.storeai.doctor.dto.AnalysisResultDTO;
import com.storeai.doctor.dto.ReportDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiReportServiceTest {

    private DeepSeekService deepSeekService;
    private AnalysisPromptTemplate promptTemplate;
    private ObjectMapper objectMapper;

    private static final String MOCK_AI_RESPONSE = """
            {
              "healthScore": 72,
              "summary": "The store shows moderate performance with stable revenue but room for growth in customer retention.",
              "salesInsights": [
                "Total revenue of $48,910 indicates a healthy mid-range store.",
                "Monthly revenue shows slight downward trend in Q4.",
                "Average order value of $48.91 suggests room for upselling."
              ],
              "productInsights": [
                "Smart Watch is the top revenue product at $29,998.",
                "Wireless Earbuds rank second with strong demand.",
                "USB Cable has high volume but low revenue - consider bundling."
              ],
              "customerInsights": [
                "Total of 472 unique customers acquired.",
                "Repeat rate of 28.4% is below industry average of 30-40%.",
                "New customer acquisition is strong but retention needs improvement."
              ],
              "problems": [
                "Customer repeat rate is below e-commerce industry benchmarks.",
                "Revenue concentration in top 2 products creates dependency risk.",
                "No significant presence in Asian markets despite high potential."
              ],
              "recommendations": [
                "Implement a loyalty program to boost repeat purchases.",
                "Create product bundles to increase AOV.",
                "Expand marketing to underperforming countries.",
                "Introduce email remarketing for one-time buyers."
              ]
            }
            """;

    private static final String MOCK_AI_RESPONSE_WITH_MARKDOWN = """
            ```json
            {
              "healthScore": 65,
              "summary": "Store performance is average with growth potential.",
              "salesInsights": ["Revenue is growing steadily.", "AOV needs improvement."],
              "productInsights": ["Top product drives most revenue."],
              "customerInsights": ["Repeat rate is concerning."],
              "problems": ["Low diversity in product sales."],
              "recommendations": ["Diversify product range."]
            }
            ```
            """;

    @BeforeEach
    void setUp() {
        DeepSeekConfig config = new DeepSeekConfig();
        config.setApiKey("test-key");
        config.setBaseUrl("https://api.deepseek.com");
        config.setModel("deepseek-chat");
        config.setMaxTokens(8000);

        objectMapper = new ObjectMapper();
        deepSeekService = new DeepSeekService(config, objectMapper);
        promptTemplate = new AnalysisPromptTemplate(objectMapper);
    }

    @Test
    void testPromptTemplateBuildsSystemPrompt() {
        String systemPrompt = promptTemplate.buildSystemPrompt();
        assertNotNull(systemPrompt);
        assertTrue(systemPrompt.contains("senior e-commerce data analyst"));
        assertTrue(systemPrompt.contains("healthScore"));
        assertTrue(systemPrompt.contains("salesInsights"));
        assertTrue(systemPrompt.contains("Do NOT recalculate"));
    }

    @Test
    void testPromptTemplateBuildsUserPrompt() {
        AnalysisResultDTO data = AnalysisResultDTO.builder()
                .salesAnalysis(AnalysisResultDTO.SalesAnalysis.builder()
                        .totalRevenue(new java.math.BigDecimal("1000.00"))
                        .totalOrders(50)
                        .averageOrderValue(new java.math.BigDecimal("20.00"))
                        .build())
                .build();

        String userPrompt = promptTemplate.buildUserPrompt(data);
        assertNotNull(userPrompt);
        assertTrue(userPrompt.contains("1000.00"));
        assertTrue(userPrompt.contains("totalOrders"));
    }

    @Test
    void testParseCleanJsonResponse() throws Exception {
        ReportDTO report = objectMapper.readValue(MOCK_AI_RESPONSE.trim(), ReportDTO.class);

        assertNotNull(report);
        assertEquals(72, report.getHealthScore());
        assertNotNull(report.getSummary());
        assertEquals(3, report.getSalesInsights().size());
        assertEquals(3, report.getProductInsights().size());
        assertEquals(3, report.getCustomerInsights().size());
        assertEquals(3, report.getProblems().size());
        assertEquals(4, report.getRecommendations().size());

        assertTrue(report.getSummary().contains("moderate performance"));
    }

    @Test
    void testParseMarkdownWrappedJsonResponse() throws Exception {
        // Simulate the cleanJsonResponse logic
        String cleaned = MOCK_AI_RESPONSE_WITH_MARKDOWN.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        ReportDTO report = objectMapper.readValue(cleaned, ReportDTO.class);

        assertNotNull(report);
        assertEquals(65, report.getHealthScore());
        assertEquals("Store performance is average with growth potential.", report.getSummary());
        assertEquals(2, report.getSalesInsights().size());
    }

    @Test
    void testReportDtoJsonRoundTrip() throws Exception {
        ReportDTO original = ReportDTO.builder()
                .healthScore(85)
                .summary("Excellent store performance.")
                .salesInsights(List.of("Strong revenue growth.", "High AOV."))
                .productInsights(List.of("Diverse product mix."))
                .customerInsights(List.of("High repeat rate.", "Loyal customer base."))
                .problems(List.of("Seasonal dip in Q1."))
                .recommendations(List.of("Expand to new markets."))
                .build();

        String json = objectMapper.writeValueAsString(original);
        ReportDTO deserialized = objectMapper.readValue(json, ReportDTO.class);

        assertEquals(85, deserialized.getHealthScore());
        assertEquals("Excellent store performance.", deserialized.getSummary());
        assertEquals(2, deserialized.getSalesInsights().size());
        assertEquals(1, deserialized.getProblems().size());
        assertEquals(1, deserialized.getRecommendations().size());
        assertEquals("Strong revenue growth.", deserialized.getSalesInsights().get(0));
    }

    @Test
    void testHealthScoreRange() throws Exception {
        // Verify healthScore is within valid range
        ReportDTO report = objectMapper.readValue(MOCK_AI_RESPONSE.trim(), ReportDTO.class);
        assertTrue(report.getHealthScore() >= 0 && report.getHealthScore() <= 100,
                "healthScore must be between 0 and 100, got: " + report.getHealthScore());
    }

    @Test
    void testAllInsightFieldsAreNonEmpty() throws Exception {
        ReportDTO report = objectMapper.readValue(MOCK_AI_RESPONSE.trim(), ReportDTO.class);

        assertNotNull(report.getSummary());
        assertFalse(report.getSummary().isEmpty());

        assertFalse(report.getSalesInsights().isEmpty());
        assertFalse(report.getProductInsights().isEmpty());
        assertFalse(report.getCustomerInsights().isEmpty());
        assertFalse(report.getProblems().isEmpty());
        assertFalse(report.getRecommendations().isEmpty());

        report.getSalesInsights().forEach(s -> assertFalse(s.isEmpty()));
        report.getProductInsights().forEach(s -> assertFalse(s.isEmpty()));
        report.getCustomerInsights().forEach(s -> assertFalse(s.isEmpty()));
        report.getProblems().forEach(s -> assertFalse(s.isEmpty()));
        report.getRecommendations().forEach(s -> assertFalse(s.isEmpty()));
    }
}
