package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.OrphanageRepository;
import com.example.jalai_backend.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/orphanages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrphanageController {

    @Autowired
    private OrphanageRepository orphanageRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrphanagesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean active) {
        try {
            System.out.println("=== GET ALL ORPHANAGES REQUEST ===");
            System.out.println("Page: " + page + ", Size: " + size);
            System.out.println("Sort by: " + sortBy + ", Direction: " + sortDir);
            System.out.println("Filters - Location: " + location + ", Name: " + name + ", Active: " + active);

            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);

            List<Orphanage> orphanages;

            // Apply filters
            if (location != null && !location.trim().isEmpty()) {
                orphanages = orphanageRepository.findByLocationContainingIgnoreCase(location.trim());
                System.out.println("Filtered by location: " + orphanages.size() + " results");
            } else if (name != null && !name.trim().isEmpty()) {
                orphanages = orphanageRepository.findByNameContainingIgnoreCase(name.trim());
                System.out.println("Filtered by name: " + orphanages.size() + " results");
            } else if (active != null) {
                orphanages = active ? orphanageRepository.findByIsActiveTrue()
                        : orphanageRepository.findByIsActiveFalse();
                System.out.println("Filtered by active status: " + orphanages.size() + " results");
            } else {
                // Get all orphanages with pagination
                Page<Orphanage> orphanagePage = orphanageRepository.findAll(pageable);
                System.out.println("Total orphanages found: " + orphanagePage.getTotalElements());
                return ResponseEntity.ok(orphanagePage);
            }

            System.out.println("Returning " + orphanages.size() + " orphanages");
            return ResponseEntity.ok(orphanages);

        } catch (Exception e) {
            System.err.println("Error fetching orphanages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching orphanages: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrphanageById(@PathVariable UUID id) {
        try {
            System.out.println("=== GET ORPHANAGE BY ID: " + id + " ===");

            Optional<Orphanage> orphanage = orphanageRepository.findById(id);
            if (orphanage.isPresent()) {
                System.out.println("Orphanage found: " + orphanage.get().getName());
                return ResponseEntity.ok(orphanage.get());
            } else {
                System.out.println("Orphanage not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching orphanage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching orphanage: " + e.getMessage()));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicOrphanages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name) {
        try {
            System.out.println("=== GET PUBLIC ORPHANAGES REQUEST ===");
            System.out.println("Page: " + page + ", Size: " + size);
            System.out.println("Filters - Location: " + location + ", Name: " + name);

            List<Orphanage> orphanages;

            // Apply filters and only return active orphanages
            if (location != null && !location.trim().isEmpty()) {
                orphanages = orphanageRepository.findByLocationContainingIgnoreCaseAndIsActiveTrue(location.trim());
                System.out.println("Filtered by location (active only): " + orphanages.size() + " results");
            } else if (name != null && !name.trim().isEmpty()) {
                orphanages = orphanageRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name.trim());
                System.out.println("Filtered by name (active only): " + orphanages.size() + " results");
            } else {
                // Get all active orphanages
                orphanages = orphanageRepository.findByIsActiveTrue();
                System.out.println("All active orphanages: " + orphanages.size() + " results");

                // Debug: Also check total orphanages in database
                long totalOrphanages = orphanageRepository.count();
                System.out.println("Total orphanages in database: " + totalOrphanages);

                if (totalOrphanages > 0 && orphanages.isEmpty()) {
                    System.out.println("WARNING: There are orphanages in database but none are active!");
                    // Let's see what orphanages exist
                    List<Orphanage> allOrphanages = orphanageRepository.findAll();
                    for (Orphanage o : allOrphanages) {
                        System.out.println(
                                "Orphanage: " + o.getName() + ", Active: " + o.getIsActive() + ", ID: " + o.getId());
                    }
                }
            }

            System.out.println("Returning " + orphanages.size() + " public orphanages");
            return ResponseEntity.ok(orphanages);

        } catch (Exception e) {
            System.err.println("Error fetching public orphanages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching orphanages: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActiveOrphanages() {
        try {
            System.out.println("=== GET ACTIVE ORPHANAGES ===");

            List<Orphanage> activeOrphanages = orphanageRepository.findByIsActiveTrue();
            System.out.println("Active orphanages found: " + activeOrphanages.size());

            return ResponseEntity.ok(activeOrphanages);
        } catch (Exception e) {
            System.err.println("Error fetching active orphanages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching active orphanages: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchOrphanages(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location) {
        try {
            System.out.println("=== SEARCH ORPHANAGES ===");
            System.out.println("Query: " + query + ", Location: " + location);

            List<Orphanage> results;

            if (query != null && !query.trim().isEmpty()) {
                results = orphanageRepository.findByNameContainingIgnoreCase(query.trim());
            } else if (location != null && !location.trim().isEmpty()) {
                results = orphanageRepository.findByLocationContainingIgnoreCase(location.trim());
            } else {
                results = orphanageRepository.findByIsActiveTrue();
            }

            System.out.println("Search results: " + results.size());
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            System.err.println("Error searching orphanages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error searching orphanages: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveOrphanage(@PathVariable UUID id) {
        try {
            System.out.println("=== APPROVE ORPHANAGE: " + id + " ===");

            Optional<Orphanage> orphanageOpt = orphanageRepository.findById(id);
            if (orphanageOpt.isPresent()) {
                Orphanage orphanage = orphanageOpt.get();
                orphanage.setIsActive(true);
                orphanageRepository.save(orphanage);

                System.out.println("Orphanage approved: " + orphanage.getName());
                return ResponseEntity.ok(new MessageResponse("Orphanage approved successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error approving orphanage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error approving orphanage: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectOrphanage(@PathVariable UUID id) {
        try {
            System.out.println("=== REJECT ORPHANAGE: " + id + " ===");

            Optional<Orphanage> orphanageOpt = orphanageRepository.findById(id);
            if (orphanageOpt.isPresent()) {
                Orphanage orphanage = orphanageOpt.get();
                orphanage.setIsActive(false);
                orphanageRepository.save(orphanage);

                System.out.println("Orphanage rejected: " + orphanage.getName());
                return ResponseEntity.ok(new MessageResponse("Orphanage rejected successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error rejecting orphanage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error rejecting orphanage: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllOrphanagesDebug() {
        try {
            System.out.println("=== DEBUG: GET ALL ORPHANAGES (REGARDLESS OF STATUS) ===");

            List<Orphanage> allOrphanages = orphanageRepository.findAll();
            System.out.println("Total orphanages in database: " + allOrphanages.size());

            for (Orphanage o : allOrphanages) {
                System.out.println("ID: " + o.getId() + ", Name: " + o.getName() +
                        ", Active: " + o.getIsActive() + ", Email: " + o.getEmail());
            }

            return ResponseEntity.ok(allOrphanages);

        } catch (Exception e) {
            System.err.println("Error in debug endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createOrphanage(@RequestBody Orphanage orphanage) {
        try {
            System.out.println("=== CREATE ORPHANAGE ===");
            System.out.println("Orphanage name: " + orphanage.getName());
            System.out.println("Orphanage email: " + orphanage.getEmail());
            System.out.println("Orphanage location: " + orphanage.getLocation());

            // Set default values for new orphanages
            orphanage.setIsActive(false); // New orphanages start as inactive (pending approval)

            // Save the orphanage
            Orphanage savedOrphanage = orphanageRepository.save(orphanage);

            System.out.println("Orphanage created with ID: " + savedOrphanage.getId());
            return ResponseEntity.ok(savedOrphanage);

        } catch (Exception e) {
            System.err.println("Error creating orphanage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating orphanage: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrphanageStats() {
        try {
            System.out.println("=== GET ORPHANAGE STATS ===");

            long totalOrphanages = orphanageRepository.count();
            long activeOrphanages = orphanageRepository.countActiveOrphanages();
            long inactiveOrphanages = totalOrphanages - activeOrphanages;

            var stats = new java.util.HashMap<String, Object>();
            stats.put("totalOrphanages", totalOrphanages);
            stats.put("activeOrphanages", activeOrphanages);
            stats.put("inactiveOrphanages", inactiveOrphanages);

            System.out.println("Orphanage stats: " + stats);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("Error fetching orphanage stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching orphanage stats: " + e.getMessage()));
        }
    }
}
