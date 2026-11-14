package com.gimzup.model;

import java.math.BigDecimal;

public record ReceiptLine(String description, BigDecimal price, Long matchedProductId) {
}
