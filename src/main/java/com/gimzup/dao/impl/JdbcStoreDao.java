package com.gimzup.dao.impl;

import com.gimzup.dao.StoreDao;
import com.gimzup.model.Store;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcStoreDao implements StoreDao {
    private final JdbcTemplate jdbc;

    public JdbcStoreDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<Store> findAll() {
        return jdbc.query("SELECT id, name, channel FROM stores ORDER BY id",
                (rs, rowNum) -> new Store(rs.getLong("id"), rs.getString("name"), rs.getString("channel")));
    }
}
