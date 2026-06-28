import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface StockProductRegionQuantity {
  warehouse_region_id: number
  warehouse_region_name: string
  warehouse_name?: string | null
  label: string
  quantity: number
  min_quantity?: number | null
  max_quantity?: number | null
  has_limits?: boolean
}

export interface StockProductRegionLimitsPayload {
  min_quantity: number | null
  max_quantity: number | null
}

export interface StockProduct {
  id: number
  sku: string
  main_image_url?: string | null
  quantity_unit?: string | null
  total_quantity: number
  region_quantities: StockProductRegionQuantity[]
}

export interface StockProductWarehouse {
  warehouse_id: number
  warehouse_name: string
  total_quantity: number
  regions: StockProductRegionQuantity[]
}

export interface StockProductDetail {
  id: number
  sku: string
  main_image_url?: string | null
  quantity_unit?: string | null
  total_quantity: number
  warehouse_count: number
  region_count: number
  warehouses: StockProductWarehouse[]
  regions: StockProductRegionQuantity[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters?: {
    search?: string
    sort?: string
    direction?: string
  }
  columns?: Array<{ key: string; label: string; sortable: boolean }>
}

export const stockProductService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<StockProduct>>('/api/admin/stock/products', { params })
  },
  getById(id: number | string) {
    return api.get<{ data: StockProductDetail }>(`/api/admin/stock/products/${id}`)
  },
  updateRegionLimits(productId: number | string, warehouseRegionId: number | string, payload: StockProductRegionLimitsPayload) {
    return api.put<{ data: StockProductRegionQuantity; message: string }>(
      `/api/admin/stock/products/${productId}/regions/${warehouseRegionId}`,
      payload,
    )
  },
}


