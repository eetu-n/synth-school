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
</script>

<svelte:window bind:innerWidth={innerWidth} onmousemove={onDrag} onmouseup={stopDragging} />

{#if innerWidth >= breakpoint}
    <div class="allContent" class:dragging={isDragging}>
      <div class="lessonContent" style="width: {leftWidth}%">
          {@render leftSide()}
      </div>
      
      <div 
          class="resizer" 
          onmousedown={startDragging} 
          role="separator" 
          tabindex="0"
          aria-label="Resize panels"
      ></div>
      
      <div class="workspace" style="width: {100 - leftWidth}%">
          {@render rightSide()}
      </div>
    </div>
{:else}
    <div class="tab-container">
        <div class="tab-buttons">
            <button onclick={() => activeTab = 'left'} class:active={activeTab === 'left'}>
                Lesson
            </button>
            <button onclick={() => activeTab = 'right'} class:active={activeTab === 'right'}>
                Workspace
            </button>
        </div>

        <div class="tab-content">
            {#if activeTab === 'left'}
                <div class="lessonContent">
                    {@render leftSide()}
                </div>
            {:else}
                <div class="workspace">
                    {@render rightSide()}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    /* DESKTOP STYLES */
    .allContent {
        display: flex;
        height: 100vh;
        width: 100%;
        overflow: hidden;
    }

    .allContent.dragging {
        user-select: none;
        cursor: col-resize;
    }

    .resizer {
        width: 8px;
        background-color: #999;
        cursor: col-resize;
        z-index: 10;
        transition: background-color 0.2s ease;
    }

    .resizer:hover, .resizer:active {
        background-color: #555;
    }
    
    /* MOBILE/TAB STYLES */
    .tab-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
    }

    .tab-buttons {
        display: flex;
        flex-shrink: 0;
    }

    .tab-buttons button {
        flex: 1;
        padding: 0.8rem 1rem;
        background-color: #e5e7eb;
        border: none;
        border-bottom: 2px solid transparent;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
    }

    .tab-buttons button.active {
        background-color: #fff;
        border-bottom-color: #3b82f6;
    }

    .tab-content {
        flex-grow: 1;
        overflow-y: auto;
    }

    /* SHARED STYLES */
    .lessonContent, .workspace {
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
    }
    .lessonContent {
        background-color: #ccc;
    }

    .workspace {
        background-color: #f3f4f6;
    }
</style>
