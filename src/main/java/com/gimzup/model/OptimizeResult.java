package com.gimzup.model;

import java.math.BigDecimal;
import java.util.List;

public record OptimizeResult(
        CartPlan recommended,
        List<CartPlan> alternatives,
        BigDecimal cheapestSingleStore,
        BigDecimal estimatedSavings,
        String note) {
}
