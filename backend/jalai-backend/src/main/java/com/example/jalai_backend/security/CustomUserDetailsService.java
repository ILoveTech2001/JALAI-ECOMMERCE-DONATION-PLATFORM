package com.example.jalai_backend.security;

import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.OrphanageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OrphanageRepository orphanageRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find user in Client table first
        Optional<Client> client = clientRepository.findByEmail(email);
        if (client.isPresent()) {
            return createUserDetails(client.get().getEmail(), client.get().getPassword(), 
                                   "CLIENT", client.get().getIsActive(), client.get().getId().toString());
        }

        // Try to find user in Admin table
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return createUserDetails(admin.get().getEmail(), admin.get().getPassword(), 
                                   "ADMIN", admin.get().getIsActive(), admin.get().getId().toString());
        }

        // Try to find user in Orphanage table
        Optional<Orphanage> orphanage = orphanageRepository.findByEmail(email);
        if (orphanage.isPresent()) {
            return createUserDetails(orphanage.get().getEmail(), orphanage.get().getPassword(), 
                                   "ORPHANAGE", orphanage.get().getIsActive(), orphanage.get().getId().toString());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }

    private UserDetails createUserDetails(String email, String password, String role, Boolean isActive, String userId) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

        return new CustomUserPrincipal(
            userId,
            email,
            password,
            isActive != null ? isActive : true,
            true, // accountNonExpired
            true, // credentialsNonExpired
            true, // accountNonLocked
            authorities,
            role
        );
    }

    // Custom UserDetails implementation
    public static class CustomUserPrincipal implements UserDetails {
        private String id;
        private String email;
        private String password;
        private boolean enabled;
        private boolean accountNonExpired;
        private boolean credentialsNonExpired;
        private boolean accountNonLocked;
        private Collection<? extends GrantedAuthority> authorities;
        private String userType;

        public CustomUserPrincipal(String id, String email, String password, boolean enabled,
                                 boolean accountNonExpired, boolean credentialsNonExpired,
                                 boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities,
                                 String userType) {
            this.id = id;
            this.email = email;
            this.password = password;
            this.enabled = enabled;
            this.accountNonExpired = accountNonExpired;
            this.credentialsNonExpired = credentialsNonExpired;
            this.accountNonLocked = accountNonLocked;
            this.authorities = authorities;
            this.userType = userType;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getPassword() {
            return password;
        }

        @Override
        public String getUsername() {
            return email;
        }

        @Override
        public boolean isAccountNonExpired() {
            return accountNonExpired;
        }

        @Override
        public boolean isAccountNonLocked() {
            return accountNonLocked;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return credentialsNonExpired;
        }

        @Override
        public boolean isEnabled() {
            return enabled;
        }

        // Custom getters
        public String getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getUserType() {
            return userType;
        }
    }
}
