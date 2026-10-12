package com.ilahiretail.service;

import com.ilahiretail.dto.auth.*;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request, HttpServletResponse response);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse refreshToken(String rawRefreshToken, HttpServletResponse response);
    void logout(String rawRefreshToken, HttpServletResponse response);
    void changePassword(Long userId, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserSummaryDto getUserProfile(Long userId);
    UserSummaryDto updateUserProfile(Long userId, UpdateProfileRequest request);
}
