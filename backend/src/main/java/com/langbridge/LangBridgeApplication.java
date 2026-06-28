package com.langbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LangBridgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(LangBridgeApplication.class, args);
    }
}
