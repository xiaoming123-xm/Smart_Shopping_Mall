package com.smartmall.system.application;
import com.smartmall.system.application.dto.SysUserDTO;
import com.smartmall.system.domain.model.SysUser;
import com.smartmall.system.domain.repository.SysUserRepository;
import com.smartmall.common.api.ResultCode;
import com.smartmall.common.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor public class SysUserAppService {
    private final SysUserRepository repo;
    public List<SysUserDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
    public SysUserDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(()->new BizException(ResultCode.SYS_USER_NOT_FOUND)); }
    public SysUserDTO create(SysUserDTO req){
        if(repo.existsByUsername(req.getUsername(),null)) throw new BizException(ResultCode.SYS_USER_NAME_DUPLICATE);
        SysUser u=new SysUser(); u.setUsername(req.getUsername()); u.setNickname(req.getNickname());
        u.setRole(req.getRole()!=null?req.getRole():"OPERATOR"); u.setEnabled(req.getEnabled()!=null?req.getEnabled():true);
        return toDTO(repo.save(u));
    }
    public SysUserDTO update(Long id, SysUserDTO req){
        SysUser u=repo.findById(id).orElseThrow(()->new BizException(ResultCode.SYS_USER_NOT_FOUND));
        if(req.getUsername()!=null&&!req.getUsername().equals(u.getUsername())&&repo.existsByUsername(req.getUsername(),id)) throw new BizException(ResultCode.SYS_USER_NAME_DUPLICATE);
        if(req.getUsername()!=null) u.setUsername(req.getUsername());
        if(req.getNickname()!=null) u.setNickname(req.getNickname());
        if(req.getRole()!=null) u.setRole(req.getRole());
        if(req.getEnabled()!=null) u.setEnabled(req.getEnabled());
        return toDTO(repo.save(u));
    }
    public void delete(Long id){ repo.findById(id).orElseThrow(()->new BizException(ResultCode.SYS_USER_NOT_FOUND)); repo.deleteById(id); }
    private SysUserDTO toDTO(SysUser u){ SysUserDTO d=new SysUserDTO(); d.setId(u.getId()); d.setUsername(u.getUsername()); d.setNickname(u.getNickname()); d.setRole(u.getRole()); d.setEnabled(u.getEnabled()); d.setCreatedAt(u.getCreatedAt()); return d; }
}
