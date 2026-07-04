package com.smartmall.application.ai.tools;
import com.smartmall.ai.contract.tool.AgentTool;
import com.smartmall.ai.contract.tool.ToolResult;
import com.smartmall.catalog.application.SpuAppService;
import com.smartmall.catalog.application.dto.SpuDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
/** AI 工具: 搜索商品。跨模块调用通过 mall-application 完成。 */
@Component @RequiredArgsConstructor public class SearchProductsTool implements AgentTool {
    private final SpuAppService spuApp;
    @Override public String name(){ return "searchProducts"; }
    @Override public String description(){ return "根据关键字搜索商品(SPU)"; }
    @Override public ToolResult invoke(Map<String,Object> args){
        String kw = args==null?null:String.valueOf(args.getOrDefault("keyword",""));
        List<SpuDTO> all=spuApp.list();
        List<SpuDTO> hit=all.stream()
            .filter(s -> kw==null||kw.isBlank()||(s.getName()!=null&&s.getName().contains(kw)))
            .toList();
        return ToolResult.ok("命中 "+hit.size()+" 个商品", hit);
    }
}
