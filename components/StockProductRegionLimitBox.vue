<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, toastService } from '@admin'
import { createApiClient } from '@user/services/apiClient'

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

interface RegionLimitFormState {
  min_quantity: string
  max_quantity: string
  isSaving: boolean
  errors: string[]
}

const props = defineProps<{
  productId: number | string
}>()

const api = createApiClient()

const product = ref<StockProductDetail | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const regionLimitForms = ref<Record<number, RegionLimitFormState>>({})

const normalizedProductId = computed(() => Number(props.productId))

const formatQuantity = (quantity: number): string => Number(quantity).toFixed(2)

const formatLimitInput = (quantity?: number | null): string => {
  if (quantity === null || quantity === undefined) {
    return ''
  }

  return String(quantity)
}

const initializeRegionLimitForms = (stockProduct: StockProductDetail): void => {
  const forms: Record<number, RegionLimitFormState> = {}

  stockProduct.regions.forEach((region) => {
    forms[region.warehouse_region_id] = {
      min_quantity: formatLimitInput(region.min_quantity),
      max_quantity: formatLimitInput(region.max_quantity),
      isSaving: false,
      errors: [],
    }
  })

  regionLimitForms.value = forms
}

const parseLimitValue = (value: string): number | null => {
  const trimmedValue = value.trim()

  if (trimmedValue === '') {
    return null
  }

  const numericValue = Number(trimmedValue)
  if (!Number.isFinite(numericValue)) {
    throw new Error('invalid-number')
  }

  return numericValue
}

const applyUpdatedRegionData = (updatedRegion: StockProductRegionQuantity): void => {
  if (product.value === null) {
    return
  }

  product.value.warehouses.forEach((warehouse) => {
    const region = warehouse.regions.find((warehouseRegion) => warehouseRegion.warehouse_region_id === updatedRegion.warehouse_region_id)
    if (region !== undefined) {
      region.min_quantity = updatedRegion.min_quantity ?? null
      region.max_quantity = updatedRegion.max_quantity ?? null
    }
  })

  const flatRegion = product.value.regions.find((warehouseRegion) => warehouseRegion.warehouse_region_id === updatedRegion.warehouse_region_id)
  if (flatRegion !== undefined) {
    flatRegion.min_quantity = updatedRegion.min_quantity ?? null
    flatRegion.max_quantity = updatedRegion.max_quantity ?? null
  }
}

const saveRegionLimits = async (region: StockProductRegionQuantity): Promise<void> => {
  if (product.value === null) {
    return
  }

  const regionForm = regionLimitForms.value[region.warehouse_region_id]
  if (regionForm === undefined) {
    return
  }

  try {
    regionForm.isSaving = true
    regionForm.errors = []

    const response = await api.put<{ data: StockProductRegionQuantity }>(
      `/api/admin/stock/products/${product.value.id}/regions/${region.warehouse_region_id}`,
      {
        min_quantity: parseLimitValue(regionForm.min_quantity),
        max_quantity: parseLimitValue(regionForm.max_quantity),
      },
    )

    const updatedRegion = response.data.data

    applyUpdatedRegionData(updatedRegion)
    regionForm.min_quantity = formatLimitInput(updatedRegion.min_quantity)
    regionForm.max_quantity = formatLimitInput(updatedRegion.max_quantity)

    toastService.success(`${region.warehouse_region_name} limitek mentve.`)
  } catch (error: any) {
    console.error('Hiba a regiolimit mentese kozben:', error)

    if (error.response?.status === 422) {
      const backendErrors = error.response.data?.errors ?? {}
      regionForm.errors = [
        ...(backendErrors.min_quantity ?? []),
        ...(backendErrors.max_quantity ?? []),
      ]
      toastService.error('Kérjük, javítsd a minimum/maximum értékeket.')
    } else if ((error as Error).message === 'invalid-number') {
      regionForm.errors = ['A minimum és maximum érték szám legyen.']
      toastService.error('A minimum és maximum érték szám legyen.')
    } else {
      toastService.error('Hiba történt a régió limitek mentésekor.')
    }
  } finally {
    regionForm.isSaving = false
  }
}

const fetchProduct = async (): Promise<void> => {
  const productId = normalizedProductId.value

  if (!Number.isFinite(productId) || productId <= 0) {
    loadError.value = 'Érvénytelen termék azonosító.'
    product.value = null
    return
  }

  try {
    isLoading.value = true
    loadError.value = null

    const response = await api.get<{ data: StockProductDetail }>(`/api/admin/stock/products/${productId}`)
    product.value = response.data.data
    initializeRegionLimitForms(response.data.data)
  } catch (error) {
    console.error('Hiba a termék régiós limiteinek betöltésekor:', error)
    loadError.value = 'Hiba történt a régiós limitek betöltésekor.'
    product.value = null
    toastService.error('Hiba történt a régiós limitek betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

watch(normalizedProductId, fetchProduct, { immediate: true })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Régiós minimum és maximum készlet</CardTitle>
      <CardDescription>
        A termék régiónkénti min/max készletértékei itt állíthatók.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div
        v-if="isLoading"
        class="text-sm text-muted-foreground"
      >
        Betöltés...
      </div>

      <div
        v-else-if="loadError !== null"
        class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        {{ loadError }}
      </div>

      <div
        v-else-if="product"
        class="space-y-4"
      >
        <div
          v-for="warehouse in product.warehouses"
          :key="warehouse.warehouse_id"
          class="overflow-hidden rounded-lg border"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-3">
            <div>
              <div class="font-medium">{{ warehouse.warehouse_name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ warehouse.regions.length }} régió
              </div>
            </div>
            <div class="text-sm text-muted-foreground">
              Raktár készlet:
              <span class="font-medium text-foreground">{{ formatQuantity(warehouse.total_quantity) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
            <span>Raktár régió</span>
            <span>Készlet</span>
            <span>Min</span>
            <span>Max</span>
            <span class="text-right">Művelet</span>
          </div>

          <div
            v-for="region in warehouse.regions"
            :key="region.warehouse_region_id"
            class="grid grid-cols-1 gap-3 border-t px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center"
          >
            <span>{{ region.warehouse_region_name }}</span>
            <span class="font-medium">{{ formatQuantity(region.quantity) }}</span>
            <Input
              v-model="regionLimitForms[region.warehouse_region_id].min_quantity"
              placeholder="Min"
              class="h-8"
            />
            <Input
              v-model="regionLimitForms[region.warehouse_region_id].max_quantity"
              placeholder="Max"
              class="h-8"
            />
            <Button
              class="h-8"
              :disabled="regionLimitForms[region.warehouse_region_id].isSaving"
              @click="saveRegionLimits(region)"
            >
              {{ regionLimitForms[region.warehouse_region_id].isSaving ? 'Mentés...' : 'Mentés' }}
            </Button>
            <div
              v-if="regionLimitForms[region.warehouse_region_id].errors.length > 0"
              class="text-xs text-destructive md:col-span-5"
            >
              {{ regionLimitForms[region.warehouse_region_id].errors.join(' ') }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-sm text-muted-foreground"
      >
        Nincs megjeleníthető régiós limit adat.
      </div>
    </CardContent>
  </Card>
</template>


