<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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
  type StockMovementFormData,
  type StockMovementItemFormData,
  type StockMovementType,
  type StockMovementTypeOption,
  type WarehouseRegionOption,
} from '@stock/services/stockMovementService'

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const movementTypes = ref<StockMovementTypeOption[]>([])
const warehouseRegions = ref<WarehouseRegionOption[]>([])
const products = ref<ProductOption[]>([])

const form = reactive<StockMovementFormData & { description: string }>({
  type: 'in' as StockMovementType,
  description: '',
  items: [{ warehouse_region_id: null, destination_warehouse_region_id: null, product_id: null, quantity: 1 }],
})

const movementTypeOptions = computed(() =>
  movementTypes.value.map((t) => ({ value: t.value, label: t.label })),
)

const fetchCreateData = async () => {
  try {
    isLoading.value = true
    const { data } = await stockMovementService.getCreateData()
    movementTypes.value = data.movement_types
    warehouseRegions.value = data.warehouse_regions
    products.value = data.products
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

    const response = await stockMovementService.create(payload)
    toastService.success(response.data.message)
    const id = response.data.data?.id
    if (id) {
      router.push(`/admin/stock/movement/${id}/edit`)
    }
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

onMounted(() => fetchCreateData())
</script>

<template>
  <AdminLayout pageTitle="Új készletmozgás">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/movement" />
    </div>

    <div v-if="isLoading" class="py-8 text-center"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Új készletmozgás</CardTitle>
        <CardDescription>A mozgás mentés után végrehajtható a szerkesztő oldalon.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
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

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          save-label="Mentés"
          @save="handleSubmit"
          @cancel="router.push('/admin/stock/movement')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
