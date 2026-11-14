package com.gimzup.dao;

import com.gimzup.model.Category;
import com.gimzup.model.Product;
import java.util.List;
import java.util.Optional;

public interface ProductDao {
    List<Product> search(String query, Category category, int limit);
    Optional<Product> findById(long id);
    List<Product> findAllByIds(List<Long> ids);
}
