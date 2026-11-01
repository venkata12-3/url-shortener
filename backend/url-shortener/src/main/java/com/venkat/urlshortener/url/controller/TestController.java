package com.venkat.urlshortener.url.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/test")
public class TestController {

    private final RedisTemplate<String,String> redisTemplate;

//    @GetMapping
//    public String test() {
//
//        redisTemplate.opsForValue()
//                .set("hello", "redis");
//
//        return redisTemplate.opsForValue()
//                .get("hello");
//    }

    @GetMapping()
    public String whoAmI() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}