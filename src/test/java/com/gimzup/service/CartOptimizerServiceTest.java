package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import com.gimzup.dao.OfferDao;
import com.gimzup.dao.ProductDao;
import com.gimzup.dao.StoreDao;
import com.gimzup.exception.NoValidCartException;
import com.gimzup.model.Availability;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.Category;
import com.gimzup.model.Offer;
import com.gimzup.model.OptimizeRequest;
import com.gimzup.model.Product;
import com.gimzup.model.Store;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartOptimizerServiceTest {
    @Mock ProductDao productDao;
    @Mock StoreDao storeDao;
    @Mock OfferDao offerDao;
    CartOptimizerService optimizer;

    @BeforeEach
    void init() {
        optimizer = new CartOptimizerService(productDao, storeDao, offerDao, new OfferPricingService());
    }

    private Offer offer(long id, long productId, long storeId, String price, Availability availability) {
        return new Offer(id, productId, storeId, new BigDecimal(price), null, 0, 0,
                availability, "DEMO", null, LocalDateTime.now());
    }

    private void twoStoreScenario() {
        when(productDao.findAllByIds(anyList())).thenReturn(List.of(
                new Product(1, "PB", "Peanut Butter", "Brand", Category.GROCERIES, BigDecimal.ONE, "ct"),
                new Product(2, "MILK", "Milk", "Brand", Category.GROCERIES, BigDecimal.ONE, "ct")));
        when(storeDao.findAll()).thenReturn(List.of(new Store(1,"A","IN_STORE"), new Store(2,"B","IN_STORE")));
        when(offerDao.findByProductIds(anyList())).thenReturn(List.of(
                offer(1,1,1,"4.00",Availability.IN_STOCK),
                offer(2,2,1,"6.00",Availability.IN_STOCK),
                offer(3,1,2,"3.00",Availability.IN_STOCK),
                offer(4,2,2,"7.00",Availability.IN_STOCK)));
    }

    private OptimizeRequest request(String trip, int maxStores) {
        return new OptimizeRequest(List.of(new CartItemRequest(1L,1),new CartItemRequest(2L,1)),
                new BigDecimal(trip), false, maxStores);
    }

    @Test
    void findsBestSplitBasketWhenTravelIsFree() {
        twoStoreScenario();
        var result = optimizer.optimize(request("0.00", 2));
        assertThat(result.recommended().total()).isEqualByComparingTo("9.00");
        assertThat(result.estimatedSavings()).isEqualByComparingTo("1.00");
        assertThat(result.recommended().storeNames()).containsExactly("A", "B");
    }

    @Test
    void staysAtOneStoreWhenExtraTravelCostsMore() {
        twoStoreScenario();
        var result = optimizer.optimize(request("2.00", 2));
        assertThat(result.recommended().total()).isEqualByComparingTo("10.00");
        assertThat(result.recommended().storeNames()).hasSize(1);
    }

    @Test
    void respectsMaximumNumberOfStores() {
        twoStoreScenario();
        var result = optimizer.optimize(request("0.00", 1));
        assertThat(result.recommended().total()).isEqualByComparingTo("10.00");
    }

    @Test
    void noCompleteBasketThrowsExplicitError() {
        when(productDao.findAllByIds(anyList())).thenReturn(List.of(
                new Product(1, "PB", "Peanut Butter", "Brand", Category.GROCERIES, BigDecimal.ONE, "ct"),
                new Product(2, "MILK", "Milk", "Brand", Category.GROCERIES, BigDecimal.ONE, "ct")));
        when(storeDao.findAll()).thenReturn(List.of(new Store(1,"A","IN_STORE")));
        when(offerDao.findByProductIds(anyList())).thenReturn(List.of(
                offer(1,1,1,"4.00",Availability.IN_STOCK),
                offer(2,2,1,"6.00",Availability.UNKNOWN)));
        assertThatThrownBy(() -> optimizer.optimize(request("0.00",1)))
                .isInstanceOf(NoValidCartException.class);
    }

    @Test
    void unknownProductIsRejected() {
        when(productDao.findAllByIds(anyList())).thenReturn(List.of());
        assertThatThrownBy(() -> optimizer.optimize(request("0.00",2)))
                .isInstanceOf(NoValidCartException.class);
    }

    @Test
    void rejectsInvalidStoreLimit() {
        assertThatThrownBy(() -> optimizer.optimize(request("0.00", 4)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsNegativeTripCost() {
        assertThatThrownBy(() -> optimizer.optimize(request("-1.00", 2)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
