package com.gimzup.controller;

import com.gimzup.model.Offer;
import com.gimzup.service.OfferService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
public class OfferController {
    private final OfferService service;

    public OfferController(OfferService service) {
        this.service = service;
    }

    @GetMapping
    public List<Offer> byProduct(@RequestParam long productId) {
        return service.forProduct(productId);
    }
}
