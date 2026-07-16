package com.smartmall.ai.content;

import com.smartmall.ai.modelaccess.AiProperties;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.springframework.stereotype.Component;

@Component
public class RoutingImageGenerationClient implements ImageGenerationClient {
    private final AiProperties props;
    private final MockImageGenerationClient mock;
    private final StepFunImageGenerationClient stepFun;

    public RoutingImageGenerationClient(AiProperties props, MockImageGenerationClient mock, StepFunImageGenerationClient stepFun) {
        this.props = props;
        this.mock = mock;
        this.stepFun = stepFun;
    }

    @Override
    public String provider() {
        return delegate().provider();
    }

    @Override
    public ImageGenerationResult generate(GenerateImageRequest request) {
        ImageGenerationClient client = delegate();
        try {
            return client.generate(request);
        } catch (BizException ex) {
            if (client == stepFun && shouldFallback(ex)) {
                return mock.generate(request);
            }
            throw ex;
        }
    }

    private ImageGenerationClient delegate() {
        String provider = props.imageProvider().toLowerCase();
        if ("stepfun".equals(provider) || "step".equals(provider)) {
            return stepFun;
        }
        return mock;
    }

    private boolean shouldFallback(BizException ex) {
        String message = ex.getMessage();
        String lower = message == null ? "" : message.toLowerCase();
        return ex.getCode() == ResultCode.AI_PROVIDER_UNAVAILABLE.getCode()
                || ex.getCode() == ResultCode.AI_TIMEOUT.getCode()
                || lower.contains("limit")
                || lower.contains("rate")
                || lower.contains("quota")
                || lower.contains("429")
                || lower.contains("500")
                || lower.contains("503")
                || lower.contains("internal server error")
                || lower.contains("service unavailable")
                || containsAny(message, "限频", "限流", "频控", "配额", "服务不可用", "服务器错误");
    }

    private boolean containsAny(String message, String... keywords) {
        if (message == null || message.isBlank()) {
            return false;
        }
        for (String keyword : keywords) {
            if (message.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
