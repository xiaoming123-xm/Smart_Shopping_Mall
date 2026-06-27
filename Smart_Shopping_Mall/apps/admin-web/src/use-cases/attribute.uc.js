import { attributeApi } from "@/api";
export const loadAttributes = () => attributeApi.list();
export const saveAttribute = (a) => (a.id ? attributeApi.update(a.id, a) : attributeApi.create(a));
export const deleteAttribute = (id) => attributeApi.remove(id);
export const addAttributeValue = (attrId, value, sort) => attributeApi.addValue(attrId, value, sort);
export const removeAttributeValue = (valId) => attributeApi.removeValue(valId);
