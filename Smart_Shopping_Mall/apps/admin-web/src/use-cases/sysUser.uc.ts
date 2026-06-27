import { sysUserApi } from "@/api";
import type { SysUserDTO } from "@/api";

export const loadSysUsers = (): Promise<SysUserDTO[]> => sysUserApi.list();
export const saveSysUser = (u: SysUserDTO): Promise<SysUserDTO> => (u.id ? sysUserApi.update(u.id, u) : sysUserApi.create(u));
export const deleteSysUser = (id: number): Promise<void> => sysUserApi.remove(id);
