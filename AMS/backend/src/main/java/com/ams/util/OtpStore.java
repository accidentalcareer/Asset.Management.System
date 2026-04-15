package com.ams.util;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store (mock — no real email).
 * OTP is printed to the console for development/testing.
 */
@Component
public class OtpStore {

    private record OtpEntry(String otp, LocalDateTime expiry) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public String generateAndStore(String email, int expiryMinutes) {
        String otp = String.format("%06d", (int)(Math.random() * 1_000_000));
        store.put(email.toLowerCase(), new OtpEntry(otp, LocalDateTime.now().plusMinutes(expiryMinutes)));
        System.out.println("========================================");
        System.out.println("  MOCK OTP for " + email + " → " + otp);
        System.out.println("  Expires in " + expiryMinutes + " minutes");
        System.out.println("========================================");
        return otp;
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            store.remove(email.toLowerCase());
            return false;
        }
        return entry.otp().equals(otp);
    }

    public void invalidate(String email) {
        store.remove(email.toLowerCase());
    }
}
