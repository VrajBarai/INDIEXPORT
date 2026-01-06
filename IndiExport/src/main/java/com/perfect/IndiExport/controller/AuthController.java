package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.LoginRequest;
import com.perfect.IndiExport.dto.LoginResponse;
import com.perfect.IndiExport.dto.RegisterRequest;
import com.perfect.IndiExport.entity.Role;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail()).get();

            String token = jwtUtil.generateToken(
                    user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(
                    new LoginResponse(token, user.getRole().name())
            );

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    // ---------------- REGISTER / SIGN-UP ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // 1️⃣ Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already registered");
        }

        // 2️⃣ Allow only BUYER or SELLER_BASIC
        if (request.getRole() == Role.ADMIN) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin registration not allowed");
        }

        // 3️⃣ Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(request.getRole());
        user.setStatus("ACTIVE");

        userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("User registered successfully");
    }

    // ---------------- LOGOUT ---------------- 
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT tokens are stateless, so we just return success
        // Client will remove the token from storage
        return ResponseEntity.ok("Logged out successfully");
    }
}

