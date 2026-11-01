package com.venkat.urlshortener.url.service.impl;


import com.venkat.urlshortener.auth.entity.User;
import com.venkat.urlshortener.auth.repository.UserRepository;
import com.venkat.urlshortener.exception.AliasAlreadyExistsException;
import com.venkat.urlshortener.exception.InvalidUrlException;
import com.venkat.urlshortener.exception.UrlExpiredException;
import com.venkat.urlshortener.exception.UrlNotFoundException;
import com.venkat.urlshortener.url.dto.CreateUrlRequest;
import com.venkat.urlshortener.url.dto.CreateUrlResponse;
import com.venkat.urlshortener.url.dto.MyUrlResponse;
import com.venkat.urlshortener.url.dto.UrlStatsResponse;
import com.venkat.urlshortener.url.entity.UrlMapping;
import com.venkat.urlshortener.url.repository.UrlRepository;
import com.venkat.urlshortener.url.service.UrlService;
import com.venkat.urlshortener.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService {

    private final UrlRepository repository;
    private final ShortCodeGenerator generator;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    @Override
    public CreateUrlResponse createShortUrl(CreateUrlRequest request) throws URISyntaxException {
        validateUrl(request.longUrl());

        String username = getCurrentUsername();

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );


        Optional<UrlMapping> optionalUrlMapping = repository.findByLongUrl(request.longUrl());
        if(optionalUrlMapping.isPresent()) {
            return new CreateUrlResponse(optionalUrlMapping.get().getShortCode());
        }

//        String shortCode  = generateUniqueShortCode();

        String shortCode;

        if (request.customAlias() != null &&
                !request.customAlias().isBlank()) {
            shortCode = request.customAlias();
        } else {
            shortCode = generateUniqueShortCode();
        }
        System.out.println("shortCode:"+shortCode);


        User currentUser = getCurrentUser();

        UrlMapping url = UrlMapping.builder()
                .longUrl(request.longUrl())
                .shortCode(shortCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(request.expiresAt())
                .clickCount(0L)
                .user(currentUser)
                .build();

        if(repository.existsByShortCode(shortCode)) {
            throw new AliasAlreadyExistsException(
                    "Alias already exists"
            );
        }

        repository.save(url);

        return new CreateUrlResponse(shortCode);
    }

    @Override
    public String getLongUrl(String shortCode) throws UrlNotFoundException {

        String cacheKey = "url:" + shortCode;

        String cachedUrl =
                redisTemplate.opsForValue()
                        .get(cacheKey);

        if (cachedUrl != null) {

            System.out.println("CACHE HIT");

            return cachedUrl;
        }

        System.out.println("CACHE MISS");

        UrlMapping urlMapping = repository
                .findByShortCode(shortCode)
                .orElseThrow(() ->
                        new UrlNotFoundException("Short URL not found"));

        urlMapping.setClickCount(urlMapping.getClickCount()+1);
        repository.save(urlMapping);

        redisTemplate.opsForValue()
                .set(
                        cacheKey,
                        urlMapping.getLongUrl()
                );

        if(urlMapping.getExpiresAt() != null &&
                urlMapping.getExpiresAt().isBefore(LocalDateTime.now())) {

            throw new UrlExpiredException(
                    "URL has expired"
            );
        }
        return urlMapping.getLongUrl();
    }

    @Override
    public UrlStatsResponse getStats(String shortCode) throws UrlNotFoundException {

        UrlMapping mapping = repository
                .findByShortCode(shortCode)
                .orElseThrow(() ->
                        new UrlNotFoundException(
                                "Short URL not found"));

        return new UrlStatsResponse(
                mapping.getShortCode(),
                mapping.getClickCount()
        );
    }

    public List<MyUrlResponse> getMyUrls() {

        User user = getCurrentUser();

        return repository
                .findAllByUser(user)
                .stream()
                .map(url ->
                        new MyUrlResponse(
                                url.getShortCode(),
                                url.getLongUrl(),
                                url.getClickCount()
                        )
                )
                .toList();
    }

    private void validateOwnership(
            UrlMapping urlMapping
    ) {

        User currentUser =
                getCurrentUser();

        if (!urlMapping.getUser()
                .getId()
                .equals(currentUser.getId())) {

            throw new AccessDeniedException(
                    "You do not own this URL"
            );
        }
    }

    @Override
    public void deleteUrl(String shortCode) throws UrlNotFoundException{
        UrlMapping urlMapping = repository.findByShortCode(shortCode)
                .orElseThrow(()->new UrlNotFoundException("Short Url Not Found"));
        validateOwnership(urlMapping);
        repository.delete(urlMapping);
        redisTemplate.delete("url:"+shortCode);
    }

    private String getCurrentUsername() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    private User getCurrentUser() {

        String username = getCurrentUsername();

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    /*
     for generating unique codes, we are using randomness and db check
     --> this is good for 100 million codes after that
        it will become collison then  will use auto-increment ID + Base62 encoding
     */
    public String generateUniqueShortCode() {
        String shortCode;

        do {
            shortCode = generator.generate();
        } while(repository.existsByShortCode(shortCode));

        return shortCode;
    }


    private void validateUrl(String url) throws URISyntaxException {

        try {
            URI uri = new URI(url);

            if (uri.getScheme() == null ||
                    uri.getHost() == null) {
                throw new InvalidUrlException(
                        "Invalid URL"
                );
            }

        } catch (URISyntaxException ex) {

            throw new InvalidUrlException(
                    "Invalid URL"
            );
        }
    }
}