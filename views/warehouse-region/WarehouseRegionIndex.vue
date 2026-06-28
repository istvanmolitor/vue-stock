<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { warehouseRegionService, type WarehouseRegion } from '@stock/services/warehouseRegionService'

const router = useRouter()
const table = ref()

const deleteWarehouseRegion = async (id: number) => {
  try {
    await warehouseRegionService.delete(id)
    toastService.success('A telephely régió sikeresen törölve lett!')
    table.value?.refresh()
  } catch (error) {
    console.error('Hiba a régió törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editWarehouseRegion = (id: number) => {
  router.push(`/admin/stock/warehouse-region/${id}/edit`)
}
</script>

<template>
  <AdminLayout pageTitle="Raktárrégiók">
    <DataTable
      ref="table"
      url="/api/admin/stock/warehouse-regions"
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
