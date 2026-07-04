package com.smartmall.order.application.command;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
@Data public class CreateOrderCommand {
    @NotNull private Long memberId;
    @NotBlank private String receiver;
    private String receiverPhone;
    @NotBlank private String address;
    private String remark;
    @NotEmpty @Valid private List<Item> items;
    @Data public static class Item {
        @NotNull private Long skuId;
        private String skuCode;
        private String productName;
        @NotNull @DecimalMin("0.0") private java.math.BigDecimal price;
        @NotNull @Min(1) private Integer quantity;
    }
}
