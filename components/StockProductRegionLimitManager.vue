<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, toastService, LoadingSpinner } from '@admin'
import { createApiClient } from '@user/services/apiClient'

interface StockProductRegionQuantity {
  warehouse_region_id: number
  warehouse_region_name: string
  warehouse_name?: string | null
  label: string
  quantity: number
  min_quantity?: number | null
  max_quantity?: number | null
  has_limits?: boolean
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
const visibleRegionIds = ref<Record<number, boolean>>({})
const selectedRegionToAdd = ref('')

const normalizedProductId = computed(() => Number(props.productId))
const regionsAvailableForSelection = computed(() => {
  if (product.value === null) {
    return [] as StockProductRegionQuantity[]
  }

  return product.value.regions.filter((region) => visibleRegionIds.value[region.warehouse_region_id] !== true)
})

const warehousesWithVisibleRegions = computed(() => {
  if (product.value === null) {
    return [] as Array<StockProductWarehouse & { visible_regions: StockProductRegionQuantity[] }>
  }

  return product.value.warehouses
    .map((warehouse) => ({
      ...warehouse,
      visible_regions: warehouse.regions.filter((region) => visibleRegionIds.value[region.warehouse_region_id] === true),
    }))
    .filter((warehouse) => warehouse.visible_regions.length > 0)
})

const formatQuantity = (quantity: number): string => Number(quantity).toFixed(2)

const formatLimitInput = (quantity?: number | null): string => {
  if (quantity === null || quantity === undefined) {
    return ''
  }

  return String(quantity)
}

const initializeRegionLimitForms = (stockProduct: StockProductDetail): void => {
  const forms: Record<number, RegionLimitFormState> = {}
  const visibleRegions: Record<number, boolean> = {}

  stockProduct.regions.forEach((region) => {
    forms[region.warehouse_region_id] = {
      min_quantity: formatLimitInput(region.min_quantity),
      max_quantity: formatLimitInput(region.max_quantity),
      isSaving: false,
      errors: [],
    }

    visibleRegions[region.warehouse_region_id] = region.has_limits === true
  })

  regionLimitForms.value = forms
  visibleRegionIds.value = visibleRegions
  selectedRegionToAdd.value = ''
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

  const hasLimits = updatedRegion.min_quantity !== null || updatedRegion.max_quantity !== null

  product.value.warehouses.forEach((warehouse) => {
    const region = warehouse.regions.find((warehouseRegion) => warehouseRegion.warehouse_region_id === updatedRegion.warehouse_region_id)
    if (region !== undefined) {
      region.min_quantity = updatedRegion.min_quantity ?? null
      region.max_quantity = updatedRegion.max_quantity ?? null
      region.has_limits = hasLimits
    }
  })

  const flatRegion = product.value.regions.find((warehouseRegion) => warehouseRegion.warehouse_region_id === updatedRegion.warehouse_region_id)
  if (flatRegion !== undefined) {
    flatRegion.min_quantity = updatedRegion.min_quantity ?? null
    flatRegion.max_quantity = updatedRegion.max_quantity ?? null
    flatRegion.has_limits = hasLimits
  }
}

const addRegion = (): void => {
  const selectedRegionId = Number(selectedRegionToAdd.value)
  if (!Number.isFinite(selectedRegionId) || selectedRegionId <= 0) {
    return
  }

  if (regionLimitForms.value[selectedRegionId] === undefined) {
    regionLimitForms.value[selectedRegionId] = {
      min_quantity: '',
      max_quantity: '',
      isSaving: false,
      errors: [],
    }
  }

  visibleRegionIds.value[selectedRegionId] = true
  selectedRegionToAdd.value = ''
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
    visibleRegionIds.value[region.warehouse_region_id] = true

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

const deleteRegionLimits = async (region: StockProductRegionQuantity): Promise<void> => {
  const regionForm = regionLimitForms.value[region.warehouse_region_id]
  if (regionForm === undefined) {
    return
  }

  if (region.has_limits !== true) {
    regionForm.min_quantity = ''
    regionForm.max_quantity = ''
    regionForm.errors = []
    visibleRegionIds.value[region.warehouse_region_id] = false

    return
  }

  try {
    regionForm.isSaving = true
    regionForm.errors = []

    const response = await api.delete<{ data: StockProductRegionQuantity }>(
      `/api/admin/stock/products/${normalizedProductId.value}/regions/${region.warehouse_region_id}/limits`,
    )

    applyUpdatedRegionData(response.data.data)
    regionForm.min_quantity = ''
    regionForm.max_quantity = ''
    visibleRegionIds.value[region.warehouse_region_id] = false

    toastService.success(`${region.warehouse_region_name} limitek torolve.`)
  } catch (error) {
    console.error('Hiba a regiolimit torlese kozben:', error)
    toastService.error('Hiba történt a régió limitek törlésekor.')
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
      ><LoadingSpinner label="Betöltés..." /></div>

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
        <div class="rounded-lg border bg-muted/30 p-4">
          <div class="mb-2 text-sm font-medium">Régió hozzáadása</div>
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              v-model="selectedRegionToAdd"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm md:max-w-md"
            >
              <option value="">Válassz régiót...</option>
              <option
                v-for="region in regionsAvailableForSelection"
                :key="region.warehouse_region_id"
                :value="String(region.warehouse_region_id)"
              >
                {{ region.warehouse_name ?? '-' }} - {{ region.warehouse_region_name }}
              </option>
            </select>
            <Button
              variant="outline"
              size="sm"
              :disabled="selectedRegionToAdd === ''"
              @click="addRegion"
            >
              Régió hozzáadása
            </Button>
          </div>
        </div>

        <div
          v-for="warehouse in warehousesWithVisibleRegions"
          :key="warehouse.warehouse_id"
          class="overflow-hidden rounded-lg border"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-3">
            <div>
              <div class="font-medium">{{ warehouse.warehouse_name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ warehouse.visible_regions.length }} régió
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
            v-for="region in warehouse.visible_regions"
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
            <div class="flex items-center justify-end gap-2">
              <Button
                class="h-8"
                :disabled="regionLimitForms[region.warehouse_region_id].isSaving"
                @click="saveRegionLimits(region)"
              >
                {{ regionLimitForms[region.warehouse_region_id].isSaving ? 'Mentés...' : 'Mentés' }}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                class="h-8"
                :disabled="regionLimitForms[region.warehouse_region_id].isSaving"
                @click="deleteRegionLimits(region)"
              >
                Törlés
              </Button>
            </div>
            <div
              v-if="regionLimitForms[region.warehouse_region_id].errors.length > 0"
              class="text-xs text-destructive md:col-span-5"
            >
              {{ regionLimitForms[region.warehouse_region_id].errors.join(' ') }}
            </div>
          </div>
        </div>

        <div
          v-if="warehousesWithVisibleRegions.length === 0"
          class="text-sm text-muted-foreground"
        >
          Jelenleg nincs beállított minimum/maximum érték. Adj hozzá egy régiót a kezdéshez.
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

