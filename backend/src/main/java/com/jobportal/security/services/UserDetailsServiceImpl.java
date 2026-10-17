package com.jobportal.security.services;

import com.jobportal.model.User;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  @Autowired
  UserRepository userRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
    User user = userRepository.findByUsername(login)
        .or(() -> userRepository.findByEmail(login))
        .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + login));

    return UserDetailsImpl.build(user);
  }
}
