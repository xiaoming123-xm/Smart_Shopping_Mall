package com.smartmall.ai.contract.tool;
import lombok.AllArgsConstructor;
import lombok.Data;
/** Agent 工具调用结果。 */
@Data @AllArgsConstructor public class ToolResult {
    private boolean success;
    private String summary;
    private Object data;
    public static ToolResult ok(String summary, Object data){ return new ToolResult(true, summary, data); }
    public static ToolResult fail(String summary){ return new ToolResult(false, summary, null); }
}
