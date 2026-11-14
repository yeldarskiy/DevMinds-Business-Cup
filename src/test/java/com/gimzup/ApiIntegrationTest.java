package com.gimzup;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void healthEndpointIsPublic() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Request-Id"))
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void searchesSeededProductsAndCategories() throws Exception {
        mvc.perform(get("/api/products").param("q","peanut"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$",hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1));
        mvc.perform(get("/api/products").param("category","BABY_KIDS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$",hasSize(greaterThan(0))));
        mvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("PB16"));
        mvc.perform(get("/api/products/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void returnsRetailersAndClearlyLabeledDemoOffers() throws Exception {
        mvc.perform(get("/api/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$",hasSize(5)));
        mvc.perform(get("/api/offers").param("productId","1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sourceType").value("DEMO"));
    }

    @Test
    void optimizesOnRealInputAndRejectsBadRequests() throws Exception {
        var valid = """
                {"items":[{"productId":1,"quantity":3},{"productId":2,"quantity":1}],
                 "additionalStoreCost":2.50,"loyaltyMember":true,"maxStores":2}
                """;
        mvc.perform(post("/api/cart/optimize").contentType(MediaType.APPLICATION_JSON).content(valid))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommended.total").exists())
                .andExpect(jsonPath("$.recommended.items",hasSize(2)))
                .andExpect(jsonPath("$.note").exists());
        mvc.perform(post("/api/cart/optimize").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"items":[],"additionalStoreCost":0,"maxStores":2}
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void savesAndRetrievesGuestBasket() throws Exception {
        String payload = """
                {"name":"My weekly list","items":[{"productId":1,"quantity":2}]}
                """;
        var response = mvc.perform(post("/api/baskets")
                        .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(response);
        mvc.perform(get("/api/baskets/" + node.get("id").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My weekly list"))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void analyzesAndPersistsTextReceipt() throws Exception {
        String payload = """
                {"storeName":"Walmart","receiptText":"Peanut Butter 16 oz 3.99\\nWhole Milk 1 gal 3.69\\nTOTAL 7.68"}
                """;
        var response = mvc.perform(post("/api/receipts/analyze")
                        .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lines",hasSize(2)))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(response);
        mvc.perform(get("/api/receipts/" + node.get("id").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parsedTotal").value(7.68));
        mvc.perform(post("/api/baskets/from-receipt/" + node.get("id").asText()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items",hasSize(2)));
    }
}
