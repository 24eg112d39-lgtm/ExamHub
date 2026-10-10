package com.examhub.service.impl;

import com.examhub.dto.AuthResponse;
import com.examhub.dto.LoginRequest;
import com.examhub.dto.RegisterRequest;
import com.examhub.dto.UserDto;
import com.examhub.entity.Role;
import com.examhub.entity.User;
import com.examhub.exception.BadRequestException;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.StudentRepository;
import com.examhub.repository.UserRepository;
import com.examhub.security.JwtTokenProvider;
import com.examhub.security.UserPrincipal;
import com.examhub.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim().toLowerCase(),
                        loginRequest.getPassword()
                )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userPrincipal);

        Long studentId = null;
        if (userPrincipal.getRole() == Role.STUDENT) {
            studentId = studentRepository.findByUserId(userPrincipal.getId())
                    .map(s -> s.getId())
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(userPrincipal.getId())
                .name(userPrincipal.getName())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole())
                .studentId(studentId)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("User with email '" + email + "' already exists");
        }

        User user = User.builder()
                .name(registerRequest.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(registerRequest.getRole() != null ? registerRequest.getRole() : Role.STUDENT)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(userPrincipal);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user found");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Long studentId = null;
        if (user.getRole() == Role.STUDENT) {
            studentId = studentRepository.findByUserId(user.getId())
                    .map(s -> s.getId())
                    .orElse(null);
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .studentId(studentId)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
