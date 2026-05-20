import { createApiClient } from '@user/services/apiClient'
import type { Warehouse } from './warehouseService'

const api = createApiClient()

export interface WarehouseRegion {
  id?: number
  warehouse_id: number
  name: string
  description?: string | null
  is_primary?: boolean
  warehouse?: Warehouse
  created_at?: string
  updated_at?: string
}

export interface WarehouseRegionFormData {
  warehouse_id: number | null
  name: string
  description?: string | null
  is_primary?: boolean
}

export interface CreateDataResponse {
  warehouses: Warehouse[]
}

export interface EditDataResponse {
  data: WarehouseRegion
  warehouses: Warehouse[]
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

export const warehouseRegionService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<WarehouseRegion>>('/api/admin/stock/warehouse-regions', { params })
  },
  getById(id: number | string) {
    return api.get<{ data: WarehouseRegion }>(`/api/admin/stock/warehouse-regions/${id}`)
  },
  getCreateData() {
    return api.get<CreateDataResponse>('/api/admin/stock/warehouse-regions/create')
  },
  getEditData(id: number | string) {
    return api.get<EditDataResponse>(`/api/admin/stock/warehouse-regions/${id}/edit`)
  },
  create(region: WarehouseRegionFormData) {
    return api.post<{ data: WarehouseRegion; message: string }>('/api/admin/stock/warehouse-regions', region)
  },
  update(id: number | string, region: WarehouseRegionFormData) {
    return api.put<{ data: WarehouseRegion; message: string }>(`/api/admin/stock/warehouse-regions/${id}`, region)
  },
  delete(id: number | string) {
    return api.delete<{ message: string }>(`/api/admin/stock/warehouse-regions/${id}`)
  },
}

