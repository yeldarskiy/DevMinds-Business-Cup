package com.gimzup.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record OptimizeRequest(
        @NotEmpty List<@Valid CartItemRequest> items,
        @NotNull @DecimalMin("0.00") BigDecimal additionalStoreCost,
        boolean loyaltyMember,
        int maxStores) {
    public OptimizeRequest {
        if (additionalStoreCost == null) {
            additionalStoreCost = BigDecimal.ZERO;
        }
        if (maxStores == 0) {
            maxStores = 2;
        }
    }
}
