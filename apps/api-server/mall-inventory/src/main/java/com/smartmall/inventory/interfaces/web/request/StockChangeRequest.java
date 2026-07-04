package com.smartmall.inventory.interfaces.web.request;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data public class StockChangeRequest {
    @NotNull private Long skuId;
    @NotNull @Min(1) private Integer qty;
    private String remark;
}
