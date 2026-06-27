-- 商品中心：分类 / 品牌 / 属性 / SPU / SKU
-- 对应 com.smartmall.catalog.domain.model.*

CREATE TABLE IF NOT EXISTS catalog_category (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    parent_id  BIGINT      NOT NULL DEFAULT 0 COMMENT '父级ID,0为顶级',
    name       VARCHAR(64) NOT NULL COMMENT '分类名称',
    sort       INT         NOT NULL DEFAULT 0 COMMENT '排序,越小越靠前',
    enabled    TINYINT(1)  NOT NULL DEFAULT 1,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_category_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

CREATE TABLE IF NOT EXISTS catalog_brand (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64)  NOT NULL COMMENT '品牌名称',
    logo        VARCHAR(255)          DEFAULT NULL,
    description VARCHAR(512)          DEFAULT NULL,
    enabled     TINYINT(1)   NOT NULL DEFAULT 1,
    sort        INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_brand_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品牌';

CREATE TABLE IF NOT EXISTS catalog_attribute (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    name       VARCHAR(64) NOT NULL COMMENT '属性名,如 颜色/尺码',
    type       VARCHAR(16) NOT NULL DEFAULT 'SELECT' COMMENT '类型 SELECT/INPUT',
    searchable TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '是否可检索',
    required   TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '是否必填',
    sort       INT         NOT NULL DEFAULT 0,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性';

CREATE TABLE IF NOT EXISTS catalog_attribute_value (
    id      BIGINT      NOT NULL AUTO_INCREMENT,
    attr_id BIGINT      NOT NULL COMMENT '所属属性ID',
    value   VARCHAR(64) NOT NULL COMMENT '属性值,如 红色',
    sort    INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_attr_value_attr (attr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性值';

CREATE TABLE IF NOT EXISTS catalog_spu (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    name        VARCHAR(128)   NOT NULL COMMENT '商品名称',
    category_id BIGINT                  DEFAULT NULL,
    brand_id    BIGINT                  DEFAULT NULL,
    main_image  VARCHAR(255)            DEFAULT NULL,
    description TEXT                    DEFAULT NULL,
    price       DECIMAL(12,2)  NOT NULL DEFAULT 0.00 COMMENT '展示销售价',
    cost_price  DECIMAL(12,2)           DEFAULT NULL COMMENT '成本价(财务增强预留)',
    stock       INT            NOT NULL DEFAULT 0 COMMENT '冗余库存(真实库存在 inventory)',
    status      TINYINT        NOT NULL DEFAULT 1 COMMENT '0下架 1上架',
    sort        INT            NOT NULL DEFAULT 0,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_spu_category (category_id),
    KEY idx_spu_brand (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SPU';

CREATE TABLE IF NOT EXISTS catalog_sku (
    id         BIGINT         NOT NULL AUTO_INCREMENT,
    spu_id     BIGINT         NOT NULL COMMENT '所属SPU',
    sku_code   VARCHAR(64)    NOT NULL COMMENT 'SKU编码',
    specs      VARCHAR(128)            DEFAULT NULL COMMENT '规格描述,如 红色/XL',
    price      DECIMAL(12,2)  NOT NULL DEFAULT 0.00 COMMENT '销售价',
    cost_price DECIMAL(12,2)           DEFAULT NULL COMMENT '成本价(财务增强预留)',
    stock      INT            NOT NULL DEFAULT 0 COMMENT '冗余库存',
    status     TINYINT        NOT NULL DEFAULT 1 COMMENT '0停用 1启用',
    PRIMARY KEY (id),
    UNIQUE KEY uk_sku_code (sku_code),
    KEY idx_sku_spu (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU';
