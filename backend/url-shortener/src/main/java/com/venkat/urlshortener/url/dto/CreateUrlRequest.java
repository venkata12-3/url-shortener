package com.venkat.urlshortener.url.dto;


import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record CreateUrlRequest(

        @NotBlank(message = "URL cannot be empty")
        String longUrl,

        String customAlias,

        LocalDateTime expiresAt

) {
}