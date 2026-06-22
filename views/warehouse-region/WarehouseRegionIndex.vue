<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { warehouseRegionService, type WarehouseRegion } from '@stock/services/warehouseRegionService'

const router = useRouter()
const warehouseRegions = ref<WarehouseRegion[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<WarehouseRegion>[] = [
  { key: 'warehouse', label: 'Raktár', sortable: false },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'description', label: 'Leírás', sortable: false },
  { key: 'is_primary', label: 'Elsődleges', sortable: false, width: '140px' },
  { key: 'updated_at', label: 'Módosítva', sortable: true, width: '180px' },
]

const fetchWarehouseRegions = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await warehouseRegionService.getAll(params)
    warehouseRegions.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a régiók betöltésekor:', error)
    toastService.error('Hiba történt a régiók betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const deleteWarehouseRegion = async (id: number) => {
  try {
    await warehouseRegionService.delete(id)
    toastService.success('A telephely régió sikeresen törölve lett!')
    await fetchWarehouseRegions({ page: Number(pagination.value.current_page) })
  } catch (error) {
    console.error('Hiba a régió törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editWarehouseRegion = (id: number) => {
  router.push(`/admin/stock/warehouse-region/${id}/edit`)
}

onMounted(() => {
  fetchWarehouseRegions({ page: 1, sort: 'name', direction: 'asc' })
})
</script>

<template>
  <AdminLayout pageTitle="Raktárrégiók">
    <DataTable
      :columns="columns"
      :data="warehouseRegions"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés név vagy leírás alapján..."
      default-sort="name"
      default-direction="asc"
      @fetch="fetchWarehouseRegions"
    >
      <template #actions>
        <CreateButton to="/admin/stock/warehouse-region/create">
          Új régió
        </CreateButton>
      </template>

      <template #cell-warehouse="slotProps">
        {{ (slotProps.row as WarehouseRegion).warehouse?.name ?? '-' }}
      </template>

      <template #cell-is_primary="slotProps">
        <span
          v-if="(slotProps.row as WarehouseRegion).is_primary"
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

      <template #row-actions="slotProps">
        <EditButton @click="editWarehouseRegion((slotProps.row as WarehouseRegion).id!)" />
        <DeleteButton @confirm="deleteWarehouseRegion((slotProps.row as WarehouseRegion).id!)" />
      </template>

      <template #empty>
        Nincs megjeleníthető régió.
      </template>
    </DataTable>
  </AdminLayout>
</template>


