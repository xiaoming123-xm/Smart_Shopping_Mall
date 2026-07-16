ALTER TABLE catalog_spu
    MODIFY COLUMN main_image MEDIUMTEXT NULL COMMENT '商品主图，可存 URL 或 data URL';
