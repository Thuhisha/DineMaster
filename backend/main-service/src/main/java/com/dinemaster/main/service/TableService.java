package com.dinemaster.main.service;

import com.dinemaster.main.model.Table;
import com.dinemaster.main.repository.TableRepository;
import com.dinemaster.main.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    public Table getTableById(String id) {
        return tableRepository.findById(id).orElse(null);
    }

    public List<Table> getTablesByBranchId(String branchId) {
        return tableRepository.findAll().stream()
                .filter(table -> table.getBranchId().equals(branchId))
                .toList();
    }

    public Table createTable(Table table) {
        return tableRepository.save(table);
    }

    public Table updateTable(String id, Table table) {
        table.setId(id);
        return tableRepository.save(table);
    }

    public void deleteTable(String id) {
        long resCount = reservationRepository.findAll().stream()
                .filter(r -> id.equals(r.getTableId()) && !"cancelled".equals(r.getStatus()))
                .count();
        if (resCount > 0) {
            throw new RuntimeException("Cannot delete table because it has active reservations.");
        }

        tableRepository.deleteById(id);
    }
}
