package com.gimzup.controller;

import com.gimzup.model.SaveBasketRequest;
import com.gimzup.model.SavedBasket;
import com.gimzup.service.BasketService;
import com.gimzup.service.ReceiptBasketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/baskets")
public class BasketController {
    private final BasketService service;
    private final ReceiptBasketService receiptBaskets;

    public BasketController(BasketService service, ReceiptBasketService receiptBaskets) {
        this.service = service;
        this.receiptBaskets = receiptBaskets;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavedBasket save(@Valid @RequestBody SaveBasketRequest request) {
        return service.save(request);
    }

    @PostMapping("/from-receipt/{receiptId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SavedBasket fromReceipt(@PathVariable String receiptId) {
        return receiptBaskets.fromReceipt(receiptId);
    }

    @GetMapping("/{id}")
    public SavedBasket get(@PathVariable String id) {
        return service.get(id);
    }
}
