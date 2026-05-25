<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AdminLayout,
  BackButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toastService,
} from '@admin'
import { createApiClient } from '@user/services/apiClient'

interface StockProductRegionQuantity {
  warehouse_region_id: number
  warehouse_region_name: string
  warehouse_name?: string | null
  label: string
  quantity: number
}

interface StockProductWarehouse {
  warehouse_id: number
  warehouse_name: string
  total_quantity: number
  regions: StockProductRegionQuantity[]
}

interface StockProductDetail {
  id: number
  sku: string
  total_quantity: number
  warehouse_count: number
  region_count: number
  warehouses: StockProductWarehouse[]
  regions: StockProductRegionQuantity[]
}

const api = createApiClient()

const route = useRoute()
const router = useRouter()

const product = ref<StockProductDetail | null>(null)
const isLoading = ref(false)

const productId = computed(() => Number(route.params.id))
const pageTitle = computed(() => {
  if (product.value !== null) {
    return `Termék készlet: ${product.value.sku}`
  }

  return 'Termék készlet részletek'
})

const formatQuantity = (quantity: number) => Number(quantity).toFixed(2)

const fetchProduct = async () => {
  if (!Number.isFinite(productId.value) || productId.value <= 0) {
    toastService.error('Érvénytelen termék azonosító.')
    router.push('/admin/stock/products')
    return
  }

  try {
    isLoading.value = true
    const response = await api.get<{ data: StockProductDetail }>(`/api/admin/stock/products/${productId.value}`)
    product.value = response.data.data
  } catch (error) {
    console.error('Hiba a termék készletének betöltésekor:', error)
    toastService.error('Hiba történt a termék készletének betöltésekor.')
    router.push('/admin/stock/products')
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, fetchProduct)

onMounted(() => {
  fetchProduct()
})
</script>

<template>
  <AdminLayout :page-title="pageTitle">
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <BackButton to="/admin/stock/products" />
        <div
          v-if="product"
          class="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          SKU: <span class="font-medium text-foreground">{{ product.sku }}</span>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Összes készlet</CardDescription>
            <CardTitle class="text-3xl">{{ product ? formatQuantity(product.total_quantity) : '—' }}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Raktárak száma</CardDescription>
            <CardTitle class="text-3xl">{{ product ? product.warehouse_count : '—' }}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Régiók száma</CardDescription>
            <CardTitle class="text-3xl">{{ product ? product.region_count : '—' }}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <template v-if="isLoading">
        <Card>
          <CardContent class="pt-6 text-sm text-muted-foreground">
            Betöltés...
          </CardContent>
        </Card>
      </template>

      <template v-else-if="product">
        <div class="grid gap-4 xl:grid-cols-2">
          <Card
            v-for="warehouse in product.warehouses"
            :key="warehouse.warehouse_id"
          >
            <CardHeader class="gap-3 md:flex-row md:items-start md:justify-between md:space-y-0">
              <div class="space-y-1">
                <CardTitle>{{ warehouse.warehouse_name }}</CardTitle>
                <CardDescription>
                  {{ warehouse.regions.length }} régió
                </CardDescription>
              </div>
              <div class="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Raktár készlet:
                <span class="font-medium text-foreground">{{ formatQuantity(warehouse.total_quantity) }}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div class="overflow-hidden rounded-lg border">
                <div class="grid grid-cols-[1fr_auto] bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Raktár régió</span>
                  <span>Készlet</span>
                </div>
                <div
                  v-for="region in warehouse.regions"
                  :key="region.warehouse_region_id"
                  class="grid grid-cols-[1fr_auto] items-center border-t px-4 py-3 text-sm"
                >
                  <span>{{ region.warehouse_region_name }}</span>
                  <span class="font-medium">{{ formatQuantity(region.quantity) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Régiók összesítve</CardTitle>
            <CardDescription>
              Teljes bontás raktár és raktár régió szerint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto rounded-lg border">
              <table class="w-full text-sm">
                <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th class="px-4 py-3 font-medium">Raktár</th>
                    <th class="px-4 py-3 font-medium">Régió</th>
                    <th class="px-4 py-3 text-right font-medium">Készlet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="region in product.regions"
                    :key="region.warehouse_region_id"
                    class="border-t"
                  >
                    <td class="px-4 py-3">{{ region.warehouse_name ?? '-' }}</td>
                    <td class="px-4 py-3">{{ region.warehouse_region_name }}</td>
                    <td class="px-4 py-3 text-right font-medium">{{ formatQuantity(region.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </template>

      <Card v-else>
        <CardContent class="pt-6 text-sm text-muted-foreground">
          A termék készlete nem található.
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>



