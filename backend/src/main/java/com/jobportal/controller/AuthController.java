package com.jobportal.controller;

import com.jobportal.dto.JwtResponse;
import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.MessageResponse;
import com.jobportal.dto.SignupRequest;
import com.jobportal.model.ERole;
import com.jobportal.model.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.jwt.JwtUtils;
import com.jobportal.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping({"/login", "/signin"})
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    System.out.println("[AUTH] login request received");
    System.out.println("[AUTH] username field (email or username): " + loginRequest.getUsername());

    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getUsername(),
          userDetails.getEmail(),
          roles));
    } catch (BadCredentialsException e) {
      System.out.println("[AUTH] bad credentials for: " + loginRequest.getUsername());
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Error: Invalid email or password"));
    }
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    System.out.println("[AUTH] signup request username=" + signUpRequest.getUsername()
        + " email=" + signUpRequest.getEmail());

    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    User user = new User(signUpRequest.getUsername(), 
               signUpRequest.getEmail(),
               encoder.encode(signUpRequest.getPassword()));

    Set<String> strRoles = signUpRequest.getRoles();
    Set<ERole> roles = new HashSet<>();

    if (strRoles == null) {
      roles.add(ERole.ROLE_JOB_SEEKER);
    } else {
      strRoles.forEach(role -> {
        switch (role) {
        case "recruiter":
          roles.add(ERole.ROLE_RECRUITER);
          break;
        default:
          roles.add(ERole.ROLE_JOB_SEEKER);
        }
      });
    }

    user.setRoles(roles);
    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }
}
