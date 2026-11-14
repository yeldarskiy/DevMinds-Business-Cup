package com.gimzup.dao;

import com.gimzup.model.Offer;
import java.util.List;

public interface OfferDao {
    List<Offer> findByProductIds(List<Long> productIds);
}
