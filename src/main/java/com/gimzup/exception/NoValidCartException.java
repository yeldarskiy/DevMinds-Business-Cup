package com.gimzup.exception;

public class NoValidCartException extends RuntimeException {
    public NoValidCartException(String message) {
        super(message);
    }
}
