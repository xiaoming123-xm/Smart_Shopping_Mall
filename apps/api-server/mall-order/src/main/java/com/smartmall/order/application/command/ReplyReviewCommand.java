package com.smartmall.order.application.command;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewCommand {
    @NotBlank private String reply;
}
