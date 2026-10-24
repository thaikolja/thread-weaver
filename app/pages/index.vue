<script setup lang="ts">
const {
  source,
  marker,
  placement,
  bridge,
  flatten,
  platform,
  limit,
  posts,
  totalCharacterCount,
  wordCount,
  readMinutes,
  platformName,
  copiedPosts,
  allCopied,
  speakingId,
  activeQrUrl,
  choosePlatform,
  move,
  drop,
  copyPost,
  copyAll,
  send,
  listen,
  openQr,
  closeQr,
  download
} = useThreadWeaver()
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between px-4 py-8 sm:px-6 sm:py-12 md:py-16">
    <ThreadHeader />
    <main class="space-y-8 sm:space-y-10">
      <ThreadWorkbench
        v-model:source="source"
        v-model:marker="marker"
        v-model:placement="placement"
        v-model:bridge="bridge"
        v-model:flatten="flatten"
        :platform="platform"
        @platform="choosePlatform"
      />
      <section class="space-y-6">
        <ThreadPostList
          :posts="posts"
          :limit="limit"
          :platform-label="platformName"
          :copied-posts="copiedPosts"
          :speaking-id="speakingId"
          :all-copied="allCopied"
          @copy="copyPost"
          @copy-all="copyAll"
          @move="move"
          @drop="drop"
          @send="send"
          @listen="listen"
          @qr="openQr"
        />
        <ThreadShipStation
          :count="posts.length"
          :minutes="readMinutes"
          :total-chars="totalCharacterCount"
          :total-words="wordCount"
          :platform-label="platformName"
          :all-copied="allCopied"
          @copy-all="copyAll"
          @download="download"
        />
      </section>
    </main>
    <ThreadQrModal
      :url="activeQrUrl"
      @close="closeQr"
    />
    <ThreadFooter />
  </div>
</template>
