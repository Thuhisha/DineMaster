package com.dinemaster.main.repository;

import com.dinemaster.main.model.ChefQueue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChefQueueRepository extends MongoRepository<ChefQueue, String> {
}
