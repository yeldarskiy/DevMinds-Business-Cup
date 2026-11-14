package com.gimzup.model;

import java.math.BigDecimal;
import java.util.List;

public record CartPlan(
        List<String> storeNames,
        List<CartAllocation> items,
        BigDecimal merchandiseTotal,
        BigDecimal tripCost,
        BigDecimal total) {
}
