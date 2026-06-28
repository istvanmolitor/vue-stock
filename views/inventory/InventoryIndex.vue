<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
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

const columns = ref<Column[]>([])

const fetchInventories = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await inventoryService.getAll(params)
    inventories.value = response.data.data
    pagination.value = response.data.meta
    columns.value = (response.data.columns ?? []) as Column[]
  } catch {
    toastService.error('Hiba történt a leltárak betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const editInventory = (id: number) => {
  router.push(`/admin/stock/inventory/${id}/edit`)
}

const deleteInventory = async (id: number) => {
  try {
    await inventoryService.delete(id)
    toastService.success('A leltár sikeresen törölve lett!')
    await fetchInventories({ page: Number(pagination.value.current_page) || 1 })
  } catch (error: any) {
    const message = error?.response?.data?.message ?? 'Hiba történt a törlés során.'
    toastService.error(message)
  }
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

      <template #cell-user="{ row }">
        {{ (row as Inventory).user?.name ?? '-' }}
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
        <DeleteButton
          v-if="!(row as Inventory).is_closed"
          @confirm="deleteInventory((row as Inventory).id!)"
        />
      </template>

      <template #empty>
        Nincs megjeleníthető leltár.
      </template>
    </DataTable>
  </AdminLayout>
</template>

