package com.gimzup.dao.impl;

import com.gimzup.dao.ReceiptDao;
import com.gimzup.model.Receipt;
import com.gimzup.model.ReceiptLine;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcReceiptDao implements ReceiptDao {
    private final JdbcTemplate jdbc;

    public JdbcReceiptDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void save(Receipt receipt) {
        jdbc.update("INSERT INTO receipts (id, store_name, parsed_total) VALUES (?, ?, ?)",
                receipt.id(), receipt.storeName(), receipt.parsedTotal());
        for (ReceiptLine line : receipt.lines()) {
            jdbc.update("INSERT INTO receipt_lines (receipt_id, description, price, matched_product_id) VALUES (?, ?, ?, ?)",
                    receipt.id(), line.description(), line.price(), line.matchedProductId());
        }
    }

    @Override
    public Optional<Receipt> findById(String id) {
        record Header(String receiptId, String storeName, BigDecimal total) {
        }
        List<Header> headers = jdbc.query("SELECT id, store_name, parsed_total FROM receipts WHERE id = ?",
                (rs, rowNum) -> new Header(rs.getString("id"), rs.getString("store_name"),
                        rs.getBigDecimal("parsed_total")), id);
        if (headers.isEmpty()) {
            return Optional.empty();
        }
        List<ReceiptLine> lines = jdbc.query(
                "SELECT description, price, matched_product_id FROM receipt_lines WHERE receipt_id = ? ORDER BY id",
                (rs, rowNum) -> {
                    Number rawId = (Number) rs.getObject("matched_product_id");
                    Long matchedId = rawId == null ? null : rawId.longValue();
                    return new ReceiptLine(rs.getString("description"), rs.getBigDecimal("price"), matchedId);
                }, id);
        Header header = headers.get(0);
        return Optional.of(new Receipt(header.receiptId(), header.storeName(), lines, header.total()));
    }
}
