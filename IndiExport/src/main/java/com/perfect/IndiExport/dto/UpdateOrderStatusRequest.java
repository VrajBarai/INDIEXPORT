package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.Order;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private Order.OrderStatus status;
}
