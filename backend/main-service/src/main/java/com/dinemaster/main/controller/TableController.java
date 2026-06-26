package com.dinemaster.main.controller;

import com.dinemaster.main.model.Table;
import com.dinemaster.main.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor

public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<List<Table>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Table> getTableById(@PathVariable String id) {
        Table table = tableService.getTableById(id);
        if (table == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(table);
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Table>> getTablesByBranchId(@PathVariable String branchId) {
        return ResponseEntity.ok(tableService.getTablesByBranchId(branchId));
    }

    @PostMapping
    public ResponseEntity<Table> createTable(@RequestBody Table table) {
        return ResponseEntity.ok(tableService.createTable(table));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Table> updateTable(@PathVariable String id, @RequestBody Table table) {
        Table updated = tableService.updateTable(id, table);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable String id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}
