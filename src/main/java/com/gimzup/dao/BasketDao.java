package com.gimzup.dao;

import com.gimzup.model.SavedBasket;
import java.util.Optional;

public interface BasketDao {
    void save(SavedBasket basket);
    Optional<SavedBasket> findById(String id);
}
