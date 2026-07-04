package com.smartmall.system.interfaces.web;
import com.smartmall.system.application.SysUserAppService;
import com.smartmall.system.application.dto.SysUserDTO;
import com.smartmall.common.api.R;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/system/users") @RequiredArgsConstructor
public class SysUserController {
    private final SysUserAppService svc;
    @GetMapping public R<List<SysUserDTO>> list(){ return R.ok(svc.list()); }
    @GetMapping("/{id}") public R<SysUserDTO> get(@PathVariable Long id){ return R.ok(svc.get(id)); }
    @PostMapping public R<SysUserDTO> create(@RequestBody SysUserDTO req){ return R.ok(svc.create(req)); }
    @PutMapping("/{id}") public R<SysUserDTO> update(@PathVariable Long id,@RequestBody SysUserDTO req){ return R.ok(svc.update(id,req)); }
    @DeleteMapping("/{id}") public R<Void> delete(@PathVariable Long id){ svc.delete(id); return R.ok(); }
}
