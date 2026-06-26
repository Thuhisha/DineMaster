package com.dinemaster.main.service;

import com.dinemaster.main.model.Offer;
import com.dinemaster.main.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;

    public List<Offer> getAllOffers() {
        return offerRepository.findAll();
    }

    public List<Offer> getActiveOffers() {
        return offerRepository.findAll().stream()
                .filter(offer -> offer.getActive() != null && offer.getActive())
                .toList();
    }

    public Offer getOfferById(String id) {
        return offerRepository.findById(id).orElse(null);
    }

    public Offer createOffer(Offer offer) {
        return offerRepository.save(offer);
    }

    public Offer updateOffer(String id, Offer offer) {
        offer.setId(id);
        return offerRepository.save(offer);
    }

    public void deleteOffer(String id) {
        offerRepository.deleteById(id);
    }
}
