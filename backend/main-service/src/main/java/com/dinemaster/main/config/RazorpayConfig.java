package com.dinemaster.main.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.Data;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "razorpay.key")
@Data
public class RazorpayConfig {

    private String id;
    private String secret;
    private String currency = "INR";

    @Bean
    @ConditionalOnExpression("'${razorpay.key.id:}' != '' and '${razorpay.key.secret:}' != ''")
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(id, secret);
    }
}
