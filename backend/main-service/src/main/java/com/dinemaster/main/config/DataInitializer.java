package com.dinemaster.main.config;

import com.dinemaster.main.model.Location;
import com.dinemaster.main.model.MenuItem;
import com.dinemaster.main.model.Table;
import com.dinemaster.main.repository.LocationRepository;
import com.dinemaster.main.repository.MenuItemRepository;
import com.dinemaster.main.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final TableRepository tableRepository;
    private final MenuItemRepository menuRepository;

    @Override
    public void run(String... args) {
        if (locationRepository.count() == 0) {
            System.out.println("Seeding default locations, tables, and menu...");

            Location loc1 = locationRepository.save(new Location(null, "Chennai - T Nagar", "Chennai", "123 South Mada St", "044-12345678", "tnagar@dinemaster.com", ""));
            Location loc2 = locationRepository.save(new Location(null, "Chennai - Anna Nagar", "Chennai", "45 2nd Avenue", "044-87654321", "annanagar@dinemaster.com", ""));

            tableRepository.save(new Table(null, 1, 2, "available", loc1.getId()));
            tableRepository.save(new Table(null, 2, 4, "available", loc1.getId()));
            tableRepository.save(new Table(null, 3, 6, "available", loc1.getId()));
            
            tableRepository.save(new Table(null, 4, 2, "available", loc2.getId()));
            tableRepository.save(new Table(null, 5, 4, "available", loc2.getId()));

            menuRepository.save(new MenuItem(null, "kunafa", "Authentic sweet cheese pastry", 100.0, "Desserts", 4.8, "https://images.unsplash.com/photo-1627918451829-373204ea2613", true, 50));
            menuRepository.save(new MenuItem(null, "idly", "Soft steamed rice cakes", 80.0, "Starters", 4.5, "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1", true, 100));
            menuRepository.save(new MenuItem(null, "Chicken Briyani", "Aromatic basmati rice cooked with spices and chicken", 150.0, "Main Course", 4.9, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", true, 40));

            System.out.println("Seeding complete.");
        }
    }
}
