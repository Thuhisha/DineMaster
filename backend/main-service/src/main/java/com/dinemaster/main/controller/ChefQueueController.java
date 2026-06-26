package com.dinemaster.main.controller;

import com.dinemaster.main.model.ChefQueue;
import com.dinemaster.main.service.ChefQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chef-queue")
@RequiredArgsConstructor

public class ChefQueueController {

    private final ChefQueueService chefQueueService;

    @GetMapping
    public ResponseEntity<List<ChefQueue>> getAllChefQueueItems() {
        return ResponseEntity.ok(chefQueueService.getAllChefQueueItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChefQueue> getChefQueueItemById(@PathVariable String id) {
        ChefQueue chefQueue = chefQueueService.getChefQueueItemById(id);
        if (chefQueue == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chefQueue);
    }

    @PostMapping
    public ResponseEntity<ChefQueue> createChefQueueItem(@RequestBody ChefQueue chefQueue) {
        return ResponseEntity.ok(chefQueueService.createChefQueueItem(chefQueue));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChefQueue> updateChefQueueItem(@PathVariable String id, @RequestBody ChefQueue chefQueue) {
        ChefQueue updated = chefQueueService.updateChefQueueItem(id, chefQueue);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChefQueueItem(@PathVariable String id) {
        chefQueueService.deleteChefQueueItem(id);
        return ResponseEntity.noContent().build();
    }
}
