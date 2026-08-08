<template>
  <UApp>
    <UContainer class="py-4">
      <nav class="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <NuxtLink
          to="/"
          class="font-bold text-lg"
        >
          nuxt-content-tags
        </NuxtLink>
        <NuxtLink
          to="/tags"
          class="text-sm hover:underline"
        >
          Tags
        </NuxtLink>
      </nav>
    </UContainer>
    <NuxtPage />
  </UApp>
</template>
