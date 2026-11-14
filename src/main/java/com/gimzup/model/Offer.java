package com.gimzup.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Offer(
        long id,
        long productId,
        long storeId,
        BigDecimal regularPrice,
        BigDecimal loyaltyPrice,
        int buyQuantity,
        int freeQuantity,
        Availability availability,
        String sourceType,
        String sourceUrl,
        LocalDateTime checkedAt) {
}
