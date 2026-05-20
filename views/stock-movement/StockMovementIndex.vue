<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import CreateButton from '@admin/components/ui/button/CreateButton.vue'
import DeleteButton from '@admin/components/ui/button/DeleteButton.vue'
import EditButton from '@admin/components/ui/button/EditButton.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import {
  stockMovementService,
  type StockMovement,
} from '@stock/services/stockMovementService'

const router = useRouter()
const movements = ref<StockMovement[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const typeLabels: Record<string, string> = {
  in: 'Bejövő',
  out: 'Kimenő',
  transfer: 'Áthelyezés',
}

const columns: Column<StockMovement>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'type_label', label: 'Típus', sortable: false, width: '120px' },
  { key: 'warehouse', label: 'Raktár', sortable: false },
  { key: 'description', label: 'Leírás', sortable: false },
  { key: 'items_count', label: 'Tételek', sortable: false, width: '80px' },
  { key: 'is_closed', label: 'Állapot', sortable: false, width: '120px' },
  { key: 'created_at', label: 'Létrehozva', sortable: true, width: '170px' },
]

const fetchMovements = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await stockMovementService.getAll(params)
    movements.value = response.data.data
    pagination.value = response.data.meta
  } catch {
    toastService.error('Hiba történt a készletmozgások betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const deleteMovement = async (id: number) => {
  try {
    await stockMovementService.delete(id)
    toastService.success('A készletmozgás sikeresen törölve lett!')
    await fetchMovements({ page: Number(pagination.value.current_page) })
  } catch (error: any) {
    const msg = error.response?.data?.message ?? 'Hiba történt a törlés során.'
    toastService.error(msg)
  }
}

const editMovement = (id: number) => {
  router.push(`/admin/stock/movement/${id}/edit`)
}

onMounted(() => {
  fetchMovements({ page: 1 })
})
</script>

<template>
  <AdminLayout pageTitle="Készletmozgások">
    <DataTable
      :columns="columns"
      :data="movements"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés leírás alapján..."
      @fetch="fetchMovements"
    >
      <template #actions>
        <CreateButton to="/admin/stock/movement/create">
          Új mozgás
        </CreateButton>
      </template>

      <template #cell-type_label="{ row }">
        <span
          :class="{
            'bg-green-100 text-green-800': (row as StockMovement).type === 'in',
            'bg-red-100 text-red-800': (row as StockMovement).type === 'out',
            'bg-blue-100 text-blue-800': (row as StockMovement).type === 'transfer',
          }"
          class="rounded px-2 py-1 text-xs font-medium"
        >
          {{ typeLabels[(row as StockMovement).type] ?? (row as StockMovement).type }}
        </span>
      </template>

      <template #cell-warehouse="{ row }">
        {{ (row as StockMovement).warehouse?.name ?? '-' }}
      </template>

      <template #cell-is_closed="{ row }">
        <span
          v-if="(row as StockMovement).is_closed"
          class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
        >
          Végrehajtva
        </span>
        <span
          v-else
          class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
        >
          Vázlat
        </span>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editMovement((row as StockMovement).id!)" />
        <DeleteButton
          v-if="!(row as StockMovement).is_closed"
          @confirm="deleteMovement((row as StockMovement).id!)"
        />
      </template>

      <template #empty>
        Nincs megjeleníthető készletmozgás.
      </template>
    </DataTable>
  </AdminLayout>
</template>


