package com.venkat.urlshortener.url.dto;

public record UrlStatsResponse(
        String shortCode,
        Long clickCount
) {
}