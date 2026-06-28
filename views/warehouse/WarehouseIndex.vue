<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { warehouseService } from '@stock/services/warehouseService'

const router = useRouter()
const table = ref()

const deleteWarehouse = async (id: number) => {
  try {
    await warehouseService.delete(id)
    toastService.success('A raktár sikeresen törölve lett!')
    table.value?.refresh()
  } catch (error) {
    console.error('Hiba a raktár törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editWarehouse = (id: number) => {
  router.push(`/admin/stock/warehouse/${id}/edit`)
}
</script>

<template>
  <AdminLayout pageTitle="Raktárak">
    <DataTable
      ref="table"
      url="/api/admin/stock/warehouses"
    >
      <template #actions>
        <CreateButton to="/admin/stock/warehouse/create">
          Új raktár
        </CreateButton>
      </template>

      <template #cell-is_primary="{ row }">
        <span
          v-if="(row as any).is_primary"
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
        <EditButton @click="editWarehouse((row as any).id)" />
        <DeleteButton @confirm="deleteWarehouse((row as any).id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető raktár.
      </template>
    </DataTable>
  </AdminLayout>
</template>
