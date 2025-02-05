<template>
  <NavBar />
  <div class="w-3/5 mx-auto text-center mt-2">
    <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight">
      Configuration
    </h1>
    <ConfigForm />
  </div>


</template>

<script setup>
import ConfigForm from './components/ConfigForm.vue';
import NavBar from './components/NavBar.vue';
</script>
