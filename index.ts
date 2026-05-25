export { warehouseService } from './services/warehouseService'
export { warehouseRegionService } from './services/warehouseRegionService'
export { stockMovementService } from './services/stockMovementService'
export { stockProductService } from './services/stockProductService'
export type { Warehouse, WarehouseFormData } from './services/warehouseService'
export type { WarehouseRegion, WarehouseRegionFormData } from './services/warehouseRegionService'
export type { StockMovement, StockMovementFormData, StockMovementType, StockMovementItem, StockMovementItemFormData } from './services/stockMovementService'
export type { StockProduct, StockProductDetail, StockProductRegionQuantity, StockProductWarehouse } from './services/stockProductService'
export { default as router } from './router/index'
export { stockMenuBuilder } from './config/menuBuilder'




