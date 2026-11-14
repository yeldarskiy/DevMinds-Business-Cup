package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gimzup.exception.InvalidReceiptException;
import org.junit.jupiter.api.Test;

class ReceiptParserServiceTest {
    private final ReceiptParserService parser = new ReceiptParserService();

    @Test
    void parsesReceiptLinesWithPrices() {
        var result = parser.parse("Peanut Butter 16 oz 3.99\nWhole Milk 1 gal $3.69\nTOTAL 7.68");
        assertThat(result).hasSize(2);
        assertThat(result.get(0).description()).isEqualTo("Peanut Butter 16 oz");
        assertThat(result.get(1).price()).isEqualByComparingTo("3.69");
    }

    @Test
    void excludesTaxesAndSubtotals() {
        var result = parser.parse("Large Eggs 12 ct 4.25\nSUBTOTAL 4.25\nTAX 0.30\nTOTAL 4.55");
        assertThat(result).hasSize(1);
    }

    @Test
    void acceptsCommaDecimalSeparator() {
        var result = parser.parse("Paper Towels 6 rolls 14,49");
        assertThat(result.get(0).price()).isEqualByComparingTo("14.49");
    }

    @Test
    void rejectsUnrecognizedInput() {
        assertThatThrownBy(() -> parser.parse("store title without totals"))
                .isInstanceOf(InvalidReceiptException.class);
    }

    @Test
    void rejectsBlankInput() {
        assertThatThrownBy(() -> parser.parse(" "))
                .isInstanceOf(InvalidReceiptException.class);
    }
}
