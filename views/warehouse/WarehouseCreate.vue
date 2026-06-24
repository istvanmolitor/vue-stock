<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout, BackButton, FormButtons, InputError, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import InputField from '@admin/components/ui/InputField.vue'
import Label from '@admin/components/ui/Label.vue'
import { warehouseService, type WarehouseFormData } from '@stock/services/warehouseService'

const router = useRouter()
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const form = reactive<WarehouseFormData>({
  name: '',
  description: null,
  is_primary: false,
})

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const response: any = await warehouseService.create(form)
    toastService.success('A raktár sikeresen létrejött!')

    const createdWarehouseId = response?.data?.data?.id ?? response?.data?.id ?? response?.id

    if (createdWarehouseId !== undefined && createdWarehouseId !== null) {
      await router.push({
        name: 'admin-stock-warehouse-edit',
        params: { id: String(createdWarehouseId) },
      })

      return
    }

    router.push('/admin/stock/warehouse')
  } catch (error: any) {
    console.error('Hiba a raktár létrehozásakor:', error)
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
</script>

<template>
  <AdminLayout pageTitle="Új raktár">
    <div class="mb-4 flex items-center justify-between space-y-2">
      <BackButton to="/admin/stock/warehouse" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Raktár adatok</CardTitle>
        <CardDescription>Add meg az új raktár adatait a létrehozáshoz.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <InputField id="name" label="Név" v-model="form.name" placeholder="Központi raktár" :required="true" :errors="errors.name" />

        <InputField id="description" label="Leírás" v-model="form.description" placeholder="A fő telephely raktára" :errors="errors.description" />

        <div class="flex items-center gap-2">
          <Checkbox id="is_primary" v-model="form.is_primary" />
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

