package com.smartmall.ai.content;

import com.fasterxml.jackson.databind.JsonNode;
import com.smartmall.ai.modelaccess.AiProperties;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class StepFunImageGenerationClient implements ImageGenerationClient {
    private final AiProperties props;

    public StepFunImageGenerationClient(AiProperties props) {
        this.props = props;
    }

    @Override
    public String provider() {
        String model = props.imageModel();
        return model == null || model.isBlank() ? "stepfun" : "stepfun/" + model;
    }

    @Override
    public ImageGenerationResult generate(GenerateImageRequest request) {
        String baseUrl = props.imageBaseUrl();
        String apiKey = props.imageApiKey();
        String model = props.imageModel();
        if (baseUrl.isBlank() || apiKey.isBlank() || model.isBlank()) {
            throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 图片模型配置不完整");
        }
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("model", model);
            body.add("prompt", buildPrompt(request));
            body.add("size", props.imageSize());
            body.add("response_format", props.imageResponseFormat());
            body.add("image", imagePart(request.getImageUrl()));
            JsonNode node = restClient(baseUrl, props.imageTimeoutMs())
                    .post()
                    .uri("/images/edits")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String imageUrl = extractImageUrl(node);
            if (imageUrl.isBlank()) {
                throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 图片模型未返回可用图片");
            }
            return new ImageGenerationResult(provider(), imageUrl, "SUCCESS");
        } catch (ResourceAccessException ex) {
            throw new BizException(ResultCode.AI_TIMEOUT, "StepFun 图片生成超时");
        } catch (IOException ex) {
            throw new BizException(ResultCode.AI_BAD_REQUEST, "图片素材读取失败");
        } catch (RestClientException ex) {
            throw new BizException(ResultCode.AI_PROVIDER_UNAVAILABLE, "StepFun 图片生成失败: " + ex.getMessage());
        }
    }

    private Object imagePart(String imageUrl) throws IOException {
        ImageBinary image = loadImage(imageUrl);
        return new ByteArrayResource(image.bytes()) {
            @Override
            public String getFilename() {
                return image.filename();
            }
        };
    }

    private ImageBinary loadImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BizException(ResultCode.AI_BAD_REQUEST, "缺少图片素材");
        }
        if (imageUrl.startsWith("data:")) {
            return decodeDataUrl(imageUrl);
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            try (InputStream stream = URI.create(imageUrl).toURL().openStream()) {
                return new ImageBinary(readAll(stream), guessFilename(imageUrl));
            }
        }
        if (imageUrl.startsWith("blob:")) {
            throw new BizException(ResultCode.AI_BAD_REQUEST, "当前图片仍是浏览器临时地址，请重新上传后再试");
        }
        throw new BizException(ResultCode.AI_BAD_REQUEST, "暂不支持的图片地址格式");
    }

    private ImageBinary decodeDataUrl(String dataUrl) {
        int comma = dataUrl.indexOf(',');
        if (comma < 0) {
            throw new BizException(ResultCode.AI_BAD_REQUEST, "图片 data URL 格式不正确");
        }
        String meta = dataUrl.substring(5, comma);
        String payload = dataUrl.substring(comma + 1);
        String mime = meta.contains(";") ? meta.substring(0, meta.indexOf(';')) : meta;
        boolean base64 = meta.contains(";base64");
        byte[] bytes = base64
                ? Base64.getDecoder().decode(payload)
                : payload.getBytes(StandardCharsets.UTF_8);
        return new ImageBinary(bytes, "upload" + extensionFor(mime));
    }

    private String extractImageUrl(JsonNode node) {
        if (node == null) {
            return "";
        }
        JsonNode item = node.path("data").path(0);
        String url = item.path("url").asText("");
        if (!url.isBlank()) {
            return url;
        }
        String b64 = item.path("b64_json").asText("");
        if (!b64.isBlank()) {
            return "data:image/png;base64," + b64;
        }
        return "";
    }

    private String buildPrompt(GenerateImageRequest request) {
        String modeHint = switch (request.getMode()) {
            case "change_background" -> "Keep the product intact and replace the background with a clean ecommerce scene.";
            case "style_transfer" -> "Keep the product identity and restyle the image for ecommerce presentation.";
            case "smart_optimize" -> "Improve clarity, lighting, and overall ecommerce visual quality while keeping the product realistic.";
            default -> "Create an ecommerce-ready product image.";
        };
        String userPrompt = request.getPrompt() == null ? "" : request.getPrompt().trim();
        return userPrompt.isBlank() ? modeHint : modeHint + " " + userPrompt;
    }

    private String guessFilename(String imageUrl) {
        String path = URI.create(imageUrl).getPath();
        int slash = path.lastIndexOf('/');
        String name = slash >= 0 ? path.substring(slash + 1) : path;
        return name == null || name.isBlank() ? "upload.png" : name;
    }

    private String extensionFor(String mime) {
        return switch (mime) {
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".png";
        };
    }

    private byte[] readAll(InputStream stream) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        stream.transferTo(out);
        return out.toByteArray();
    }

    private RestClient restClient(String baseUrl, int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    private record ImageBinary(byte[] bytes, String filename) {
    }
}
