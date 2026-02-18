{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/1cd347bf3355fce6c64ab37d3967b4a2cb4b878c.tar.gz") { } }:

pkgs.mkShell {
  name = "svelte-faust-dev";

  buildInputs = with pkgs; [
    faust
    bun
  ];
}