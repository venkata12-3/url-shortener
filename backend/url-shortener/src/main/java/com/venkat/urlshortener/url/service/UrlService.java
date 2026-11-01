package com.venkat.urlshortener.url.service;


import com.venkat.urlshortener.exception.UrlNotFoundException;
import com.venkat.urlshortener.url.dto.CreateUrlRequest;
import com.venkat.urlshortener.url.dto.CreateUrlResponse;
import com.venkat.urlshortener.url.dto.MyUrlResponse;
import com.venkat.urlshortener.url.dto.UrlStatsResponse;

import java.net.URISyntaxException;
import java.util.List;

public interface UrlService {

    CreateUrlResponse createShortUrl(CreateUrlRequest request) throws URISyntaxException;

    public String getLongUrl(String shortCode) throws UrlNotFoundException;

    UrlStatsResponse getStats(String shortCode) throws UrlNotFoundException;

    void deleteUrl(String shortCode) throws UrlNotFoundException;

    List<MyUrlResponse> getMyUrls();
}