package com.gimzup.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gimzup.dao.ProductDao;
import com.gimzup.dao.ReceiptDao;
import com.gimzup.model.Category;
import com.gimzup.model.Product;
import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptCreateRequest;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReceiptServiceTest {
    @Mock ReceiptDao receiptDao;
    @Mock ProductDao productDao;

    @Test
    void parsesMatchesAndStoresReceipt() {
        when(productDao.search(null,null,100)).thenReturn(List.of(
                new Product(1,"PB","Creamy Peanut Butter 16 oz","Skippy",Category.GROCERIES,
                        BigDecimal.valueOf(16),"oz")));
        var service = new ReceiptService(receiptDao,productDao,new ReceiptParserService(),
                new ReceiptMatcherService());
        Receipt result = service.create(new ReceiptCreateRequest("Walmart",
                "Peanut Butter 16 oz 3.99\nTOTAL 3.99"));
        assertThat(result.parsedTotal()).isEqualByComparingTo("3.99");
        assertThat(result.lines()).hasSize(1);
        assertThat(result.lines().get(0).matchedProductId()).isEqualTo(1L);
        var captor = ArgumentCaptor.forClass(Receipt.class);
        verify(receiptDao).save(captor.capture());
        assertThat(captor.getValue().id()).isEqualTo(result.id());
    }
}
