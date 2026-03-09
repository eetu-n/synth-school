#!/usr/bin/env sh
set -e

FAUST2WASM_SCRIPT="./node_modules/@grame/faustwasm/scripts/faust2wasm.js"
BASE_OUT_DIR="src/lib/dsp/generated"

# Check if the faust2wasm script exists
if [ ! -f "$FAUST2WASM_SCRIPT" ]; then
    echo "Error: faust2wasm.js script not found at $FAUST2WASM_SCRIPT" >&2
    echo "Please ensure your node modules are installed correctly by running 'npm install' or 'bun install'." >&2
    exit 1
fi

# Create the base directory
mkdir -p "$BASE_OUT_DIR"

echo "Starting Faust DSP compilation..."

for f in src/lib/dsp/*.dsp; do
  NAME=$(basename "$f" .dsp)
  OUT_DIR="$BASE_OUT_DIR/$NAME"

  # Skip files that don't have a process defined (likely library files)
  if ! grep -q "process" "$f"; then
      echo "Skipping $f (no 'process' defined, assuming library)"
      continue
  fi
  
  # Check if this is best way to check for poly
  POLY_FLAG=""
  if grep -q "\[nvoices:" "$f"; then
      POLY_FLAG="-poly"
  fi
  
  echo "Compiling $f -> $OUT_DIR $POLY_FLAG"
  
  bun "$FAUST2WASM_SCRIPT" "$f" "$OUT_DIR" $POLY_FLAG -no-template
done

echo "Faust DSP compilation finished successfully."
