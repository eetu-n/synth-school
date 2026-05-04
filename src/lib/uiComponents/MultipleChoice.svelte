<script lang="ts">
    import type { Snippet } from 'svelte';
    import VSplitDiv from './VSplitDiv.svelte';

    interface Option {
        id: string | number;
        content: string | Snippet;
        isCorrect?: boolean;
    }

    interface Props {
        question: string | Snippet;
        options: Option[];
        onCorrect?: () => void;
        onIncorrect?: (selected: Option) => void;
        prev?: string;
        next?: string;
    }

    let { 
        question, 
        options, 
        onCorrect, 
        onIncorrect,
        prev,
        next
    }: Props = $props();

    let selectedId = $state<string | number | null>(null);
    let isSubmitted = $state(false);
    let isCorrectAnswer = $state(false);

    const selectOption = (id: string | number) => {
        if (isSubmitted) return;
        selectedId = id;
    };

    const submit = () => {
        if (selectedId === null) return;
        isSubmitted = true;
        const selectedOption = options.find(o => o.id === selectedId);
        if (selectedOption?.isCorrect) {
            isCorrectAnswer = true;
            onCorrect?.();
        } else if (selectedOption) {
            isCorrectAnswer = false;
            onIncorrect?.(selectedOption);
        }
    };

    const reset = () => {
        selectedId = null;
        isSubmitted = false;
        isCorrectAnswer = false;
    };
</script>

{#snippet renderContent(content: string | Snippet)}
    {#if typeof content === 'string'}
        <span>{content}</span>
    {:else}
        {@render content()}
    {/if}
{/snippet}

{#snippet leftSideSnippet()}
    <div class="flex flex-col h-full">
        <div class="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 opacity-80 flex-shrink-0">Knowledge Check</div>
        <div class="text-xl xl:text-2xl font-semibold text-text-primary leading-tight">
            {@render renderContent(question)}
        </div>
    </div>
{/snippet}

{#snippet rightSideSnippet()}
    <div class="flex flex-col h-full overflow-hidden">
        <!-- Options Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6 flex-grow overflow-y-auto mb-6 pr-2">
            {#each options as option}
                {@const isSelected = selectedId === option.id}
                {@const isCorrect = isSubmitted && option.isCorrect}
                {@const isWrong = isSubmitted && isSelected && !option.isCorrect}
                
                <button
                    onclick={() => selectOption(option.id)}
                    disabled={isSubmitted}
                    class="relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all text-center group min-h-[160px] w-full
                        {isSubmitted ? 'cursor-default' : 'hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg active:scale-[0.99]'}
                        {isSelected && !isSubmitted ? 'border-primary bg-primary/5 shadow-inner' : 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border'}
                        {isCorrect ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' : ''}
                        {isWrong ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400' : ''}"
                >
                    <!-- Status Indicator -->
                    <div class="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        {isSelected || isCorrect || isWrong ? 'border-transparent' : 'border-border dark:border-dark-border'}
                        {isSelected && !isSubmitted ? 'bg-primary' : ''}
                        {isCorrect ? 'bg-green-500' : ''}
                        {isWrong ? 'bg-red-500' : ''}">
                        {#if isCorrect}
                            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                            </svg>
                        {:else}
                            <div class="w-2 h-2 rounded-full bg-white {isSelected ? 'opacity-100' : 'opacity-0'}"></div>
                        {/if}
                    </div>
                    
                    <div class="text-lg font-medium leading-relaxed w-full">
                        {@render renderContent(option.content)}
                    </div>
                </button>
            {/each}
        </div>

        <!-- Actions Section -->
        <div class="flex items-center justify-end gap-4 md:gap-8 flex-shrink-0 pt-6 border-t border-border/30 dark:border-dark-border/30">
            <div class="flex items-center gap-4">
                {#if isSubmitted && !isCorrectAnswer}
                    <button 
                        onclick={reset}
                        class="px-6 md:px-8 py-3 rounded-xl font-bold border-2 border-border dark:border-dark-border hover:bg-surface-variant transition-all hover:shadow-md active:scale-95 text-sm md:text-base whitespace-nowrap"
                    >
                        Try Again
                    </button>
                {/if}
                
                <button
                    onclick={submit}
                    disabled={selectedId === null || isSubmitted}
                    class="px-8 md:px-12 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary-variant hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-base md:text-lg whitespace-nowrap"
                >
                    Check Answer
                </button>
            </div>
        </div>
    </div>
{/snippet}

<VSplitDiv 
    leftSide={leftSideSnippet} 
    rightSide={rightSideSnippet} 
    {prev} 
    next={isCorrectAnswer ? next : undefined} 
/>
