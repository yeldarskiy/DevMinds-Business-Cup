package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gimzup.dao.BasketDao;
import com.gimzup.dao.ProductDao;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.Category;
import com.gimzup.model.Product;
import com.gimzup.model.SaveBasketRequest;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BasketServiceTest {
    @Mock BasketDao basketDao;
    @Mock ProductDao productDao;

    @Test
    void savesValidatedBasketWithRandomId() {
        when(productDao.findAllByIds(anyList())).thenReturn(List.of(
                new Product(1,"PB","Peanut Butter","Skippy",Category.GROCERIES,
                        BigDecimal.valueOf(16),"oz")));
        var created = new BasketService(basketDao,productDao)
                .save(new SaveBasketRequest("Weekly",List.of(new CartItemRequest(1L,2))));
        assertThat(created.id()).hasSize(36);
        assertThat(created.name()).isEqualTo("Weekly");
        var captor = ArgumentCaptor.forClass(com.gimzup.model.SavedBasket.class);
        verify(basketDao).save(captor.capture());
        assertThat(captor.getValue().id()).isEqualTo(created.id());
    }

    @Test
    void rejectsDuplicateProducts() {
        assertThatThrownBy(() -> new BasketService(basketDao,productDao)
                .save(new SaveBasketRequest("Weekly",List.of(new CartItemRequest(1L,1),
                        new CartItemRequest(1L,2)))))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
