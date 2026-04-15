package com.ams.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Size(min = 8) @NotBlank private String password;
    }

    @Data
    public static class Login {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class ForgotPassword {
        @Email @NotBlank private String email;
    }

    @Data
    public static class VerifyOtp {
        @Email @NotBlank private String email;
        @NotBlank private String otp;
        @Size(min = 8) @NotBlank private String newPassword;
    }
}
