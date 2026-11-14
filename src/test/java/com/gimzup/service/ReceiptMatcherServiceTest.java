package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.gimzup.model.Category;
import com.gimzup.model.Product;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReceiptMatcherServiceTest {
    private final ReceiptMatcherService matcher = new ReceiptMatcherService();
    private final List<Product> catalog = List.of(
            new Product(1, "PB16", "Creamy Peanut Butter 16 oz", "Skippy", Category.GROCERIES,
                    BigDecimal.valueOf(16), "oz"),
            new Product(2, "MILK", "Whole Milk 1 gal", "Great Value", Category.GROCERIES,
                    BigDecimal.ONE, "gal"));

    @Test
    void matchesDistinctiveTokens() {
        assertThat(matcher.matchProductId("Peanut Butter 16 oz", catalog)).isEqualTo(1L);
    }

    @Test
    void rejectsUnknownProducts() {
        assertThat(matcher.matchProductId("TV REMOTE", catalog)).isNull();
    }

    @Test
    void ignoresSingleWeakToken() {
        assertThat(matcher.matchProductId("Milk", catalog)).isNull();
    }
}
