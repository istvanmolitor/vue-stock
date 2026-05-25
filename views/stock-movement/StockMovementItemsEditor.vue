<script setup lang="ts">
import { computed } from 'vue'
import InputError from '@admin/components/ui/InputError.vue'
import Input from '@admin/components/ui/Input.vue'
import Label from '@admin/components/ui/Label.vue'
import { ProductSelect } from '@product'
import WarehouseRegionSelect from '@stock/components/WarehouseRegionSelect.vue'
import type {
  ProductOption,
  StockMovementType,
  WarehouseRegionOption,
} from '@stock/services/stockMovementService'

interface StockMovementItemFormData {
  warehouse_region_id: number | null
  destination_warehouse_region_id?: number | null
  product_id: number | null
  quantity: number
}

const props = defineProps<{
  items: StockMovementItemFormData[]
  movementType: StockMovementType
  warehouseRegions: WarehouseRegionOption[]
  products: ProductOption[]
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'update:items', value: StockMovementItemFormData[]): void
}>()

const isTransfer = computed(() => props.movementType === 'transfer')

const warehouseRegionOptions = computed(() =>
  props.warehouseRegions,
)

function destinationOptions(excludeId: number | null) {
  return props.warehouseRegions
    .filter((r) => r.id !== Number(excludeId))
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function addItem() {
  emit('update:items', [
    ...props.items,
    { warehouse_region_id: null, destination_warehouse_region_id: null, product_id: null, quantity: 1 },
  ])
}

function removeItem(index: number) {
  const updated = [...props.items]
  updated.splice(index, 1)
  emit('update:items', updated)
}

function updateItem(index: number, field: keyof StockMovementItemFormData, value: unknown) {
  const updated = [...props.items]

  const currentItem = { ...updated[index], [field]: value }

  if (
    field === 'warehouse_region_id'
    && currentItem.destination_warehouse_region_id !== undefined
    && currentItem.destination_warehouse_region_id === currentItem.warehouse_region_id
  ) {
    currentItem.destination_warehouse_region_id = null
  }

  updated[index] = currentItem
  emit('update:items', updated)
}

function itemError(index: number, field: string): string[] | undefined {
  return props.errors[`items.${index}.${field}`]
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <Label>Tételek *</Label>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        @click="addItem"
      >
        + Tétel hozzáadása
      </button>
    </div>

    <div v-if="items.length === 0" class="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
      Adj hozzá legalább egy tételt.
    </div>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="rounded-md border bg-muted/30 p-4 space-y-3"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">{{ index + 1 }}. tétel</span>
        <button
          v-if="items.length > 1"
          type="button"
          class="text-xs text-destructive hover:underline"
          @click="removeItem(index)"
        >
          Törlés
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="space-y-1">
          <Label :for="`item-region-${index}`">Forrás régió *</Label>
          <WarehouseRegionSelect
            :id="`item-region-${index}`"
            :model-value="item.warehouse_region_id"
            :options="warehouseRegionOptions"
            placeholder="Válassz forrás régiót"
            search-placeholder="Keresés régióra vagy raktárra..."
            @update:model-value="updateItem(index, 'warehouse_region_id', toNullableNumber($event))"
          />
          <InputError :message="itemError(index, 'warehouse_region_id')" />
        </div>

        <div v-if="isTransfer" class="space-y-1">
          <Label :for="`item-dest-${index}`">Cél régió *</Label>
          <WarehouseRegionSelect
            :id="`item-dest-${index}`"
            :model-value="item.destination_warehouse_region_id"
            :options="destinationOptions(item.warehouse_region_id)"
            placeholder="Válassz cél régiót"
            search-placeholder="Keresés régióra vagy raktárra..."
            @update:model-value="updateItem(index, 'destination_warehouse_region_id', toNullableNumber($event))"
          />
          <InputError :message="itemError(index, 'destination_warehouse_region_id')" />
        </div>

        <div class="space-y-1">
          <Label :for="`item-product-${index}`">Termék *</Label>
          <ProductSelect
            :id="`item-product-${index}`"
            :model-value="item.product_id"
            :options="products"
            placeholder="Válassz terméket"
            @update:model-value="updateItem(index, 'product_id', $event)"
          />
          <InputError :message="itemError(index, 'product_id')" />
        </div>

        <div class="space-y-1">
          <Label :for="`item-qty-${index}`">Mennyiség *</Label>
          <Input
            :id="`item-qty-${index}`"
            :model-value="item.quantity"
            type="number"
            min="0.001"
            step="any"
            @update:model-value="updateItem(index, 'quantity', Number($event))"
          />
          <InputError :message="itemError(index, 'quantity')" />
        </div>
      </div>
    </div>

    <InputError :message="errors['items']" />
  </div>
</template>
