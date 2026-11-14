package com.gimzup.model;

import java.math.BigDecimal;
import java.util.List;

public record Receipt(
        String id,
        String storeName,
        List<ReceiptLine> lines,
        BigDecimal parsedTotal) {
}
