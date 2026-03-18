<script lang="ts">
    import type { Snippet } from 'svelte';

    let { leftSide, rightSide }: { leftSide: Snippet, rightSide: Snippet } = $props();

    let leftWidth = $state(30);
    let isDragging = $state(false);

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

<svelte:window onmousemove={onDrag} onmouseup={stopDragging} />

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

<style>
    .allContent {
        display: flex;
        /* Calculate height minus the header height (~75px) */
        /*height: calc(100vh - 75px);*/
        height: 100vh;
        width: 100%;
        overflow: hidden;
    }

    .allContent.dragging {
        user-select: none;
        cursor: col-resize;
    }

    .lessonContent {
        background-color: #ccc;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
    }

    .resizer {
        width: 8px;
        background-color: #999;
        cursor: col-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background-color 0.2s ease;
    }

    .resizer:hover, .resizer:active {
        background-color: #555;
    }

    .workspace {
        background-color: #f3f4f6;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
    }
</style>
