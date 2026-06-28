package com.langbridge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "gemini.api.key=test-key",
    "tts.service.url=http://localhost:3001",
    "jwt.secret=testSecretKeyForJWTThatIsLongEnoughToWork",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class LangBridgeApplicationTests {

    @Test
    void contextLoads() {
        // Context load test
    }
}
