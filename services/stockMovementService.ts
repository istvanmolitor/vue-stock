import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export type StockMovementType = 'in' | 'out' | 'transfer'

export interface StockMovementTypeOption {
  value: StockMovementType
  label: string
}

export interface WarehouseRegionOption {
  id: number
  warehouse_id: number
  name: string
  warehouse_name?: string | null
  label: string
}

export interface ProductOption {
  id: number
  sku: string
  label: string
}

export interface StockMovementCreateDataResponse {
  movement_types: StockMovementTypeOption[]
  warehouse_regions: WarehouseRegionOption[]
  products: ProductOption[]
}

export interface StockMovementItem {
  id?: number
  product_id: number | null
  quantity: number
  warehouse_region_id: number | null
  destination_warehouse_region_id?: number | null
  product?: { id: number; sku: string }
  warehouse_region?: { id: number; name: string; warehouse_name?: string | null; label: string }
  destination_warehouse_region?: { id: number; name: string; warehouse_name?: string | null; label: string } | null
}

export interface StockMovement {
  id?: number
  type: StockMovementType
  type_label?: string
  warehouse_id?: number
  description?: string | null
  closed_at?: string | null
  is_closed?: boolean
  user_id?: number
  linked_stock_movement_id?: number | null
  created_at?: string
  updated_at?: string
  warehouse?: { id: number; name: string }
  user?: { id: number; name: string }
  items?: StockMovementItem[]
  items_count?: number
}

export interface StockMovementFormData {
  type: StockMovementType
  description?: string
  items: StockMovementItemFormData[]
}

export interface StockMovementItemFormData {
  warehouse_region_id: number | null
  destination_warehouse_region_id?: number | null
  product_id: number | null
  quantity: number
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

export const stockMovementService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<StockMovement>>('/api/admin/stock/movements', { params })
  },
  getCreateData() {
    return api.get<StockMovementCreateDataResponse>('/api/admin/stock/movements/create')
  },
  getEditData(id: number | string) {
    return api.get<{ data: StockMovement } & StockMovementCreateDataResponse>(`/api/admin/stock/movements/${id}/edit`)
  },
  create(payload: StockMovementFormData) {
    return api.post<{ data: StockMovement; message: string }>('/api/admin/stock/movements', payload)
  },
  update(id: number | string, payload: StockMovementFormData) {
    return api.put<{ data: StockMovement; message: string }>(`/api/admin/stock/movements/${id}`, payload)
  },
  delete(id: number | string) {
    return api.delete<{ message: string }>(`/api/admin/stock/movements/${id}`)
  },
  execute(id: number | string) {
    return api.post<{ data: StockMovement; message: string }>(`/api/admin/stock/movements/${id}/execute`)
  },
}
