package com.gimzup.dao.impl;

import com.gimzup.dao.ProductDao;
import com.gimzup.model.Category;
import com.gimzup.model.Product;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcProductDao implements ProductDao {
    private static final RowMapper<Product> MAPPER = (rs, rowNum) -> new Product(
            rs.getLong("id"),
            rs.getString("sku"),
            rs.getString("name"),
            rs.getString("brand"),
            Category.valueOf(rs.getString("category")),
            rs.getBigDecimal("package_size"),
            rs.getString("package_unit"));
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;

    public JdbcProductDao(JdbcTemplate jdbc, NamedParameterJdbcTemplate namedJdbc) {
        this.jdbc = jdbc;
        this.namedJdbc = namedJdbc;
    }

    @Override
    public List<Product> search(String query, Category category, int limit) {
        StringBuilder sql = new StringBuilder("SELECT * FROM products WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (query != null && !query.isBlank()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(sku) LIKE ?)");
            String pattern = "%" + query.strip().toLowerCase() + "%";
            args.add(pattern);
            args.add(pattern);
            args.add(pattern);
        }
        if (category != null) {
            sql.append(" AND category = ?");
            args.add(category.name());
        }
        sql.append(" ORDER BY name ASC LIMIT ?");
        args.add(Math.min(100, Math.max(1, limit)));
        return jdbc.query(sql.toString(), MAPPER, args.toArray());
    }

    @Override
    public Optional<Product> findById(long id) {
        return jdbc.query("SELECT * FROM products WHERE id = ?", MAPPER, id).stream().findFirst();
    }

    @Override
    public List<Product> findAllByIds(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        return namedJdbc.query("SELECT * FROM products WHERE id IN (:ids)",
                new MapSqlParameterSource("ids", ids), MAPPER);
    }
}
