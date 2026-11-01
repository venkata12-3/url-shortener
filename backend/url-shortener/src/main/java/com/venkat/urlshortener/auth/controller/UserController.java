package com.venkat.urlshortener.auth.controller;


import com.venkat.urlshortener.auth.dto.LoginRequest;
import com.venkat.urlshortener.auth.dto.LoginResponse;
import com.venkat.urlshortener.auth.dto.RegisterRequest;
import com.venkat.urlshortener.auth.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {


    private final UserService authService;

    public UserController(UserService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request
    ) {

        authService.register(request);

        return ResponseEntity.ok(
                "User Registered Successfully"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);
        return new ResponseEntity<>(loginResponse,HttpStatus.ACCEPTED);
    }


}
