package com.venkat.urlshortener.url.controller;


import com.venkat.urlshortener.exception.UrlNotFoundException;
import com.venkat.urlshortener.url.dto.*;
import com.venkat.urlshortener.url.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;


    @GetMapping("/health-check")
    public ResponseEntity<String> checkHealth() {
        return new ResponseEntity<>("Status: Up", HttpStatus.OK);
    }

    @PostMapping
    public CreateUrlResponse createShortUrl(
            @RequestBody @Valid CreateUrlRequest request
    ) throws URISyntaxException {
        return urlService.createShortUrl(request);
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> getLongUrl(@PathVariable  String shortCode) throws UrlNotFoundException {
        String longUrl = urlService.getLongUrl(shortCode);

        return ResponseEntity.status(HttpStatus.FOUND).
                location(URI.create(longUrl)).build();
    }

    @GetMapping("/{shortCode}/stat")
    public ResponseEntity<UrlStatsResponse> getStat(@PathVariable String shortCode) throws UrlNotFoundException {
        UrlStatsResponse urlStatsResponse = urlService.getStats(shortCode);
        return ResponseEntity.ok(urlStatsResponse);
    }

    @DeleteMapping("/{shortCode}")
    public ResponseEntity<String> deleteShortCode(@PathVariable String shortCode) throws UrlNotFoundException{
        urlService.deleteUrl(shortCode);

        return new ResponseEntity<>("Deleted successfull!",HttpStatus.OK);
    }

    @GetMapping("/me")
    public List<MyUrlResponse> getMyUrls() {

        return urlService.getMyUrls();
    }
}