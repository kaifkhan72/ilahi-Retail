package com.ilahiretail.controller.admin;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.admin.AdminDashboardDto;
import com.ilahiretail.dto.admin.CustomerSummaryDto;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Dashboard", description = "Admin analytics and customer listing endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminDashboardController {

    private final OrderService orderService;

    @GetMapping("/stats")
    @Operation(summary = "Get high level dashboard analytics (total orders, total revenue, products, customers)")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboardStats() {
        AdminDashboardDto stats = orderService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }

    @GetMapping("/customers")
    @Operation(summary = "Get registered customers list with order counts")
    public ResponseEntity<ApiResponse<PageResponse<CustomerSummaryDto>>> getCustomers(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<CustomerSummaryDto> customers = orderService.getAllCustomers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }
}
