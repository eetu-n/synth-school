export function useDpr() {
  let dpr = $state(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  $effect(() => {
    if (typeof window === "undefined") return;

    dpr = window.devicePixelRatio || 1;
    const media = window.matchMedia(`(resolution: ${dpr}dppx)`);
    const update = () => {
      dpr = window.devicePixelRatio || 1;
    };

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  });

  return {
    get current() {
      return dpr;
    },
  };
}
