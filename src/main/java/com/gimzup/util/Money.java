package com.gimzup.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Money {
    private Money() {
    }

    public static BigDecimal usd(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
