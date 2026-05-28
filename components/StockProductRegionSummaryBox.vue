<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, LoadingSpinner, toastService } from '@admin'
import { createApiClient } from '@user/services/apiClient'

interface StockProductRegionQuantity {
  warehouse_region_id: number
  warehouse_region_name: string
  warehouse_name?: string | null
  quantity: number
}

interface StockProductDetail {
  regions: StockProductRegionQuantity[]
}

const props = defineProps<{
  productId: number | string
}>()

const api = createApiClient()

const isLoading = ref(false)
const loadError = ref<string | null>(null)
const regions = ref<StockProductRegionQuantity[]>([])

const normalizedProductId = computed(() => Number(props.productId))

const formatQuantity = (quantity: number): string => Number(quantity).toFixed(2)

const fetchProductRegions = async (): Promise<void> => {
  const productId = normalizedProductId.value

  if (!Number.isFinite(productId) || productId <= 0) {
    loadError.value = 'Érvénytelen termék azonosító.'
    regions.value = []
    return
  }

  try {
    isLoading.value = true
    loadError.value = null

    const response = await api.get<{ data: StockProductDetail }>(`/api/admin/stock/products/${productId}`)
    regions.value = response.data.data.regions
  } catch (error) {
    console.error('Hiba a termék régió összesítésének betöltésekor:', error)
    loadError.value = 'Hiba történt a régió összesítés betöltésekor.'
    regions.value = []
    toastService.error('Hiba történt a régió összesítés betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

watch(normalizedProductId, fetchProductRegions, { immediate: true })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Régiók összesítve</CardTitle>
      <CardDescription>
        Teljes bontás raktár és raktár régió szerint.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div
        v-if="isLoading"
        class="text-sm text-muted-foreground"
      >
        <LoadingSpinner label="Betöltés..." />
      </div>

      <div
        v-else-if="loadError !== null"
        class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        {{ loadError }}
      </div>

      <div
        v-else-if="regions.length > 0"
        class="overflow-x-auto rounded-lg border"
      >
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
              v-for="region in regions"
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

      <div
        v-else
        class="text-sm text-muted-foreground"
      >
        Nincs megjeleníthető régió összesítés.
      </div>
    </CardContent>
  </Card>
</template>

