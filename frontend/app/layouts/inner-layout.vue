<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Navbar />
      <main class="flex-1 bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>