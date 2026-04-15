package com.ams.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthTokenResponse {
    private String token;
    private String name;
    private String email;
    private Long userId;
}
