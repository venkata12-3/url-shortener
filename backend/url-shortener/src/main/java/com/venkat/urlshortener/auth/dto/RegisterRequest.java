package com.venkat.urlshortener.auth.dto;

public record RegisterRequest(

        String username,

        String email,

        String password

) {
}