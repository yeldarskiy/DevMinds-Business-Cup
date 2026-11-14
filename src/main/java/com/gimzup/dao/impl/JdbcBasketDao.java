package com.gimzup.dao.impl;

import com.gimzup.dao.BasketDao;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.SavedBasket;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcBasketDao implements BasketDao {
    private final JdbcTemplate jdbc;

    public JdbcBasketDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void save(SavedBasket basket) {
        jdbc.update("INSERT INTO saved_baskets (id, name) VALUES (?, ?)", basket.id(), basket.name());
        for (CartItemRequest item : basket.items()) {
            jdbc.update("INSERT INTO saved_basket_items (basket_id, product_id, quantity) VALUES (?, ?, ?)",
                    basket.id(), item.productId(), item.quantity());
        }
    }

    @Override
    public Optional<SavedBasket> findById(String id) {
        return jdbc.query("SELECT id, name FROM saved_baskets WHERE id = ?", (rs, rowNum) -> {
            List<CartItemRequest> items = jdbc.query(
                    "SELECT product_id, quantity FROM saved_basket_items WHERE basket_id = ? ORDER BY id",
                    (row, i) -> new CartItemRequest(row.getLong("product_id"), row.getInt("quantity")), id);
            return new SavedBasket(rs.getString("id"), rs.getString("name"), items);
        }, id).stream().findFirst();
    }
}
