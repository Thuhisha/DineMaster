package com.dinemaster.main.service;

import com.dinemaster.main.model.Location;
import com.dinemaster.main.repository.LocationRepository;
import com.dinemaster.main.repository.TableRepository;
import com.dinemaster.main.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(String id) {
        return locationRepository.findById(id).orElse(null);
    }

    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    public Location updateLocation(String id, Location location) {
        location.setId(id);
        return locationRepository.save(location);
    }

    public void deleteLocation(String id) {
        long tableCount = tableRepository.findAll().stream()
                .filter(t -> id.equals(t.getBranchId()))
                .count();
        if (tableCount > 0) {
            throw new RuntimeException("Cannot delete location because it has active tables.");
        }

        long resCount = reservationRepository.findAll().stream()
                .filter(r -> id.equals(r.getBranchId()) && !"cancelled".equals(r.getStatus()))
                .count();
        if (resCount > 0) {
            throw new RuntimeException("Cannot delete location because it has active reservations.");
        }

        locationRepository.deleteById(id);
    }
}
