package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.gimzup.dao.ProductDao;
import com.gimzup.exception.ResourceNotFoundException;
import com.gimzup.model.Category;
import com.gimzup.model.Product;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock ProductDao dao;

    @Test
    void searchesWithCategory() {
        var product = new Product(1,"PB","Peanut Butter","Skippy",Category.GROCERIES,
                BigDecimal.valueOf(16),"oz");
        when(dao.search("peanut",Category.GROCERIES,20)).thenReturn(List.of(product));
        assertThat(new ProductService(dao).search("peanut",Category.GROCERIES,20)).containsExactly(product);
    }

    @Test
    void missingProductThrowsNotFound() {
        when(dao.findById(77)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> new ProductService(dao).findById(77))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
