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
  LoadingSpinner,
  Tabs,
  toastService,
} from '@admin'
import { createApiClient } from '@user/services/apiClient'
import StockProductRegionLimitBox from '@stock/components/StockProductRegionLimitManager.vue'
import StockProductRegionSummaryBox from '@stock/components/StockProductRegionSummaryBox.vue'

interface StockProductRegionQuantity {
  warehouse_region_id: number
  warehouse_region_name: string
  warehouse_name?: string | null
  label: string
  quantity: number
  min_quantity?: number | null
  max_quantity?: number | null
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
const activeTab = ref<'region_limits' | 'region_summary'>('region_summary')
const tabItems = [
  { key: 'region_summary', label: 'Régiók összesítve' },
  { key: 'region_limits', label: 'Régió limit beállítások' },
]

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
      </div>

      <template v-if="isLoading">
        <div class="flex justify-center py-10">
          <LoadingSpinner label="Betöltés..." />
        </div>
      </template>

      <template v-else-if="product">
        <Tabs
          v-model="activeTab"
          :items="tabItems"
        >
          <template #default="{ activeKey }">
            <StockProductRegionLimitBox
              v-if="activeKey === 'region_limits'"
              :product-id="productId"
            />

            <StockProductRegionSummaryBox
              v-else
              :product-id="productId"
            />
          </template>
        </Tabs>
      </template>

      <Card v-else>
        <CardContent class="pt-6 text-sm text-muted-foreground">
          A termék készlete nem található.
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
</template>



