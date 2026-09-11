<script lang="ts">
    import type { Snippet } from 'svelte';
    import { page } from '$app/stores';
    import LessonNavigation from '$lib/components/ui/layout/LessonNavigation.svelte';

    let { 
        leftSide, 
        rightSide, 
        prev, 
        next, 
        leftTabTitle = 'Lesson', 
        rightTabTitle = 'Workspace',
        nextClass = ''
    }: { 
        leftSide: Snippet, 
        rightSide: Snippet,
        prev?: string,
        next?: string,
        leftTabTitle?: string,
        rightTabTitle?: string,
        nextClass?: string
    } = $props();

    const lessonModules = import.meta.glob('/src/routes/lessons/**/+page.svelte');
    const lessonPaths = Object.keys(lessonModules)
        .map(p => p.replace('/src/routes', '').replace('/+page.svelte', ''))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    let currentPath = $derived($page.url.pathname.replace(/\/$/, ''));
    let currentFolder = $derived(currentPath.substring(0, currentPath.lastIndexOf('/')));
    let siblings = $derived(lessonPaths.filter(p => p.substring(0, p.lastIndexOf('/')) === currentFolder));
    let currentIndex = $derived(siblings.indexOf(currentPath));

    let computedPrev = $derived(prev !== undefined ? prev : (currentIndex > 0 ? siblings[currentIndex - 1] : undefined));
    let computedNext = $derived(next !== undefined ? next : (currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : undefined));

    let leftWidth = $state(30);
    let isDragging = $state(false);

    // Responsive state
    let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);
    const breakpoint = 1280;
    let activeTab: 'left' | 'right' = $state('left');

    function startDragging() {
        isDragging = true;
    }

    function stopDragging() {
        isDragging = false;
    }

    function onDrag(e: MouseEvent) {
        if (!isDragging) return;
        
        const newWidth = (e.clientX / window.innerWidth) * 100;
        
        if (newWidth > 10 && newWidth < 90) {
            leftWidth = newWidth;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            leftWidth = Math.max(10, leftWidth - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            leftWidth = Math.min(90, leftWidth + 1);
        }
    }
</script>

<svelte:window bind:innerWidth={innerWidth} onmousemove={onDrag} onmouseup={stopDragging} />

{#if innerWidth >= breakpoint}
    <div class="flex h-full w-full overflow-hidden" class:select-none={isDragging} class:cursor-col-resize={isDragging}>
      <div class="overflow-y-auto bg-background flex flex-col" style="width: {leftWidth}%">
          <div class="flex flex-col px-5 pt-5">
            <div class="flex-grow">
                {@render leftSide()}
            </div>
            <div class="h-5 flex-shrink-0 w-full"></div>
            {#if computedPrev || computedNext}
                <div class="mt-8">
                    <LessonNavigation prev={computedPrev} next={computedNext} {nextClass} />
                </div>
            {/if}
          </div>
      </div>
      
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
      <div
          class="w-2 bg-surface cursor-col-resize z-10 transition-colors duration-200 ease hover:bg-primary active:bg-primary"
          onmousedown={startDragging}
          onkeydown={handleKeydown} 
          role="separator" 
          tabindex="0"
          aria-label="Resize panels"
      ></div>
      
      <div class="overflow-y-auto bg-surface flex flex-col" style="width: {100 - leftWidth}%">
          <div class="flex flex-col px-5 pt-5">
            {@render rightSide()}
            <div class="h-5 flex-shrink-0 w-full"></div>
          </div>
      </div>
    </div>
{:else}
    <div class="flex flex-col h-full w-full overflow-hidden">
        <div class="flex flex-shrink-0 border-b border-border/50 p-2 gap-2 bg-surface">
            <button 
                onclick={() => activeTab = 'left'} 
                class="flex-1 py-3 px-4 rounded-md border-none border-b-2 text-sm font-bold transition-all duration-200 uppercase tracking-widest
                       {activeTab === 'left' ? 'border-primary text-primary bg-background shadow-sm' : 'border-transparent text-text-secondary/60 bg-transparent'}"
            >
                {leftTabTitle}
            </button>
            <button 
                onclick={() => activeTab = 'right'} 
                class="flex-1 py-3 px-4 rounded-md border-none border-b-2 text-sm font-bold transition-all duration-200 uppercase tracking-widest
                       {activeTab === 'right' ? 'border-primary text-primary bg-background shadow-sm' : 'border-transparent text-text-secondary/60 bg-transparent'}"
            >
                {rightTabTitle}
            </button>
        </div>

        <div class="flex-grow flex flex-col overflow-hidden min-h-0">
            <div class="flex-1 overflow-y-auto bg-background flex flex-col min-h-0" class:hidden={activeTab !== 'left'}>
                <div class="flex flex-col px-5 pt-5">
                    {@render leftSide()}
                    <div class="h-5 flex-shrink-0 w-full"></div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto bg-surface flex flex-col min-h-0" class:hidden={activeTab !== 'right'}>
                <div class="flex flex-col px-5 pt-5">
                    {@render rightSide()}
                    <div class="h-5 flex-shrink-0 w-full"></div>
                </div>
            </div>
        </div>

        {#if computedPrev || computedNext}
            <div class="flex-shrink-0 bg-surface border-t border-border/50 px-5 pb-2">
                <LessonNavigation prev={computedPrev} next={computedNext} {nextClass} />
            </div>
        {/if}
    </div>
{/if}
