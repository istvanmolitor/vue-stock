<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
import Select from '@admin/components/ui/Select.vue'
import Textarea from '@admin/components/ui/Textarea.vue'
import StockMovementItemsEditor from './StockMovementItemsEditor.vue'
import {
  stockMovementService,
  type ProductOption,
  type StockMovement,
  type StockMovementFormData,
  type StockMovementItemFormData,
  type StockMovementType,
  type StockMovementTypeOption,
  type WarehouseRegionOption,
} from '@stock/services/stockMovementService'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const isSaving = ref(false)
const isExecuting = ref(false)
const errors = ref<Record<string, string[]>>({})

const movement = ref<StockMovement | null>(null)
const movementTypes = ref<StockMovementTypeOption[]>([])
const warehouseRegions = ref<WarehouseRegionOption[]>([])
const products = ref<ProductOption[]>([])

const form = reactive<StockMovementFormData & { description: string }>({
  type: 'in' as StockMovementType,
  description: '',
  items: [],
})

const isClosed = computed(() => movement.value?.is_closed === true)

const movementTypeOptions = computed(() =>
  movementTypes.value.map((t) => ({ value: t.value, label: t.label })),
)

const fetchEditData = async () => {
  try {
    isLoading.value = true
    const id = route.params.id as string
    const { data } = await stockMovementService.getEditData(id)

    movement.value = data.data
    movementTypes.value = data.movement_types
    warehouseRegions.value = data.warehouse_regions
    products.value = data.products

    form.type = data.data.type
    form.description = data.data.description ?? ''
    form.items = (data.data.items ?? []).map((item) => ({
      warehouse_region_id: item.warehouse_region_id,
      destination_warehouse_region_id: item.destination_warehouse_region_id ?? null,
      product_id: item.product_id,
      quantity: item.quantity,
    }))

    if (form.items.length === 0) {
      form.items = [{ warehouse_region_id: null, destination_warehouse_region_id: null, product_id: null, quantity: 1 }]
    }
  } catch {
    toastService.error('Hiba történt az adatok betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const id = route.params.id as string
    const payload: StockMovementFormData = {
      type: form.type,
      description: form.description.trim() || undefined,
      items: form.items.map((item) => ({
        warehouse_region_id: item.warehouse_region_id ? Number(item.warehouse_region_id) : null,
        destination_warehouse_region_id: item.destination_warehouse_region_id
          ? Number(item.destination_warehouse_region_id)
          : undefined,
        product_id: item.product_id ? Number(item.product_id) : null,
        quantity: Number(item.quantity),
      })),
    }

    const response = await stockMovementService.update(id, payload)
    movement.value = response.data.data
    toastService.success(response.data.message)
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a mentés során.')
    }
  } finally {
    isSaving.value = false
  }
}

const handleExecute = async () => {
  if (!movement.value?.id) {
    return
  }
  try {
    isExecuting.value = true
    errors.value = {}
    const response = await stockMovementService.execute(movement.value.id)
    movement.value = response.data.data
    toastService.success(response.data.message)
  } catch (error: any) {
    if (error.response?.status === 422) {
      const msg = error.response.data?.errors?.items?.[0]
        ?? error.response.data?.message
        ?? 'Hiba történt a végrehajtás során.'
      toastService.error(msg)
    } else {
      toastService.error('Hiba történt a végrehajtás során.')
    }
  } finally {
    isExecuting.value = false
  }
}

onMounted(() => fetchEditData())
</script>

<template>
  <AdminLayout pageTitle="Készletmozgás szerkesztése">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/movement" />
    </div>

    <div v-if="isLoading" class="py-8 text-center"><LoadingSpinner label="Betöltés..." /></div>

    <template v-else>
      <div v-if="isClosed" class="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Végrehajtva: {{ movement?.closed_at }}
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Készletmozgás #{{ movement?.id }}</CardTitle>
              <CardDescription>
                {{ isClosed ? 'A mozgás már végre lett hajtva, nem szerkeszthető.' : 'Tételek módosítása, majd végrehajtás.' }}
              </CardDescription>
            </div>
            <button
              v-if="!isClosed"
              type="button"
              :disabled="isExecuting"
              class="inline-flex shrink-0 items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              @click="handleExecute"
            >
              <svg v-if="isExecuting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ isExecuting ? 'Végrehajtás...' : 'Végrehajtás' }}
            </button>
          </div>
        </CardHeader>

        <CardContent :class="['space-y-6', { 'opacity-60 pointer-events-none select-none': isClosed }]">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="type">Mozgás típusa *</Label>
              <Select id="type" v-model="form.type" :options="movementTypeOptions" placeholder="Válassz típust" />
              <InputError :message="errors.type" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Leírás</Label>
            <Textarea id="description" v-model="form.description" placeholder="Pl. bevételezés, selejtezés..." />
            <InputError :message="errors.description" />
          </div>

          <StockMovementItemsEditor
            :items="form.items"
            :movement-type="form.type"
            :warehouse-regions="warehouseRegions"
            :products="products"
            :errors="errors"
            @update:items="(val: StockMovementItemFormData[]) => (form.items = val)"
          />
        </CardContent>

        <CardFooter v-if="!isClosed">
          <FormButtons
            :is-saving="isSaving"
            save-label="Mentés"
            @save="handleSubmit"
            @cancel="router.push('/admin/stock/movement')"
          />
        </CardFooter>
      </Card>
    </template>
  </AdminLayout>
</template>

