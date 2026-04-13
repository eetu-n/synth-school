<script lang="ts">
    interface Props {
        mobileText: string;
        desktopText: string;
        breakpoint?: number;
    }

    let { mobileText, desktopText, breakpoint = 768 }: Props = $props();

    let isMobile: boolean = $state(false);

    $effect(() => {
        const updateSize = () => {
            isMobile = window.innerWidth < breakpoint;
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => window.removeEventListener("resize", updateSize);
    });
</script>

<span>
    {isMobile ? mobileText : desktopText}
</span>
