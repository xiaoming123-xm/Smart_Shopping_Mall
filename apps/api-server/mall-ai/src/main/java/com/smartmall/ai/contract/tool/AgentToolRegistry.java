package com.smartmall.ai.contract.tool;
import org.springframework.stereotype.Component;
import java.util.*;
/** 工具注册表。各模块/编排层把 AgentTool 实现注入进来即可被场景层使用。 */
@Component public class AgentToolRegistry {
    private final Map<String,AgentTool> tools=new LinkedHashMap<>();
    public AgentToolRegistry(List<AgentTool> beans){ for(AgentTool t: beans) tools.put(t.name(), t); }
    public Optional<AgentTool> find(String name){ return Optional.ofNullable(tools.get(name)); }
    public Collection<AgentTool> all(){ return tools.values(); }
}
