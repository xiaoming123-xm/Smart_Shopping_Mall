package com.smartmall.application.ai.tools;
import com.smartmall.ai.contract.tool.AgentTool;
import com.smartmall.ai.contract.tool.ToolResult;
import com.smartmall.order.application.OrderAppService;
import com.smartmall.order.application.dto.OrderDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Map;
/** AI 工具: 查询订单状态。跨模块调用通过 mall-application 完成。 */
@Component @RequiredArgsConstructor public class QueryOrderStatusTool implements AgentTool {
    private final OrderAppService orderApp;
    @Override public String name(){ return "queryOrderStatus"; }
    @Override public String description(){ return "根据订单ID查询订单状态"; }
    @Override public ToolResult invoke(Map<String,Object> args){
        Object idRaw = args==null?null:args.get("orderId");
        if(idRaw==null) return ToolResult.fail("缺少 orderId");
        try {
            OrderDTO o=orderApp.get(Long.valueOf(String.valueOf(idRaw)));
            String latest = (o.getLogisticsTraces()==null || o.getLogisticsTraces().isEmpty())
                ? "暂无物流轨迹"
                : o.getLogisticsTraces().get(o.getLogisticsTraces().size()-1).getContent();
            return ToolResult.ok("订单状态: "+o.getStatusText()+"; 物流: "+latest, o);
        } catch (Exception e){ return ToolResult.fail("订单查询失败: "+e.getMessage()); }
    }
}
