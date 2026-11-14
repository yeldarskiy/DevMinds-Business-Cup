package com.gimzup.service;

import com.gimzup.dao.OfferDao;
import com.gimzup.model.Offer;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OfferService {
    private final OfferDao offerDao;

    public OfferService(OfferDao offerDao) {
        this.offerDao = offerDao;
    }

    public List<Offer> forProduct(long productId) {
        return offerDao.findByProductIds(List.of(productId));
    }
}
