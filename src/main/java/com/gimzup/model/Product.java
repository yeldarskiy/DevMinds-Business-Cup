package com.gimzup.model;

import java.math.BigDecimal;

public record Product(
        long id,
        String sku,
        String name,
        String brand,
        Category category,
        BigDecimal packageSize,
        String packageUnit) {
}
