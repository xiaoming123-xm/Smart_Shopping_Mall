package com.smartmall.bootstrap.web;

import com.smartmall.common.api.R;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BizException.class)
    public R<?> handleBiz(BizException ex) {
        log.warn("business exception: code={}, msg={}", ex.getCode(), ex.getMessage());
        return R.fail(ex.getCode(), ex.getMessage()).withTraceId();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public R<?> handleValidation(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));
        String message = detail.isEmpty() ? ResultCode.PARAM_INVALID.getMessage() : detail;
        return R.fail(ResultCode.PARAM_INVALID.getCode(), message).withTraceId();
    }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public R<?> handleNotFound(NoResourceFoundException ex) {
        return R.fail(ResultCode.NOT_FOUND.getCode(), ResultCode.NOT_FOUND.getMessage()).withTraceId();
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public R<?> handleOther(Exception ex) {
        log.error("unhandled exception", ex);
        return R.fail(ResultCode.SYSTEM_ERROR).withTraceId();
    }

    private String formatFieldError(FieldError fe) {
        return fe.getField() + ": " + fe.getDefaultMessage();
    }
}