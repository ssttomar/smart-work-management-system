package com.swms.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SwmsBackendApplication — entry point for the Smart Workforce Management System.
 *
 * @SpringBootApplication is a meta-annotation that enables:
 *   @Configuration       → marks this as a Spring config class
 *   @EnableAutoConfiguration → wires up Spring Boot auto-config (JPA, Security, Web)
 *   @ComponentScan       → scans com.swms.backend.** for beans
 *
 * Startup order:
 *   1. Spring Boot loads application.properties
 *   2. DataSource / JPA / Hibernate initialise — DDL applied to MySQL
 *   3. SecurityFilterChain bean is created with JwtFilter registered
 *   4. Tomcat starts on port 8080
 *   5. All @RestController beans are mapped to their URL patterns
 */
@SpringBootApplication
public class SwmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SwmsBackendApplication.class, args);
    }
}
