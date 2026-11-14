package com.gimzup.dao;

import com.gimzup.model.Receipt;
import java.util.Optional;

public interface ReceiptDao {
    void save(Receipt receipt);
    Optional<Receipt> findById(String id);
}
