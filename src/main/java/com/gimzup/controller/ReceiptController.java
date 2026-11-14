package com.gimzup.controller;

import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptCreateRequest;
import com.gimzup.service.ReceiptService;
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
@RequestMapping("/api/receipts")
public class ReceiptController {
    private final ReceiptService service;

    public ReceiptController(ReceiptService service) {
        this.service = service;
    }

    @PostMapping("/analyze")
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt analyze(@Valid @RequestBody ReceiptCreateRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public Receipt byId(@PathVariable String id) {
        return service.get(id);
    }
}
