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
import { warehouseService, type WarehouseFormData } from '@stock/services/warehouseService'

const route = useRoute()
const router = useRouter()
const isSaving = ref(false)
const isLoading = ref(true)
const errors = ref<Record<string, string[]>>({})

const form = reactive<WarehouseFormData>({
  name: '',
  description: null,
  is_primary: false,
})

const fetchWarehouse = async () => {
  try {
    isLoading.value = true
    const warehouseId = route.params.id as string
    const { data } = await warehouseService.getEditData(warehouseId)

    form.name = data.data.name
    form.description = data.data.description ?? null
    form.is_primary = data.data.is_primary ?? false
  } catch (error) {
    console.error('Hiba a raktár betöltésekor:', error)
    toastService.error('Hiba történt a raktár betöltésekor.')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const warehouseId = route.params.id as string
    await warehouseService.update(warehouseId, form)
    toastService.success('A raktár sikeresen frissült!')
    router.push('/admin/stock/warehouse')
  } catch (error: any) {
    console.error('Hiba a raktár frissítésekor:', error)
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
  fetchWarehouse()
})
</script>

<template>
  <AdminLayout pageTitle="Raktár szerkesztése">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/warehouse" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Raktár adatok</CardTitle>
        <CardDescription>Frissítsd a raktár adatait.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Név *</Label>
          <Input id="name" v-model="form.name" placeholder="Központi raktár" />
          <InputError :message="errors.name" />
        </div>

        <div class="space-y-2">
          <Label for="description">Leírás</Label>
          <Input id="description" v-model="form.description" placeholder="A fő telephely raktára" />
          <InputError :message="errors.description" />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="is_primary" v-model:checked="form.is_primary" />
          <Label for="is_primary">Elsődleges raktár</Label>
          <InputError :message="errors.is_primary" />
        </div>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/stock/warehouse')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>

