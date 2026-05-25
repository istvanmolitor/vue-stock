<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import Button from '@admin/components/ui/button/Button.vue'
import Icon from '@admin/components/ui/Icon.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { stockProductService, type StockProduct } from '@stock/services/stockProductService'

const router = useRouter()
const products = ref<StockProduct[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const columns: Column<StockProduct>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'total_quantity', label: 'Összes készlet', sortable: false, width: '140px' },
  { key: 'region_quantities', label: 'Készlet régiónként', sortable: false },
]

const fetchProducts = async (params: { search?: string; sort?: string; direction?: 'asc' | 'desc'; page?: number }) => {
  try {
    isLoading.value = true
    const response = await stockProductService.getAll(params)
    products.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a készletlista betöltésekor:', error)
    toastService.error('Hiba történt a készletlista betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const viewProductStock = (id: number) => {
  router.push(`/admin/stock/products/${id}`)
}

onMounted(() => {
  fetchProducts({ page: 1, sort: 'sku', direction: 'asc' })
})
</script>

<template>
  <AdminLayout pageTitle="Termék készlet">
    <DataTable
      :columns="columns"
      :data="products"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés SKU alapján..."
      default-sort="sku"
      default-direction="asc"
      @fetch="fetchProducts"
    >
      <template #cell-total_quantity="{ row }">
        {{ Number((row as StockProduct).total_quantity).toFixed(2) }}
      </template>

      <template #cell-region_quantities="{ row }">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="region in (row as StockProduct).region_quantities"
            :key="region.warehouse_region_id"
            class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
          >
            {{ region.label }}: {{ Number(region.quantity).toFixed(2) }}
          </span>
        </div>
      </template>

      <template #empty>
        Nincs megjeleníthető készlet.
      </template>

      <template #row-actions="{ row }">
        <Button
          variant="outline"
          size="sm"
          @click="viewProductStock((row as StockProduct).id)"
        >
          <Icon name="eye" class="h-4 w-4" />
          Megtekintés
        </Button>
      </template>
    </DataTable>
  </AdminLayout>
</template>


