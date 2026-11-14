package com.gimzup.dao.impl;

import com.gimzup.dao.OfferDao;
import com.gimzup.model.Availability;
import com.gimzup.model.Offer;
import java.util.List;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOfferDao implements OfferDao {
    private static final RowMapper<Offer> MAPPER = (rs, rowNum) -> new Offer(
            rs.getLong("id"),
            rs.getLong("product_id"),
            rs.getLong("store_id"),
            rs.getBigDecimal("regular_price"),
            rs.getBigDecimal("loyalty_price"),
            rs.getInt("buy_quantity"),
            rs.getInt("free_quantity"),
            Availability.valueOf(rs.getString("availability")),
            rs.getString("source_type"),
            rs.getString("source_url"),
            rs.getTimestamp("checked_at").toLocalDateTime());
    private final NamedParameterJdbcTemplate jdbc;

    public JdbcOfferDao(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<Offer> findByProductIds(List<Long> productIds) {
        if (productIds.isEmpty()) {
            return List.of();
        }
        return jdbc.query("SELECT * FROM offers WHERE product_id IN (:ids) ORDER BY regular_price ASC",
                new MapSqlParameterSource("ids", productIds), MAPPER);
    }
}
