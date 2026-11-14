package com.gimzup.service;

import com.gimzup.model.Offer;
import com.gimzup.model.PriceQuote;
import com.gimzup.util.Money;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class OfferPricingService {
    public PriceQuote quote(Offer offer, int quantity, boolean loyaltyMember) {
        if (quantity <= 0 || quantity > 100) {
            throw new IllegalArgumentException("Quantity must be between 1 and 100");
        }
        BigDecimal unitPrice = offer.regularPrice();
        String promotion = "Standard price";
        if (loyaltyMember && offer.loyaltyPrice() != null) {
            unitPrice = offer.loyaltyPrice();
            promotion = "Loyalty price";
        }
        int chargedQuantity = quantity;
        if (offer.buyQuantity() > 0 && offer.freeQuantity() > 0) {
            int group = offer.buyQuantity() + offer.freeQuantity();
            chargedQuantity -= (quantity / group) * offer.freeQuantity();
            promotion = "Buy " + offer.buyQuantity() + " get " + offer.freeQuantity() + " free";
        }
        return new PriceQuote(Money.usd(unitPrice.multiply(BigDecimal.valueOf(chargedQuantity))), promotion);
    }
}
