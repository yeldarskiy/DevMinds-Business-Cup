package com.gimzup.service;

import com.gimzup.dao.ProductDao;
import com.gimzup.exception.ResourceNotFoundException;
import com.gimzup.model.Category;
import com.gimzup.model.Product;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductDao productDao;

    public ProductService(ProductDao productDao) {
        this.productDao = productDao;
    }

    public List<Product> search(String query, Category category, int limit) {
        return productDao.search(query, category, limit);
    }

    public Product findById(long id) {
        return productDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
