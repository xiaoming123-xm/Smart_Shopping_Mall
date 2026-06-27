import { sysUserApi } from "@/api";
export const loadSysUsers = () => sysUserApi.list();
export const saveSysUser = (u) => (u.id ? sysUserApi.update(u.id, u) : sysUserApi.create(u));
export const deleteSysUser = (id) => sysUserApi.remove(id);
