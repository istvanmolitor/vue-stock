<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AdminLayout, FormButtons, InputError, toastService, LoadingSpinner } from '@admin'
import BackButton from '@admin/components/ui/button/BackButton.vue'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Label from '@admin/components/ui/Label.vue'
import Textarea from '@admin/components/ui/Textarea.vue'
import {
  inventoryService,
  type Inventory,
  type InventoryItem,
  type InventoryUpdateFormData,
} from '@stock/services/inventoryService'
import InventoryItemsEditor from './InventoryItemsEditor.vue'

const router = useRouter()
const route = useRoute()

const inventoryId = Number(route.params.id)
const isLoading = ref(true)
const isSaving = ref(false)
const isClosing = ref(false)
const errors = ref<Record<string, string[]>>({})
const inventory = ref<Inventory | null>(null)

const form = reactive<{
  description: string
  items: InventoryItem[]
}>({
  description: '',
  items: [],
})

const loadInventory = async () => {
  try {
    isLoading.value = true
    const response = await inventoryService.getEditData(inventoryId)
    inventory.value = response.data.data
    form.description = response.data.data.description ?? ''
    form.items = (response.data.data.items ?? []).map((item) => ({ ...item }))
  } catch {
    toastService.error('Nem sikerült betölteni a leltár adatait.')
    router.push('/admin/stock/inventory')
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  if (!inventory.value || inventory.value.is_closed) {
    return
  }

  try {
    isSaving.value = true
    errors.value = {}

    const payload: InventoryUpdateFormData = {
      description: form.description.trim() || undefined,
      items: form.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        new_quantity: Number(item.new_quantity),
      })),
    }

    const response = await inventoryService.update(inventoryId, payload)
    inventory.value = response.data.data
    form.items = (response.data.data.items ?? []).map((item) => ({ ...item }))
    toastService.success(response.data.message)
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      toastService.error(error.response?.data?.message ?? 'Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt mentés közben.')
    }
  } finally {
    isSaving.value = false
  }
}

const handleCloseInventory = async () => {
  if (!inventory.value || inventory.value.is_closed) {
    return
  }

  try {
    isClosing.value = true
    const response = await inventoryService.close(inventoryId)
    inventory.value = response.data.data
    form.items = (response.data.data.items ?? []).map((item) => ({ ...item }))
    toastService.success(response.data.message)
  } catch (error: any) {
    toastService.error(error.response?.data?.message ?? 'Hiba történt a leltár lezárásakor.')
  } finally {
    isClosing.value = false
  }
}

onMounted(() => {
  loadInventory()
})
</script>

<template>
  <AdminLayout pageTitle="Leltár szerkesztése">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/inventory" />
    </div>

    <div v-if="isLoading" class="py-8 text-center"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else-if="inventory">
      <CardHeader>
        <CardTitle>
          Leltár #{{ inventory.id }} - {{ inventory.warehouse_region?.label ?? inventory.warehouse_region?.name }}
        </CardTitle>
        <CardDescription>
          A tételek új készlet értékei módosíthatók, új sorok is felvehetők, majd a leltár lezárásával felülírhatók a régió készletei.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="flex gap-2">
          <span
            v-if="inventory.is_closed"
            class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
          >
            Lezárva
          </span>
          <span
            v-else
            class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
          >
            Nyitott
          </span>

          <span v-if="inventory.stock_updated_at" class="text-xs text-muted-foreground">
            Készlet módosítva: {{ inventory.stock_updated_at }}
          </span>
        </div>

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Textarea id="description" v-model="form.description" :disabled="inventory.is_closed" />
          <InputError :message="errors.description" />
        </div>

        <InventoryItemsEditor
          :items="form.items"
          :errors="errors"
          :read-only="Boolean(inventory.is_closed)"
          @update:items="(value: InventoryItem[]) => (form.items = value)"
        />
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving || isClosing"
          :save-disabled="Boolean(inventory.is_closed)"
          save-label="Mentés"
          cancel-label="Vissza"
          @save="handleSave"
          @cancel="router.push('/admin/stock/inventory')"
        />

        <button
          v-if="!inventory.is_closed"
          type="button"
          class="ml-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          :disabled="isSaving || isClosing"
          @click="handleCloseInventory"
        >
          Leltár lezárása
        </button>
      </CardFooter>
    </Card>
  </AdminLayout>
</template>


