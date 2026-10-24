<script setup lang="ts">
/** One editor, shared with every section below. */
provideWeaver()
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between px-4 py-8 sm:px-6 sm:py-12 md:py-16">
    <WeaverHeader />
    <main class="space-y-8 sm:space-y-10">
      <WeaverWorkbench />
      <section class="space-y-6">
        <PostList />
        <ShipStation />
      </section>
    </main>
    <QrModal />
    <WeaverFooter />
  </div>
</template>
