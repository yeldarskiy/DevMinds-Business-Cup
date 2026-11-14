package com.gimzup.service;

import com.gimzup.model.Product;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ReceiptMatcherService {
    public Long matchProductId(String rawDescription, List<Product> products) {
        Set<String> words = words(rawDescription);
        int bestScore = 0;
        Long bestId = null;
        boolean ambiguous = false;
        for (Product product : products) {
            Set<String> productWords = words(product.name() + " " + product.brand());
            int common = 0;
            for (String word : words) {
                if (productWords.contains(word)) {
                    common++;
                }
            }
            if (common > bestScore) {
                bestScore = common;
                bestId = product.id();
                ambiguous = false;
            } else if (common == bestScore && common > 0) {
                ambiguous = true;
            }
        }
        return bestScore >= 2 && !ambiguous ? bestId : null;
    }

    private Set<String> words(String value) {
        return Arrays.stream(value.toLowerCase().replaceAll("[^a-z0-9]+", " ").split("\\s+"))
                .filter(word -> word.length() >= 2)
                .collect(Collectors.toSet());
    }
}
