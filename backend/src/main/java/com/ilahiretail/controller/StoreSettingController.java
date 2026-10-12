package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.service.StoreSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Store Settings", description = "Public store configurations and brand identity")
public class StoreSettingController {

    private final StoreSettingService settingService;

    @GetMapping
    @Operation(summary = "Get all store settings (public)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        Map<String, String> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success("Store settings retrieved", settings));
    }
}
