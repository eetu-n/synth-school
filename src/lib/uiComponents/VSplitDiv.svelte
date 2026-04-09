<script lang="ts">
    import type { Snippet } from 'svelte';

    let { leftSide, rightSide }: { leftSide: Snippet, rightSide: Snippet } = $props();

    let leftWidth = $state(30);
    let isDragging = $state(false);

    // Responsive state
    let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);
    const breakpoint = 1200;
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
    <div class="flex h-screen w-full overflow-hidden" class:select-none={isDragging} class:cursor-col-resize={isDragging}>
      <div class="overflow-y-auto p-5 bg-background" style="width: {leftWidth}%">
          {@render leftSide()}
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
      
      <div class="overflow-y-auto p-5 bg-surface" style="width: {100 - leftWidth}%">
          {@render rightSide()}
      </div>
    </div>
{:else}
    <div class="flex flex-col h-screen w-full">
        <div class="flex flex-shrink-0">
            <button 
                onclick={() => activeTab = 'left'} 
                class="flex-1 py-3 px-4 bg-surface border-none border-b-2 text-text-primary text-base cursor-pointer transition-colors duration-200"
                class:border-transparent={activeTab !== 'left'}
                class:bg-background={activeTab === 'left'}
                class:border-b-primary={activeTab === 'left'}
            >
                Lesson
            </button>
            <button 
                onclick={() => activeTab = 'right'} 
                class="flex-1 py-3 px-4 bg-surface border-none border-b-2 text-text-primary text-base cursor-pointer transition-colors duration-200"
                class:border-transparent={activeTab !== 'right'}
                class:bg-background={activeTab === 'right'}
                class:border-b-primary={activeTab === 'right'}
            >
                Workspace
            </button>
        </div>

        <div class="flex-grow overflow-y-auto">
            <div class="overflow-y-auto p-5 bg-background" hidden={activeTab !== 'left'}>
                {@render leftSide()}
            </div>
            <div class="overflow-y-auto p-5 bg-surface" hidden={activeTab !== 'right'}>
                {@render rightSide()}
            </div>
        </div>
    </div>
{/if}

