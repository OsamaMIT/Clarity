<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CardState } from "../types";
  import Button from "./ui/button/button.svelte";
  import Badge from "./ui/badge/badge.svelte";

  export let visible = false;
  export let state: CardState = "hidden";
  export let selectedText = "";
  export let meaning = "";
  export let simplerVersion = "";
  export let audienceVersion = "";
  export let confidence: number | null = null;
  export let errorMessage = "";
  export let position = { top: 16, left: 16 };

  const dispatch = createEventDispatcher<{
    close: undefined;
    retry: undefined;
  }>();

  $: isLoading = state === "loading";
  $: isSuccess = state === "success" || state === "low_confidence";
  $: isLowConfidence = state === "low_confidence";
  $: isError = state === "error" || state === "timeout";
</script>

{#if visible && state !== "hidden"}
  <div class="fixed inset-0 z-[2147483647] pointer-events-none">
    <article
      class="clarte-card-enter pointer-events-auto absolute w-[min(380px,calc(100vw-24px))] max-h-[min(75vh,560px)] overflow-auto rounded-lg border border-border bg-card p-4 text-card-foreground shadow-card"
      style={`top:${position.top}px;left:${position.left}px;`}
    >
      <header class="mb-3 flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold">Clarte</p>
          <p class="text-xs text-muted-foreground">Context explanation</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          class="h-7 w-7 p-0"
          aria-label="Close explanation"
          on:click={() => dispatch("close")}
        >
          ×
        </Button>
      </header>

      <div class="mb-3 rounded-md bg-secondary p-2">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Selected Text</p>
        <p class="mt-1 text-sm leading-snug">"{selectedText}"</p>
      </div>

      {#if isLoading}
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-r-transparent"></span>
            <span>Generating explanation…</span>
          </div>
        </div>
      {/if}

      {#if isSuccess}
        <div class="space-y-3">
          {#if isLowConfidence}
            <Badge variant="warning">Low confidence{#if confidence !== null}: {confidence.toFixed(2)}{/if}</Badge>
          {/if}

          <section class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meaning</p>
            <p class="text-sm leading-relaxed">{meaning}</p>
          </section>

          <section class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Simpler Version</p>
            <p class="text-sm leading-relaxed">{simplerVersion}</p>
          </section>

          <section class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audience Version</p>
            <p class="text-sm leading-relaxed">{audienceVersion}</p>
          </section>
        </div>
      {/if}

      {#if isError}
        <div class="space-y-3">
          <p class="text-sm text-destructive">
            {state === "timeout" ? "Request timed out." : "Unable to generate explanation."}
          </p>
          <p class="text-xs text-muted-foreground">{errorMessage}</p>
          <Button variant="secondary" on:click={() => dispatch("retry")}>Retry</Button>
        </div>
      {/if}
    </article>
  </div>
{/if}
