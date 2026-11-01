package com.venkat.urlshortener.auth.exception;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException() {
        super("Username or email already exists");
    }
}
