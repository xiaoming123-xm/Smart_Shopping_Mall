package com.smartmall.ai.content;

import lombok.Data;

@Data
public class GenerateVideoResponse {
    private String taskId;
    private String status;
    private Integer progress;
}
