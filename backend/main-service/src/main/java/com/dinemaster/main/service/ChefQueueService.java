package com.dinemaster.main.service;

import com.dinemaster.main.model.ChefQueue;
import com.dinemaster.main.repository.ChefQueueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChefQueueService {

    private final ChefQueueRepository chefQueueRepository;

    public List<ChefQueue> getAllChefQueueItems() {
        return chefQueueRepository.findAll();
    }

    public ChefQueue getChefQueueItemById(String id) {
        return chefQueueRepository.findById(id).orElse(null);
    }

    public ChefQueue createChefQueueItem(ChefQueue chefQueue) {
        return chefQueueRepository.save(chefQueue);
    }

    public ChefQueue updateChefQueueItem(String id, ChefQueue chefQueue) {
        ChefQueue existing = getChefQueueItemById(id);
        if (existing == null) {
            return null;
        }
        if (chefQueue.getReservationId() != null) existing.setReservationId(chefQueue.getReservationId());
        if (chefQueue.getOrderId() != null) existing.setOrderId(chefQueue.getOrderId());
        if (chefQueue.getCustomerName() != null) existing.setCustomerName(chefQueue.getCustomerName());
        if (chefQueue.getTableNumber() != null) existing.setTableNumber(chefQueue.getTableNumber());
        if (chefQueue.getItems() != null) existing.setItems(chefQueue.getItems());
        if (chefQueue.getSpecialRequests() != null) existing.setSpecialRequests(chefQueue.getSpecialRequests());
        if (chefQueue.getReservationTime() != null) existing.setReservationTime(chefQueue.getReservationTime());
        if (chefQueue.getStatus() != null) existing.setStatus(chefQueue.getStatus());
        if (chefQueue.getKitchenStatus() != null) existing.setKitchenStatus(chefQueue.getKitchenStatus());
        if (chefQueue.getIsNew() != null) existing.setIsNew(chefQueue.getIsNew());
        if (chefQueue.getUpdatedAt() != null) existing.setUpdatedAt(chefQueue.getUpdatedAt());

        return chefQueueRepository.save(existing);
    }

    public void deleteChefQueueItem(String id) {
        chefQueueRepository.deleteById(id);
    }
}
