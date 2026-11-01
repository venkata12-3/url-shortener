package com.venkat.urlshortener.auth.service.impl;

import com.venkat.urlshortener.auth.dto.LoginRequest;
import com.venkat.urlshortener.auth.dto.LoginResponse;
import com.venkat.urlshortener.auth.dto.RegisterRequest;
import com.venkat.urlshortener.auth.entity.User;
import com.venkat.urlshortener.auth.exception.InvalidCredentialsException;
import com.venkat.urlshortener.auth.exception.UserAlreadyExistsException;
import com.venkat.urlshortener.auth.repository.UserRepository;
import com.venkat.urlshortener.auth.security.JwtService;
import com.venkat.urlshortener.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /*
    constructor annotation is already defined
    UserServiceImpl(UserRepository userRepository,
                    PasswordEncoder passwordEncoder,
                    JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }

     */

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())
                || userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException();
        }

        User user =
                User.builder()
                        .username(request.username())
                        .email(request.email())
                        .password(
                                passwordEncoder.encode(
                                        request.password()
                                )
                        )
                        .build();

        userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByUsername(
                        request.username()
                )
                .orElseThrow(InvalidCredentialsException::new);

        boolean matches =
                passwordEncoder.matches(
                        request.password(),
                        user.getPassword()
                );

        if (!matches) {
            throw new InvalidCredentialsException();
        }

        String token =
                jwtService.generateToken(
                        user.getUsername()
                );

        return new LoginResponse(token);
    }
}
