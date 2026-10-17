package com.jobportal.exception;

import com.jobportal.dto.MessageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .map(err -> err.getField() + ": " + err.getDefaultMessage())
        .findFirst()
        .orElse("Invalid request");
    log.warn("Validation failed {}: {}", request.getDescription(false), message);
    return ResponseEntity.badRequest().body(new MessageResponse(message));
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<?> handleDatabase(DataAccessException ex, WebRequest request) {
    log.error("MongoDB / data access error {}: {}", request.getDescription(false), ex.getMessage());
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(new MessageResponse(
            "Database unavailable. Ensure MongoDB is running and URI is mongodb://localhost:27017/jobportaldb"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> globalExceptionHandler(Exception ex, WebRequest request) {
    log.error("Unhandled error {}", request.getDescription(false), ex);
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", new Date());
    body.put("message", "An unexpected error occurred. Check server logs for details.");
    body.put("description", request.getDescription(false));
    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
