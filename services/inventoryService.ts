import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface InventoryRegionOption {
  id: number
  name: string
  warehouse_id?: number
  warehouse_name?: string | null
  label?: string
}

export interface InventoryItem {
  id?: number
  product_id: number | null
  old_quantity: number
  new_quantity: number
  product?: {
    id: number
    sku: string
  }
}

export interface Inventory {
  id?: number
  user_id?: number | null
  warehouse_region_id: number | null
  description?: string | null
  stock_updated_at?: string | null
  is_closed?: boolean
  items_count?: number
  created_at?: string
  updated_at?: string
  warehouse_region?: {
    id: number
    name: string
    warehouse_name?: string | null
    label?: string
  }
  user?: {
    id: number
    name: string
  }
  items?: InventoryItem[]
}

export interface InventoryCreateFormData {
  warehouse_region_id: number | null
  description?: string
}

export interface InventoryUpdateFormData {
  description?: string
  items: Array<{
    id?: number
    product_id: number | null
    new_quantity: number
  }>
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

export interface InventoryFormDataResponse {
  warehouse_regions: InventoryRegionOption[]
}

export const inventoryService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number }) {
    return api.get<PaginatedResponse<Inventory>>('/api/admin/stock/inventories', { params })
  },
  getCreateData() {
    return api.get<InventoryFormDataResponse>('/api/admin/stock/inventories/create')
  },
  getEditData(id: number | string) {
    return api.get<{ data: Inventory } & InventoryFormDataResponse>(`/api/admin/stock/inventories/${id}/edit`)
  },
  create(payload: InventoryCreateFormData) {
    return api.post<{ data: Inventory; message: string }>('/api/admin/stock/inventories', payload)
  },
  update(id: number | string, payload: InventoryUpdateFormData) {
    return api.put<{ data: Inventory; message: string }>(`/api/admin/stock/inventories/${id}`, payload)
  },
  delete(id: number | string) {
    return api.delete<{ message: string }>(`/api/admin/stock/inventories/${id}`)
  },
  close(id: number | string) {
    return api.post<{ data: Inventory; message: string }>(`/api/admin/stock/inventories/${id}/close`)
  },
}


