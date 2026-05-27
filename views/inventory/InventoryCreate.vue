<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, FormButtons, InputError, toastService } from '@admin'
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
import {
  inventoryService,
  type InventoryCreateFormData,
  type InventoryRegionOption,
} from '@stock/services/inventoryService'

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})
const warehouseRegions = ref<InventoryRegionOption[]>([])

const form = reactive<InventoryCreateFormData & { description: string }>({
  warehouse_region_id: null,
  description: '',
})

const fetchCreateData = async () => {
  try {
    isLoading.value = true
    const { data } = await inventoryService.getCreateData()
    warehouseRegions.value = data.warehouse_regions
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

    const payload: InventoryCreateFormData = {
      warehouse_region_id: form.warehouse_region_id ? Number(form.warehouse_region_id) : null,
      description: form.description.trim() || undefined,
    }

    const response = await inventoryService.create(payload)
    toastService.success(response.data.message)

    const id = response.data.data?.id
    if (id) {
      router.push(`/admin/stock/inventory/${id}/edit`)
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

onMounted(() => {
  fetchCreateData()
})
</script>

<template>
  <AdminLayout pageTitle="Új leltár">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/inventory" />
    </div>

    <div v-if="isLoading" class="py-8 text-center">Betöltés...</div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Új leltár</CardTitle>
        <CardDescription>Válassz régiót, majd töltsd ki az opcionális leírást.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="warehouse_region_id">Régió *</Label>
          <Select
            id="warehouse_region_id"
            v-model="form.warehouse_region_id"
            :options="warehouseRegions.map((region) => ({
              value: region.id,
              label: region.label ?? region.name,
            }))"
            placeholder="Válassz régiót"
          />
          <InputError :message="errors.warehouse_region_id" />
        </div>

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Textarea id="description" v-model="form.description" placeholder="Leltár megjegyzés..." />
          <InputError :message="errors.description" />
        </div>
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          save-label="Leltár létrehozása"
          @save="handleSubmit"
          @cancel="router.push('/admin/stock/inventory')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>

