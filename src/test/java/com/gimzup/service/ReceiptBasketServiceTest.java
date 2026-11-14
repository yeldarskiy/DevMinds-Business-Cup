package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import com.gimzup.exception.InvalidReceiptException;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptLine;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReceiptBasketServiceTest {
    @Mock ReceiptService receipts;
    @Mock BasketService baskets;

    @Test
    void turnsMatchedReceiptItemsIntoBasket() {
        when(receipts.get("receipt-1")).thenReturn(new Receipt("receipt-1", "Walmart",
                List.of(new ReceiptLine("PB", new BigDecimal("3.99"), 1L),
                        new ReceiptLine("PB", new BigDecimal("3.99"), 1L),
                        new ReceiptLine("Unknown",new BigDecimal("1.00"),null)),
                new BigDecimal("8.98")));
        new ReceiptBasketService(receipts,baskets).fromReceipt("receipt-1");
        var captor = ArgumentCaptor.forClass(com.gimzup.model.SaveBasketRequest.class);
        verify(baskets).save(captor.capture());
        assertThat(captor.getValue().items()).containsExactly(new CartItemRequest(1L,2));
    }

    @Test
    void rejectsReceiptWithoutRecognizedItems() {
        when(receipts.get("receipt-2")).thenReturn(new Receipt("receipt-2", "Walmart",
                List.of(new ReceiptLine("Unknown",new BigDecimal("1.00"),null)),
                new BigDecimal("1.00")));
        assertThatThrownBy(() -> new ReceiptBasketService(receipts,baskets).fromReceipt("receipt-2"))
                .isInstanceOf(InvalidReceiptException.class);
    }
}
