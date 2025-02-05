<template>
    <div class="md:flex md:items-center mb-6">
        <div class="md:w-1/3">
            <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" :for="name">
                {{ label }}
            </label>
        </div>
        <div class="md:w-2/3">
            <div class="justify-center my-2">
                <button @click="remove(pill)" v-for="pill in localArr" v-bind:key="pill" class="sensor-pill my-2 py-1 px-2 shadow-md no-underline rounded-full bg-blue-500 text-white font-sans font-semibold text-sm border-blue btn-primary hover:text-white hover:bg-blue-700 focus:outline-none active:shadow-none mr-2">
                    {{ pill }}
                </button>
            </div>
            <select
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            :id="name" @change="selected">
                <option v-for="option in options" v-bind:key="option" :value="option">{{ option }}</option>
            </select>
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
    options: {
        type: Array,
        required: false,
        default: () => [],
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
    hidden : {
        type: Boolean,
        required: false,
        default: false
    }
});

const emit = defineEmits(['update:modelValue'])
const localValue = ref(props.modelValue || '')
const localArr = ref(localValue.value.split(","));

const selected = (event) => {
    if (localValue.value != "") localValue.value += ",";
    localValue.value += event.target.value;
}

const remove = (pill) => {
    localArr.value = localArr.value.filter((item) => item !== pill);
    localValue.value = localArr.value.join(",");
}

watch(localValue, (newValue) => {
    emit('update:modelValue', newValue)
    localArr.value = newValue.split(",");
    localArr.value = localArr.value.filter((v) => v != "");
})

watch(
    () => props.modelValue,
    (newValue) => {
        localValue.value = newValue
    },
)
</script>

<style scoped>
.sensor-pill {
    cursor: pointer;
    font-size: 11px;
}
</style>