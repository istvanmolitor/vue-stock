<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AdminLayout, BackButton, FormButtons, InputError, toastService, LoadingSpinner } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Input from '@admin/components/ui/Input.vue'
import Label from '@admin/components/ui/Label.vue'
import { warehouseRegionService, type WarehouseRegionFormData } from '../../services/warehouseRegionService'
import type { Warehouse } from '../../services/warehouseService'

const route = useRoute()
const router = useRouter()
const isSaving = ref(false)
const isLoading = ref(true)
const errors = ref<Record<string, string[]>>({})
const warehouses = ref<Warehouse[]>([])

const form = reactive<WarehouseRegionFormData>({
  warehouse_id: null,
  name: '',
  description: null,
  is_primary: false,
})

const fetchWarehouseRegion = async () => {
  try {
    isLoading.value = true
    const regionId = route.params.id as string
    const { data } = await warehouseRegionService.getEditData(regionId)

    form.warehouse_id = data.data.warehouse_id
    form.name = data.data.name
    form.description = data.data.description ?? null
    form.is_primary = data.data.is_primary ?? false
    warehouses.value = data.warehouses
  } catch (error) {
    console.error('Hiba a régió betöltésekor:', error)
    toastService.error('Hiba történt a régió betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const regionId = route.params.id as string
    await warehouseRegionService.update(regionId, form)
    toastService.success('A telephely régió sikeresen frissült!')
    router.push('/admin/stock/warehouse-region')
  } catch (error: any) {
    console.error('Hiba a régió frissítésekor:', error)
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
  fetchWarehouseRegion()
})
</script>

<template>
  <AdminLayout pageTitle="Régió szerkesztése">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/warehouse-region" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Régió adatok</CardTitle>
        <CardDescription>Frissítsd a régió adatait.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="warehouse_id">Raktár *</Label>
          <select
            id="warehouse_id"
            v-model="form.warehouse_id"
            class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Válassz raktárat</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
          <InputError :message="errors.warehouse_id" />
        </div>

        <div class="space-y-2">
          <Label for="name">Név *</Label>
          <Input id="name" v-model="form.name" placeholder="Központi régió" />
          <InputError :message="errors.name" />
        </div>

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Input id="description" v-model="form.description" placeholder="A fő raktár egyik régiója" />
          <InputError :message="errors.description" />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="is_primary" v-model:checked="form.is_primary" />
          <Label for="is_primary">Elsődleges régió</Label>
          <InputError :message="errors.is_primary" />
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/stock/warehouse-region')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>


