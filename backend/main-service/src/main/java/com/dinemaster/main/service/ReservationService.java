package com.dinemaster.main.service;

import com.dinemaster.main.model.Reservation;
import com.dinemaster.main.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation getReservationById(String id) {
        return reservationRepository.findById(id).orElse(null);
    }

    public List<Reservation> getReservationsByUserId(String userId) {
        return reservationRepository.findAll().stream()
                .filter(reservation -> reservation.getUserId().equals(userId))
                .toList();
    }

    public Reservation createReservation(Reservation reservation) {

        // Validate birthday offer
        if (reservation.getBirthdayOffer() != null && Boolean.TRUE.equals(reservation.getBirthdayOffer().get("applied"))) {
            try {
                String url = "http://localhost:8081/api/auth/user/" + reservation.getEmail();
                Map userProfile = restTemplate.getForObject(url, Map.class);
                if (userProfile != null && userProfile.get("birthday") != null && reservation.getDate() != null && !reservation.getDate().isEmpty()) {
                    String dobStr = (String) userProfile.get("birthday");
                    LocalDate dob = LocalDate.parse(dobStr);
                    LocalDate resDate = LocalDate.parse(reservation.getDate().split("T")[0]);
                    if (dob.getMonthValue() != resDate.getMonthValue() || dob.getDayOfMonth() != resDate.getDayOfMonth()) {
                        System.out.println("Warning: Birthday Offer Date mismatch, but allowing reservation to proceed.");
                    }
                }
            } catch (Exception e) {
                System.out.println("Warning: Failed to fetch user profile for birthday validation, ignoring. " + e.getMessage());
                // Do NOT throw an error, just allow the reservation to succeed.
            }
        }

        return reservationRepository.save(reservation);
    }

    public Reservation updateReservation(String id, Reservation reservation) {
        reservation.setId(id);
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(String id) {
        reservationRepository.deleteById(id);
    }
}
