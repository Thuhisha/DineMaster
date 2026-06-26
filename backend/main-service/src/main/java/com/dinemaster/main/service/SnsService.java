package com.dinemaster.main.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

@Service
public class SnsService {

    private final SnsClient snsClient;

    @Value("${aws.sns.topic-arn}")
    private String topicArn;

    public SnsService(SnsClient snsClient) {
        this.snsClient = snsClient;
    }

    public void sendOrderNotification(String orderId, String customerName, double totalAmount) {
        String message = "New Order Received!\n" +
            "Order ID: " + orderId + "\n" +
            "Customer: " + customerName + "\n" +
            "Total Amount: ₹" + totalAmount;

        snsClient.publish(PublishRequest.builder()
            .topicArn(topicArn)
            .subject("New DineMaster Order")
            .message(message)
            .build());
    }
}
