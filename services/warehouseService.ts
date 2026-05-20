import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface WarehouseRegion {
  id: number
  name: string
  is_primary?: boolean
}

export interface Warehouse {
  id?: number
  name: string
  description?: string | null
  is_primary?: boolean
  regions?: WarehouseRegion[]
  created_at?: string
  updated_at?: string
}

export interface WarehouseFormData {
  name: string
  description?: string | null
  is_primary?: boolean
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
}

export interface SingleResponse<T> {
  data: T
}

export const warehouseService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<Warehouse>>('/api/admin/stock/warehouses', { params })
  },
  getById(id: number | string) {
    return api.get<SingleResponse<Warehouse>>(`/api/admin/stock/warehouses/${id}`)
  },
  getCreateData() {
    return api.get<Record<string, never>>('/api/admin/stock/warehouses/create')
  },
  getEditData(id: number | string) {
    return api.get<SingleResponse<Warehouse>>(`/api/admin/stock/warehouses/${id}/edit`)
  },
  create(warehouse: WarehouseFormData) {
    return api.post<{ data: Warehouse; message: string }>('/api/admin/stock/warehouses', warehouse)
  },
  update(id: number | string, warehouse: WarehouseFormData) {
    return api.put<{ data: Warehouse; message: string }>(`/api/admin/stock/warehouses/${id}`, warehouse)
  },
  delete(id: number | string) {
    return api.delete<{ message: string }>(`/api/admin/stock/warehouses/${id}`)
  },
}

