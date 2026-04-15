package com.ams.service.impl;

import com.ams.config.JwtUtil;
import com.ams.dto.request.AuthRequest;
import com.ams.dto.response.AuthTokenResponse;
import com.ams.entity.User;
import com.ams.exception.BadRequestException;
import com.ams.exception.ResourceNotFoundException;
import com.ams.repository.UserRepository;
import com.ams.util.OtpStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpStore otpStore;

    // @Lazy breaks the circular dependency:
    // AuthService -> AuthenticationManager -> AuthService (as UserDetailsService)
    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       OtpStore otpStore) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpStore = otpStore;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public String register(AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("USER")
                .isVerified(true)
                .build();
        userRepository.save(user);
        return "Registration successful";
    }

    public AuthTokenResponse login(AuthRequest.Login req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtUtil.generateToken(user);
        return AuthTokenResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .userId(user.getUserId())
                .build();
    }

    public String forgotPassword(AuthRequest.ForgotPassword req) {
        if (!userRepository.existsByEmail(req.getEmail())) {
            return "If this email is registered, an OTP has been sent.";
        }
        otpStore.generateAndStore(req.getEmail(), otpExpiryMinutes);
        return "OTP sent to " + req.getEmail() + " (check server console in dev mode)";
    }

    public String verifyOtpAndReset(AuthRequest.VerifyOtp req) {
        if (!otpStore.verify(req.getEmail(), req.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        otpStore.invalidate(req.getEmail());
        return "Password reset successful";
    }
}
