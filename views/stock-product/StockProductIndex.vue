<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import ShowButton from '@admin/components/ui/button/ShowButton.vue'
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
  { key: 'main_image_url', label: 'Kép', sortable: false, width: '84px' },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'total_quantity', label: 'Összesített készlet', sortable: false, width: '180px' },
]

const formatTotalQuantity = (product: StockProduct): string => {
  const quantity = Number(product.total_quantity).toFixed(2)

  return product.quantity_unit ? `${quantity} ${product.quantity_unit}` : quantity
}

const getMainImageUrl = (row: unknown): string | null => {
  const imageUrl = (row as { main_image_url?: string | null }).main_image_url

  return imageUrl ?? null
}

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
      <template #cell-main_image_url="{ row }">
        <div class="flex items-center">
          <img
            v-if="getMainImageUrl(row)"
            :src="getMainImageUrl(row)!"
            :alt="`Termékkép - ${(row as StockProduct).sku}`"
            class="h-10 w-10 rounded border border-gray-200 object-cover"
          >
          <div
            v-else
            class="flex h-10 w-10 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-500"
          >
            N/A
          </div>
        </div>
      </template>

      <template #cell-total_quantity="{ row }">
        {{ formatTotalQuantity(row as StockProduct) }}
      </template>

      <template #empty>
        Nincs megjeleníthető készlet.
      </template>

      <template #row-actions="{ row }">
        <ShowButton @click="viewProductStock((row as StockProduct).id)" />
      </template>
    </DataTable>
  </AdminLayout>
</template>


