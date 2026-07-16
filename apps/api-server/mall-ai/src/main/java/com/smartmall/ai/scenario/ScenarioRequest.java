package com.smartmall.ai.scenario;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data public class ScenarioRequest {
    private Long memberId;
    @NotBlank private String message;
}
