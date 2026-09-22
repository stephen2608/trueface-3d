package com.trueface3d.config;

import com.trueface3d.websocket.SpatialWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SpatialWebSocketHandler spatialWebSocketHandler;

    public WebSocketConfig(SpatialWebSocketHandler spatialWebSocketHandler) {
        this.spatialWebSocketHandler = spatialWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(spatialWebSocketHandler, "/ws/spatial-telemetry")
                .setAllowedOrigins("*");
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        // Set buffer to 1MB to accommodate high-resolution 478 3D landmark arrays
        container.setMaxTextMessageBufferSize(1024 * 1024);
        container.setMaxBinaryMessageBufferSize(1024 * 1024);
        container.setMaxSessionIdleTimeout(300000L); // 5 minutes
        container.setAsyncSendTimeout(5000L);
        return container;
    }
}
