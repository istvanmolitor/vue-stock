import type { RouteRecordRaw } from 'vue-router'

const stockRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/stock/warehouse',
    name: 'admin-stock-warehouses',
    component: () => import('../views/warehouse/WarehouseIndex.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/stock/warehouse/create',
    name: 'admin-stock-warehouse-create',
    component: () => import('../views/warehouse/WarehouseCreate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/stock/warehouse/:id/edit',
    name: 'admin-stock-warehouse-edit',
    component: () => import('../views/warehouse/WarehouseEdit.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/stock/warehouse-region',
    name: 'admin-stock-warehouse-regions',
    component: () => import('../views/warehouse-region/WarehouseRegionIndex.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/stock/warehouse-region/create',
    name: 'admin-stock-warehouse-region-create',
    component: () => import('../views/warehouse-region/WarehouseRegionCreate.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/stock/warehouse-region/:id/edit',
    name: 'admin-stock-warehouse-region-edit',
    component: () => import('../views/warehouse-region/WarehouseRegionEdit.vue'),
    meta: { requiresAuth: true },
  },
]

export default stockRoutes

