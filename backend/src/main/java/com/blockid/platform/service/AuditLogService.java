package com.blockid.platform.service;

import com.blockid.platform.model.AuditLog;
import com.blockid.platform.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private HttpServletRequest request;

    public void log(String action, String actor, String target, String severity, String module) {
        String ipAddress = "127.0.0.1";
        if (request != null) {
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader != null) {
                ipAddress = xfHeader.split(",")[0];
            } else {
                ipAddress = request.getRemoteAddr();
            }
        }

        AuditLog auditLog = new AuditLog(action, actor, target, ipAddress, severity, module);
        auditLogRepository.save(auditLog);
    }
}
