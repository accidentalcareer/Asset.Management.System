package com.ams.controller;

import com.ams.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

public abstract class BaseController {
    protected User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
