<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { inventoryService, type Inventory } from '@stock/services/inventoryService'

const router = useRouter()
const inventories = ref<Inventory[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const columns: Column<Inventory>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'warehouse_region', label: 'Régió', sortable: false },
  { key: 'description', label: 'Leírás', sortable: false },
  { key: 'items_count', label: 'Tételek', sortable: false, width: '90px' },
  { key: 'is_closed', label: 'Állapot', sortable: false, width: '120px' },
  { key: 'stock_updated_at', label: 'Készlet módosítva', sortable: true, width: '180px' },
]

const fetchInventories = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await inventoryService.getAll(params)
    inventories.value = response.data.data
    pagination.value = response.data.meta
  } catch {
    toastService.error('Hiba történt a leltárak betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const editInventory = (id: number) => {
  router.push(`/admin/stock/inventory/${id}/edit`)
}

onMounted(() => {
  fetchInventories({ page: 1 })
})
</script>

<template>
  <AdminLayout pageTitle="Leltárak">
    <DataTable
      :columns="columns"
      :data="inventories"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés leírás alapján..."
      @fetch="fetchInventories"
    >
      <template #actions>
        <CreateButton to="/admin/stock/inventory/create">
          Új leltár
        </CreateButton>
      </template>

      <template #cell-warehouse_region="{ row }">
        {{ (row as Inventory).warehouse_region?.label ?? (row as Inventory).warehouse_region?.name ?? '-' }}
      </template>

      <template #cell-is_closed="{ row }">
        <span
          v-if="(row as Inventory).is_closed"
          class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
        >
          Lezárva
        </span>
        <span
          v-else
          class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
        >
          Nyitott
        </span>
      </template>

      <template #cell-stock_updated_at="{ row }">
        {{ (row as Inventory).stock_updated_at ?? '-' }}
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editInventory((row as Inventory).id!)" />
      </template>

      <template #empty>
        Nincs megjeleníthető leltár.
      </template>
    </DataTable>
  </AdminLayout>
</template>

