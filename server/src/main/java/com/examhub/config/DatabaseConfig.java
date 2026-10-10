package com.examhub.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String username;

    @Value("${spring.datasource.password:postgres}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        String jdbcUrl = rawUrl;
        String dbUser = username;
        String dbPass = password;

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || (rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("jdbc:")))) {
            try {
                // Replace scheme with http temporarily for URI parsing to handle user:pass@host:port/path
                String uriString = rawUrl.startsWith("postgres://")
                        ? "http://" + rawUrl.substring("postgres://".length())
                        : "http://" + rawUrl.substring("postgresql://".length());

                URI uri = URI.create(uriString);

                if (uri.getUserInfo() != null && !uri.getUserInfo().isEmpty()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    if (userInfo.length > 0 && !userInfo[0].isEmpty()) {
                        dbUser = userInfo[0];
                    }
                    if (userInfo.length > 1) {
                        dbPass = userInfo[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }
                String query = (uri.getQuery() != null && !uri.getQuery().isEmpty()) ? "?" + uri.getQuery() : "";

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + path + query;
                log.info("Successfully converted cloud PostgreSQL URL to JDBC: jdbc:postgresql://{}:{}/{}", host, port, path);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI, attempting fallback prefix replacement: {}", e.getMessage());
                if (rawUrl.startsWith("postgres://")) {
                    jdbcUrl = "jdbc:postgresql://" + rawUrl.substring("postgres://".length());
                } else {
                    jdbcUrl = "jdbc:" + rawUrl;
                }
            }
        }

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(dbUser);
        config.setPassword(dbPass);

        // Production connection pool tuning for free-tier resource constraints (512MB RAM)
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setPoolName("ExamHubHikariPool");

        return new HikariDataSource(config);
    }
}
