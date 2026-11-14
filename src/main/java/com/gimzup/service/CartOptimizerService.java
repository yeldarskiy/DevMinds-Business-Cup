package com.gimzup.service;

import com.gimzup.dao.OfferDao;
import com.gimzup.dao.ProductDao;
import com.gimzup.dao.StoreDao;
import com.gimzup.exception.NoValidCartException;
import com.gimzup.model.Availability;
import com.gimzup.model.CartAllocation;
import com.gimzup.model.CartItemRequest;
import com.gimzup.model.CartPlan;
import com.gimzup.model.Offer;
import com.gimzup.model.OptimizeRequest;
import com.gimzup.model.OptimizeResult;
import com.gimzup.model.PriceQuote;
import com.gimzup.model.Product;
import com.gimzup.model.Store;
import com.gimzup.util.Money;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CartOptimizerService {
    private final ProductDao productDao;
    private final StoreDao storeDao;
    private final OfferDao offerDao;
    private final OfferPricingService pricing;

    public CartOptimizerService(ProductDao productDao, StoreDao storeDao, OfferDao offerDao,
                                OfferPricingService pricing) {
        this.productDao = productDao;
        this.storeDao = storeDao;
        this.offerDao = offerDao;
        this.pricing = pricing;
    }

    public OptimizeResult optimize(OptimizeRequest request) {
        if (request.items() == null || request.items().isEmpty() || request.items().size() > 40) {
            throw new IllegalArgumentException("The cart must contain between 1 and 40 items");
        }
        if (request.maxStores() < 1 || request.maxStores() > 3) {
            throw new IllegalArgumentException("maxStores must be between 1 and 3");
        }
        if (request.additionalStoreCost() == null || request.additionalStoreCost().signum() < 0) {
            throw new IllegalArgumentException("Additional store cost must be non-negative");
        }
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (CartItemRequest item : request.items()) {
            if (item == null || item.productId() == null || item.productId() <= 0 || item.quantity() < 1 || item.quantity() > 100) {
                throw new IllegalArgumentException("Invalid cart item");
            }
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
            if (quantities.get(item.productId()) > 100) {
                throw new IllegalArgumentException("Total quantity cannot exceed 100");
            }
        }
        List<Long> ids = new ArrayList<>(quantities.keySet());
        Map<Long, Product> products = new HashMap<>();
        for (Product product : productDao.findAllByIds(ids)) {
            products.put(product.id(), product);
        }
        if (products.size() != ids.size()) {
            throw new NoValidCartException("Some products are not in the catalog");
        }
        List<Store> stores = storeDao.findAll();
        if (stores.size() > 12) {
            throw new IllegalArgumentException("Store comparison limit exceeded");
        }
        Map<Long, List<Offer>> offers = new HashMap<>();
        for (Offer offer : offerDao.findByProductIds(ids)) {
            offers.computeIfAbsent(offer.productId(), ignored -> new ArrayList<>()).add(offer);
        }
        List<CartPlan> plans = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        int combinations = 1 << stores.size();
        for (int mask = 1; mask < combinations; mask++) {
            if (Integer.bitCount(mask) > request.maxStores()) {
                continue;
            }
            Set<Long> candidateStoreIds = new LinkedHashSet<>();
            for (int i = 0; i < stores.size(); i++) {
                if ((mask & (1 << i)) != 0) {
                    candidateStoreIds.add(stores.get(i).id());
                }
            }
            CartPlan plan = calculatePlan(candidateStoreIds, quantities, products, stores,
                    offers, request.loyaltyMember(), request.additionalStoreCost());
            if (plan != null) {
                String signature = plan.items().stream().map(a -> a.productId() + ":" + a.storeId())
                        .reduce("", (a, b) -> a + "|" + b);
                if (seen.add(signature)) {
                    plans.add(plan);
                }
            }
        }
        if (plans.isEmpty()) {
            throw new NoValidCartException("No complete in-stock basket found for the selected stores");
        }
        plans.sort(Comparator.comparing(CartPlan::total)
                .thenComparingInt(plan -> plan.storeNames().size()));
        CartPlan recommended = plans.get(0);
        BigDecimal cheapestSingleStore = plans.stream()
                .filter(plan -> plan.storeNames().size() == 1)
                .map(CartPlan::total)
                .min(BigDecimal::compareTo)
                .orElse(recommended.total());
        BigDecimal savings = cheapestSingleStore.subtract(recommended.total()).max(BigDecimal.ZERO);
        return new OptimizeResult(recommended, plans.stream().limit(4).toList(),
                Money.usd(cheapestSingleStore), Money.usd(savings),
                "Prices are sample offers unless the sourceType explicitly indicates a verified retailer feed. "
                        + "Inventory and real-time availability are not guaranteed.");
    }

    private CartPlan calculatePlan(Set<Long> storeIds, Map<Long, Integer> quantities,
                                   Map<Long, Product> products, List<Store> stores,
                                   Map<Long, List<Offer>> offers, boolean loyaltyMember,
                                   BigDecimal extraStoreCost) {
        Map<Long, String> storeNames = new HashMap<>();
        for (Store store : stores) {
            storeNames.put(store.id(), store.name());
        }
        List<CartAllocation> allocations = new ArrayList<>();
        Set<Long> visitedStores = new LinkedHashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            long productId = entry.getKey();
            int quantity = entry.getValue();
            Offer bestOffer = null;
            PriceQuote bestQuote = null;
            for (Offer offer : offers.getOrDefault(productId, List.of())) {
                if (!storeIds.contains(offer.storeId()) || offer.availability() != Availability.IN_STOCK) {
                    continue;
                }
                PriceQuote quote = pricing.quote(offer, quantity, loyaltyMember);
                if (bestQuote == null || quote.total().compareTo(bestQuote.total()) < 0) {
                    bestOffer = offer;
                    bestQuote = quote;
                }
            }
            if (bestOffer == null) {
                return null;
            }
            visitedStores.add(bestOffer.storeId());
            subtotal = subtotal.add(bestQuote.total());
            allocations.add(new CartAllocation(productId, products.get(productId).name(),
                    bestOffer.storeId(), storeNames.get(bestOffer.storeId()), quantity,
                    bestQuote.total(), bestQuote.promotion(), bestOffer.sourceType()));
        }
        BigDecimal trip = extraStoreCost.multiply(BigDecimal.valueOf(Math.max(0, visitedStores.size() - 1)));
        List<String> usedNames = visitedStores.stream().map(storeNames::get).sorted().toList();
        return new CartPlan(usedNames, allocations, Money.usd(subtotal), Money.usd(trip),
                Money.usd(subtotal.add(trip)));
    }
}
