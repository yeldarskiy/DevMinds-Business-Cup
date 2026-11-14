package com.gimzup.service;

import com.gimzup.exception.InvalidReceiptException;
import com.gimzup.model.ReceiptLine;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class ReceiptParserService {
    private static final Pattern LINE = Pattern.compile("^(.{2,90}?)\\s+\\$?(\\d{1,5}[.,]\\d{2})$");

    public List<ReceiptLine> parse(String text) {
        if (text == null || text.isBlank()) {
            throw new InvalidReceiptException("Receipt text is empty");
        }
        List<ReceiptLine> lines = new ArrayList<>();
        for (String raw : text.split("\\R")) {
            String line = raw.trim();
            Matcher matcher = LINE.matcher(line);
            if (!matcher.matches()) {
                continue;
            }
            String description = matcher.group(1).trim();
            String upper = description.toUpperCase();
            if (upper.startsWith("TOTAL") || upper.startsWith("SUBTOTAL") || upper.startsWith("TAX")
                    || upper.startsWith("CHANGE") || upper.startsWith("BALANCE") || upper.startsWith("CASH")) {
                continue;
            }
            BigDecimal price = new BigDecimal(matcher.group(2).replace(',', '.'));
            if (price.signum() > 0) {
                lines.add(new ReceiptLine(description, price, null));
            }
        }
        if (lines.isEmpty()) {
            throw new InvalidReceiptException("No receipt items could be recognized");
        }
        return lines;
    }
}
