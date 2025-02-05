<template>
    <div class="md:flex md:items-center mb-6">
        <div class="md:w-1/3">
            <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" :for="name">
                {{ label }}
            </label>
        </div>
        <div class="md:w-2/3">
            <textarea v-if="textArea"
                class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                :id="name" v-model="localValue" :placeholder="placeholder" rows="5">
            </textarea>

            <input v-else
                class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                :id="name" v-model="localValue" :placeholder="placeholder" :type="hidden ? 'password' : 'text'"/>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        type: [String, Number, null],
        required: true,
    },
    label: {
        type: String,
        required: false,
        default: null,
    },
    placeholder: {
        type: String,
        required: false,
        default: ""
    },
    hidden: {
        type: Boolean,
        required: false,
        default: false
    },
    textArea: {
        type: Boolean,
        required: false,
        default: false
    },
});

const emit = defineEmits(['update:modelValue'])
const localValue = ref(props.modelValue)

watch(localValue, (newValue) => {
    emit('update:modelValue', newValue)
})

watch(
    () => props.modelValue,
    (newValue) => {
        localValue.value = newValue
    },
)
</script>