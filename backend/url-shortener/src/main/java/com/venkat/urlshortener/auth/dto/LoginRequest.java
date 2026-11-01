package com.venkat.urlshortener.auth.dto;

public record LoginRequest(

        String username,

        String password

) {
}
