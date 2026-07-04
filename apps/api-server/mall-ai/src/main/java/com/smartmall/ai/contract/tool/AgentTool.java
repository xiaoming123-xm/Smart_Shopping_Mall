package com.smartmall.ai.contract.tool;
import java.util.Map;
/**
 * 第3层 Agent 工具层契约。
 * 工具定义放在 mall-ai 契约层(Agent.md 4.5), 跨模块的真实实现由 mall-application 提供。
 */
public interface AgentTool {
    String name();              // searchProducts / queryOrderStatus / ...
    String description();
    ToolResult invoke(Map<String,Object> args);
}
