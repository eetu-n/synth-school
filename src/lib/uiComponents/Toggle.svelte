<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        checked?: boolean;
    }

    let { checked = $bindable(false), children, ...rest }: Props = $props();
</script>

<style>
    .toggle-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      cursor: pointer;
    }

    /* The switch - the box around the slider */
    .switch {
      position: relative;
      display: inline-block;
      width: 2em;
      height: 1.1em;
      flex-shrink: 0;
    }

    /* Hide default HTML checkbox */
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }

    /* The slider */
    .slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 0.9em;
      width: 0.9em;
      left: 0.1em;
      bottom: 0.1em;
      background-color: white;
      -webkit-transition: .2s;
      transition: .2s;
    }

    input:checked + .slider {
      background-color: #ccc;
    }

    input:focus-visible + .slider {
      outline: 2px solid #ccc;
      outline-offset: 2px;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(0.9em);
      -ms-transform: translateX(0.9em);
      transform: translateX(0.9em);
    }

    /* Rounded sliders */
    .slider.round {
      border-radius: 1.1em;
    }

    .slider.round:before {
      border-radius: 50%;
    }
</style>

<label class="toggle-container">
    <div class="switch">
        <input 
            type="checkbox" 
            bind:checked={checked}
            {...rest}
        />
        <span class="slider round"></span>
    </div>
</label>
