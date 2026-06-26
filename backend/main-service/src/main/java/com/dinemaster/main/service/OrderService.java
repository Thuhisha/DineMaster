package com.dinemaster.main.service;

import com.dinemaster.main.model.Order;
import com.dinemaster.main.repository.OrderRepository;
import com.dinemaster.main.dto.OrderCalculationRequest;
import com.dinemaster.main.dto.OrderCalculationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Autowired
    private SnsService snsService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getUserId().equals(userId))
                .toList();
    }

    public Order createOrder(Order order) {
        Order savedOrder = orderRepository.save(order);
        snsService.sendOrderNotification(
            savedOrder.getId(),
            savedOrder.getUserId() != null ? savedOrder.getUserId() : "Unknown User",
            savedOrder.getTotal() != null ? savedOrder.getTotal() : 0.0
        );
        return savedOrder;
    }

    public Order updateOrder(String id, Order order) {
        order.setId(id);
        return orderRepository.save(order);
    }

    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }

    public OrderCalculationResponse calculateOrder(OrderCalculationRequest req) {
        Double subtotal = 0.0;
        if (req.getItems() != null) {
            for (Order.OrderItem item : req.getItems()) {
                subtotal += item.getPrice() * item.getQty();
            }
        }

        Double tax = subtotal * 0.05; // 5% tax
        Double discount = 0.0;
        Map<String, Object> birthdayOffer = new HashMap<>();
        birthdayOffer.put("applied", false);

        try {
            if (req.getEmail() != null && !req.getEmail().isEmpty()) {
                String url = "http://localhost:8081/api/auth/user/" + req.getEmail();
                Map<String, Object> userProfile = restTemplate.getForObject(url, Map.class);
                if (userProfile != null && userProfile.get("birthday") != null && req.getDate() != null && !req.getDate().isEmpty()) {
                    String dobStr = (String) userProfile.get("birthday");
                    LocalDate dob = LocalDate.parse(dobStr);
                    // Split date in case of ISO string
                    LocalDate resDate = LocalDate.parse(req.getDate().split("T")[0]);

                    if (dob.getMonthValue() == resDate.getMonthValue() && dob.getDayOfMonth() == resDate.getDayOfMonth()) {
                        discount = subtotal * 0.50; // 50% discount
                        birthdayOffer.put("applied", true);
                        birthdayOffer.put("benefit", "50% Birthday Discount");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch user for birthday validation: " + e.getMessage());
        }

        Double total = subtotal + tax - discount;
        return new OrderCalculationResponse(subtotal, tax, discount, total, birthdayOffer);
    }
}
