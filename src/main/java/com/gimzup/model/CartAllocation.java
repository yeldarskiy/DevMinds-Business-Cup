package com.gimzup.model;

import java.math.BigDecimal;

public record CartAllocation(
        long productId,
        String productName,
        long storeId,
        String storeName,
        int quantity,
        BigDecimal lineTotal,
        String promotion,
        String sourceType) {
}
