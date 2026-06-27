import { attributeApi } from "@/api";
import type { AttributeDTO } from "@/api";

export const loadAttributes = (): Promise<AttributeDTO[]> => attributeApi.list();
export const saveAttribute = (a: AttributeDTO): Promise<AttributeDTO> => (a.id ? attributeApi.update(a.id, a) : attributeApi.create(a));
export const deleteAttribute = (id: number): Promise<void> => attributeApi.remove(id);
export const addAttributeValue = (attrId: number, value: string, sort?: number) => attributeApi.addValue(attrId, value, sort);
export const removeAttributeValue = (valId: number): Promise<void> => attributeApi.removeValue(valId);
