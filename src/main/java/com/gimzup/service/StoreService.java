package com.gimzup.service;

import com.gimzup.dao.StoreDao;
import com.gimzup.model.Store;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StoreService {
    private final StoreDao storeDao;

    public StoreService(StoreDao storeDao) {
        this.storeDao = storeDao;
    }

    public List<Store> findAll() {
        return storeDao.findAll();
    }
}
