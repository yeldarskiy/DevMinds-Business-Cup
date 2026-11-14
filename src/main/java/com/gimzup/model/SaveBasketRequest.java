package com.gimzup.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SaveBasketRequest(
        @NotBlank @Size(max = 100) String name,
        @NotEmpty List<@Valid CartItemRequest> items) {
}
