<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '@admin/components/ui/Modal.vue'
import type { WarehouseRegionOption } from '@stock/services/stockMovementService'

interface Props {
  id?: string
  modelValue?: number | null
  options?: WarehouseRegionOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  emptyValue?: number | null
  disabled?: boolean
  required?: boolean
}

interface GroupedRegionOption {
  warehouseId: number
  warehouseName: string
  regions: WarehouseRegionOption[]
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  modelValue: null,
  options: () => [],
  placeholder: 'Valassz raktar regiot',
  searchPlaceholder: 'Kereses regio vagy raktar neve alapjan...',
  emptyMessage: 'Nincs talalat.',
  emptyValue: null,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const isModalOpen = ref(false)
const search = ref('')

const normalizedSearch = computed(() => search.value.trim().toLowerCase())

const selectedRegion = computed(() => {
  if (props.modelValue === null || props.modelValue === props.emptyValue) {
    return null
  }

  return props.options.find((region) => region.id === props.modelValue) ?? null
})

const filteredRegions = computed(() => {
  if (normalizedSearch.value.length === 0) {
    return props.options
  }

  return props.options.filter((region) => {
    const regionName = String(region.name ?? '').toLowerCase()
    const regionLabel = String(region.label ?? '').toLowerCase()
    const warehouseName = String(region.warehouse_name ?? '').toLowerCase()

    return regionName.includes(normalizedSearch.value)
      || regionLabel.includes(normalizedSearch.value)
      || warehouseName.includes(normalizedSearch.value)
  })
})

const groupedRegions = computed<GroupedRegionOption[]>(() => {
  const groups = new Map<number, GroupedRegionOption>()

  for (const region of filteredRegions.value) {
    const existingGroup = groups.get(region.warehouse_id)

    if (existingGroup) {
      existingGroup.regions.push(region)
      continue
    }

    groups.set(region.warehouse_id, {
      warehouseId: region.warehouse_id,
      warehouseName: region.warehouse_name ?? 'Raktar',
      regions: [region],
    })
  }

  return [...groups.values()]
})

const openModal = (): void => {
  if (props.disabled) {
    return
  }

  isModalOpen.value = true
}

const closeModal = (): void => {
  isModalOpen.value = false
  search.value = ''
}

const selectRegion = (regionId: number): void => {
  emit('update:modelValue', regionId)
  closeModal()
}

const clearSelection = (): void => {
  emit('update:modelValue', props.emptyValue)
  closeModal()
}
</script>

<template>
  <div>
    <button
      type="button"
      :id="id"
      :disabled="disabled"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="openModal"
    >
      <span v-if="selectedRegion" class="truncate text-left">
        {{ selectedRegion.label }}
      </span>
      <span v-else class="truncate text-muted-foreground">{{ placeholder }}</span>
      <span class="ml-2 shrink-0 text-xs text-muted-foreground">Kivalasztas</span>
    </button>

    <input
      v-if="required"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute h-0 w-0 opacity-0"
      :value="modelValue ?? ''"
      required
    >

    <Modal :show="isModalOpen" title="Raktar regio kivalasztasa" @close="closeModal">
      <div class="space-y-3">
        <input
          v-model="search"
          type="text"
          autofocus
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="searchPlaceholder"
        >

        <div class="max-h-96 space-y-3 overflow-y-auto rounded-md border p-2">
          <div v-if="groupedRegions.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
            {{ emptyMessage }}
          </div>

          <div v-for="group in groupedRegions" :key="group.warehouseId" class="space-y-1">
            <div class="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {{ group.warehouseName }}
            </div>

            <button
              v-for="region in group.regions"
              :key="region.id"
              type="button"
              class="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              :class="{ 'bg-accent text-accent-foreground': modelValue === region.id }"
              @click="selectRegion(region.id)"
            >
              <span class="truncate">{{ region.name }}</span>
              <svg
                v-if="modelValue === region.id"
                class="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="closeModal"
        >
          Megse
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          @click="clearSelection"
        >
          Kivalasztas torlese
        </button>
      </template>
    </Modal>
  </div>
</template>

