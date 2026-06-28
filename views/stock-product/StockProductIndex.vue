<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, toastService } from '@admin'
import ShowButton from '@admin/components/ui/button/ShowButton.vue'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { type StockProduct } from '@stock/services/stockProductService'

const router = useRouter()
const table = ref()

const formatTotalQuantity = (product: StockProduct): string => {
  const quantity = Number(product.total_quantity).toFixed(2)

  return product.quantity_unit ? `${quantity} ${product.quantity_unit}` : quantity
}

const getMainImageUrl = (row: unknown): string | null => {
  const imageUrl = (row as { main_image_url?: string | null }).main_image_url

  return imageUrl ?? null
}

const viewProductStock = (id: number) => {
  router.push(`/admin/stock/products/${id}`)
}
</script>

<template>
  <AdminLayout pageTitle="Termék készlet">
    <DataTable
      ref="table"
      url="/api/admin/stock/products"
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
