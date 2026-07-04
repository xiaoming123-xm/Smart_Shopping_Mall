import { httpGet, httpPost, httpPut, httpDelete } from "./http";
import type { SysUserDTO } from "./types";

export const sysUserApi = {
  list: () => httpGet<SysUserDTO[]>("/system/users"),
  get: (id: number) => httpGet<SysUserDTO>(`/system/users/${id}`),
  create: (req: SysUserDTO) => httpPost<SysUserDTO>("/system/users", req),
  update: (id: number, req: SysUserDTO) => httpPut<SysUserDTO>(`/system/users/${id}`, req),
  remove: (id: number) => httpDelete<void>(`/system/users/${id}`),
};
