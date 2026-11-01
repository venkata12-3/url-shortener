package com.venkat.urlshortener.url.repository;


import com.venkat.urlshortener.auth.entity.User;
import com.venkat.urlshortener.url.entity.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    Optional<UrlMapping> findByLongUrl(String longUrl);

    List<UrlMapping> findAllByUser(User user);

}