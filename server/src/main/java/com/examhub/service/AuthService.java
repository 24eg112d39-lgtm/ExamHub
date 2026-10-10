package com.examhub.service;

import com.examhub.dto.AuthResponse;
import com.examhub.dto.LoginRequest;
import com.examhub.dto.RegisterRequest;
import com.examhub.dto.UserDto;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse register(RegisterRequest registerRequest);
    UserDto getCurrentUser();
}
