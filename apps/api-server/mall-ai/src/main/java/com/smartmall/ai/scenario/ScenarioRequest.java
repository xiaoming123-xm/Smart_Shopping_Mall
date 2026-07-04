package com.smartmall.ai.scenario;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data public class ScenarioRequest {
    @NotBlank private String message;
}
