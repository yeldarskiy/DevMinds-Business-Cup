package com.gimzup.service;

import com.gimzup.dao.BasketDao;
import com.gimzup.dao.ProductDao;
import com.gimzup.exception.ResourceNotFoundException;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.SaveBasketRequest;
import com.gimzup.model.SavedBasket;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class BasketService {
    private final BasketDao basketDao;
    private final ProductDao productDao;

    public BasketService(BasketDao basketDao, ProductDao productDao) {
        this.basketDao = basketDao;
        this.productDao = productDao;
    }

    public SavedBasket save(SaveBasketRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Basket cannot be empty");
        }
        List<Long> ids = request.items().stream().map(CartItemRequest::productId).toList();
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Basket contains duplicate products");
        }
        if (productDao.findAllByIds(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Basket includes unknown products");
        }
        SavedBasket basket = new SavedBasket(UUID.randomUUID().toString(),
                request.name().trim(), List.copyOf(request.items()));
        basketDao.save(basket);
        return basket;
    }

    public SavedBasket get(String id) {
        return basketDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved basket not found"));
    }
}
