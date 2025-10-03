package com.example.demo.servicio

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() } // Deshabilita CSRF para APIs REST
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/auth/**", "/api/usuarios/**","/api/admins/**", "/api/productos/**","/api/categorias/**","/api/marcas/**").permitAll() // Permite el acceso a todas las rutas de /api/auth
                    .anyRequest().authenticated() // Requiere autenticación para cualquier otra ruta
            }
        return http.build()
    }
}