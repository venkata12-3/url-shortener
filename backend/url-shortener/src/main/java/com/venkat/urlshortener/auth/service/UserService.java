package com.venkat.urlshortener.auth.service;

import com.venkat.urlshortener.auth.dto.LoginRequest;
import com.venkat.urlshortener.auth.dto.LoginResponse;
import com.venkat.urlshortener.auth.dto.RegisterRequest;

public interface UserService {

    void register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}

