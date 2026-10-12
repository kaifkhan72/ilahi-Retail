package com.ilahiretail.controller.admin;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.service.StoreSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Store Settings", description = "Admin endpoints for updating global store settings")
@SecurityRequirement(name = "bearerAuth")
public class AdminStoreSettingController {

    private final StoreSettingService settingService;

    @PutMapping
    @Operation(summary = "Update store settings map")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateSettings(@RequestBody Map<String, String> settings) {
        Map<String, String> updated = settingService.updateSettings(settings);
        return ResponseEntity.ok(ApiResponse.success("Store settings updated successfully", updated));
    }
}
