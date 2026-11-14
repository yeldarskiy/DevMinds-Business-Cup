package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gimzup.model.Availability;
import com.gimzup.model.Offer;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class OfferPricingServiceTest {
    private final OfferPricingService pricing = new OfferPricingService();

    private Offer offer(String regular, String loyalty, int buy, int free) {
        return new Offer(1, 1, 1, new BigDecimal(regular),
                loyalty == null ? null : new BigDecimal(loyalty), buy, free,
                Availability.IN_STOCK, "DEMO", null, LocalDateTime.now());
    }

    @Test
    void standardPriceMultipliesQuantity() {
        assertThat(pricing.quote(offer("3.99", null, 0, 0), 2, false).total())
                .isEqualByComparingTo("7.98");
    }

    @Test
    void loyaltyPriceIsUsedWhenEnabled() {
        assertThat(pricing.quote(offer("4.00", "3.20", 0, 0), 3, true).total())
                .isEqualByComparingTo("9.60");
    }

    @Test
    void loyaltyIsIgnoredWhenDisabled() {
        assertThat(pricing.quote(offer("4.00", "3.20", 0, 0), 3, false).total())
                .isEqualByComparingTo("12.00");
    }

    @Test
    void buyTwoGetOneFreeChargesForTwoOfThree() {
        assertThat(pricing.quote(offer("4.00", null, 2, 1), 3, false).total())
                .isEqualByComparingTo("8.00");
    }

    @Test
    void promotionOnlyAppliesToCompletedGroups() {
        assertThat(pricing.quote(offer("4.00", null, 2, 1), 5, false).total())
                .isEqualByComparingTo("16.00");
    }

    @Test
    void zeroQuantityIsRejected() {
        assertThatThrownBy(() -> pricing.quote(offer("4.00", null, 0, 0), 0, false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void quantityAboveMaximumIsRejected() {
        assertThatThrownBy(() -> pricing.quote(offer("4.00", null, 0, 0), 101, false))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
