package com.gimzup.model;

import java.util.List;

public record SavedBasket(String id, String name, List<CartItemRequest> items) {
}
