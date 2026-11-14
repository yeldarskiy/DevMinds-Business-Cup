package com.gimzup.service;

import com.gimzup.exception.InvalidReceiptException;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptLine;
import com.gimzup.model.SaveBasketRequest;
import com.gimzup.model.SavedBasket;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ReceiptBasketService {
    private final ReceiptService receipts;
    private final BasketService baskets;

    public ReceiptBasketService(ReceiptService receipts, BasketService baskets) {
        this.receipts = receipts;
        this.baskets = baskets;
    }

    public SavedBasket fromReceipt(String receiptId) {
        Receipt receipt = receipts.get(receiptId);
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (ReceiptLine line : receipt.lines()) {
            if (line.matchedProductId() != null) {
                quantities.merge(line.matchedProductId(), 1, Integer::sum);
            }
        }
        if (quantities.isEmpty()) {
            throw new InvalidReceiptException("Match and confirm at least one receipt item before saving a basket");
        }
        List<CartItemRequest> items = quantities.entrySet().stream()
                .map(entry -> new CartItemRequest(entry.getKey(), entry.getValue()))
                .toList();
        return baskets.save(new SaveBasketRequest("From " + receipt.storeName(), items));
    }
}
