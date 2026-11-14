package com.gimzup.controller;

import com.gimzup.model.Category;
import com.gimzup.model.Product;
import com.gimzup.service.ProductService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Category category,
                                @RequestParam(defaultValue = "50") int limit) {
        return service.search(q, category, limit);
    }

    @GetMapping("/{id}")
    public Product byId(@PathVariable long id) {
        return service.findById(id);
    }
}
