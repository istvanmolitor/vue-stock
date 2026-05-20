<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { warehouseService, type Warehouse } from '@stock/services/warehouseService'

const router = useRouter()
const warehouses = ref<Warehouse[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<Warehouse>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'description', label: 'Leírás', sortable: false },
  { key: 'is_primary', label: 'Elsődleges', sortable: false, width: '140px' },
  { key: 'updated_at', label: 'Módosítva', sortable: true, width: '180px' },
]

const fetchWarehouses = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await warehouseService.getAll(params)
    warehouses.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a raktárak betöltésekor:', error)
    toastService.error('Hiba történt a raktárak betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const deleteWarehouse = async (id: number) => {
  try {
    await warehouseService.delete(id)
    toastService.success('A raktár sikeresen törölve lett!')
    await fetchWarehouses({ page: pagination.value.current_page })
  } catch (error) {
    console.error('Hiba a raktár törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editWarehouse = (id: number) => {
  router.push(`/admin/stock/warehouse/${id}/edit`)
}

onMounted(() => {
  fetchWarehouses({ page: 1, sort: 'name', direction: 'asc' })
})
</script>

<template>
  <AdminLayout pageTitle="Raktárak">
    <DataTable
      :columns="columns"
      :data="warehouses"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés név vagy leírás alapján..."
      default-sort="name"
      default-direction="asc"
      @fetch="fetchWarehouses"
    >
      <template #actions>
        <CreateButton to="/admin/stock/warehouse/create">
          Új raktár
        </CreateButton>
      </template>

      <template #cell-is_primary="{ row }">
        <span
          v-if="row.is_primary"
          class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
        >
          Igen
        </span>
        <span
          v-else
          class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
        >
          Nem
        </span>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editWarehouse(row.id!)" />
        <DeleteButton @confirm="deleteWarehouse(row.id!)" />
      </template>

      <template #empty>
        Nincs megjeleníthető raktár.
      </template>
    </DataTable>
  </AdminLayout>
</template>

