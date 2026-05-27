<script setup lang="ts">
import Input from '@admin/components/ui/Input.vue'
import InputError from '@admin/components/ui/InputError.vue'
import Label from '@admin/components/ui/Label.vue'
import { ProductSelect } from '@product'
import type { InventoryItem } from '@stock/services/inventoryService'

const props = defineProps<{
  items: InventoryItem[]
  errors: Record<string, string[]>
  readOnly: boolean
}>()

const emit = defineEmits<{
  (e: 'update:items', value: InventoryItem[]): void
}>()

function updateNewQuantity(index: number, quantity: number): void {
  const updatedItems = [...props.items]
  updatedItems[index] = {
    ...updatedItems[index],
    new_quantity: Number.isFinite(quantity) ? quantity : 0,
  }

  emit('update:items', updatedItems)
}

function updateProduct(index: number, productId: number | null): void {
  const updatedItems = [...props.items]

  updatedItems[index] = {
    ...updatedItems[index],
    product_id: productId,
  }

  emit('update:items', updatedItems)
}

function addItem(): void {
  emit('update:items', [
    ...props.items,
    {
      product_id: null,
      old_quantity: 0,
      new_quantity: 0,
    },
  ])
}

function removeItem(index: number): void {
  const updatedItems = [...props.items]
  updatedItems.splice(index, 1)

  emit('update:items', updatedItems)
}

function itemError(index: number, field: string): string[] | undefined {
  return props.errors[`items.${index}.${field}`]
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <Label>Tételek *</Label>

      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        :disabled="readOnly"
        @click="addItem"
      >
        + Tétel hozzáadása
      </button>
    </div>

    <div v-if="items.length === 0" class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      Adj hozzá legalább egy tételt.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="item.id ?? `new-${index}`"
        class="space-y-4 rounded-md border bg-muted/30 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-medium text-muted-foreground">{{ index + 1 }}. tétel</span>

          <button
            v-if="!item.id && !readOnly"
            type="button"
            class="text-xs text-destructive hover:underline"
            @click="removeItem(index)"
          >
            Törlés
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="space-y-1">
            <Label :for="`inventory-product-${item.id ?? index}`">Termék *</Label>
            <ProductSelect
              :id="`inventory-product-${item.id ?? index}`"
              :model-value="item.product_id"
              :disabled="readOnly || Boolean(item.id)"
              placeholder="Válassz terméket"
              search-placeholder="Keresés cikkszámra vagy névre..."
              @update:model-value="updateProduct(index, $event)"
            />
            <InputError :message="itemError(index, 'product_id')" />
          </div>

          <div class="space-y-1">
            <Label :for="`inventory-old-${item.id ?? index}`">Régi készlet</Label>
            <Input :id="`inventory-old-${item.id ?? index}`" :model-value="item.old_quantity" type="number" step="1" disabled />
          </div>

          <div class="space-y-1">
            <Label :for="`inventory-new-${item.id ?? index}`">Új készlet</Label>
            <Input
              :id="`inventory-new-${item.id ?? index}`"
              :model-value="item.new_quantity"
              type="number"
              step="1"
              min="0"
              :disabled="readOnly"
              @update:model-value="updateNewQuantity(index, Number($event))"
            />
            <InputError :message="itemError(index, 'new_quantity')" />
          </div>
        </div>
      </div>
    </div>

    <InputError :message="errors.items" />
  </div>
</template>



