package com.gimzup.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReceiptCreateRequest(
        @NotBlank @Size(max = 120) String storeName,
        @NotBlank @Size(max = 20000) String receiptText) {
}
