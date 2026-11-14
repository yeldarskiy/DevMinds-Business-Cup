package com.gimzup.controller;

import com.gimzup.model.OptimizeRequest;
import com.gimzup.model.OptimizeResult;
import com.gimzup.service.CartOptimizerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartOptimizerService service;

    public CartController(CartOptimizerService service) {
        this.service = service;
    }

    @PostMapping("/optimize")
    public OptimizeResult optimize(@Valid @RequestBody OptimizeRequest request) {
        return service.optimize(request);
    }
}
