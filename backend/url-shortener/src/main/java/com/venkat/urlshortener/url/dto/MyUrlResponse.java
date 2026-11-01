package com.venkat.urlshortener.url.dto;

public record MyUrlResponse(

        String shortCode,

        String longUrl,

        Long clickCount

) {
}