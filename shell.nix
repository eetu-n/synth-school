{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/1cd347bf3355fce6c64ab37d3967b4a2cb4b878c.tar.gz") { } }:

let
  bun-baseline = pkgs.bun.overrideAttrs (oldAttrs: rec {
    version = oldAttrs.version;
    src = pkgs.fetchurl {
      url = "https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-linux-x64-baseline.zip";
      hash = "sha256-KB5sutlp6y9e9XJMbLoB2kDNX+rW+CksUO1gvU26eK4=";
    };
  });
in
pkgs.mkShell {
  name = "svelte-faust-dev";

  buildInputs = with pkgs; [
    faust
    bun-baseline
  ];
}
