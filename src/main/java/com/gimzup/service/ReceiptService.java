package com.gimzup.service;

import com.gimzup.dao.ProductDao;
import com.gimzup.dao.ReceiptDao;
import com.gimzup.exception.ResourceNotFoundException;
import com.gimzup.model.Product;
import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptCreateRequest;
import com.gimzup.model.ReceiptLine;
import com.gimzup.util.Money;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ReceiptService {
    private final ReceiptDao receiptDao;
    private final ProductDao productDao;
    private final ReceiptParserService parser;
    private final ReceiptMatcherService matcher;

    public ReceiptService(ReceiptDao receiptDao, ProductDao productDao,
                          ReceiptParserService parser, ReceiptMatcherService matcher) {
        this.receiptDao = receiptDao;
        this.productDao = productDao;
        this.parser = parser;
        this.matcher = matcher;
    }

    public Receipt create(ReceiptCreateRequest request) {
        List<Product> catalog = productDao.search(null, null, 100);
        List<ReceiptLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ReceiptLine item : parser.parse(request.receiptText())) {
            Long productId = matcher.matchProductId(item.description(), catalog);
            lines.add(new ReceiptLine(item.description(), item.price(), productId));
            total = total.add(item.price());
        }
        Receipt receipt = new Receipt(UUID.randomUUID().toString(), request.storeName(), lines, Money.usd(total));
        receiptDao.save(receipt);
        return receipt;
    }

    public Receipt get(String id) {
        return receiptDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));
    }
}
