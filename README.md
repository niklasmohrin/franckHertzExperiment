# Franck Hertz Experiment

Simulation of the Quantum Physics experiment by James Franck and Gustav Hertz.

## Updating Dependencies

To update the dependency versions in `package.json`, run `./node_modules/.bin/ncu --upgrade` (from the `npm-check-updates` package).

## Building for Windows

To build a Windows executable, `electron-builder` can be used. To get a signed executable, this should be done on Windows, because the signing setup guide for Linux is somewhat long. To build an unsigned executable anywhere with `docker`, run

```fish
docker run -v $(pwd):/mnt --rm -it electronuserland/builder:18-wine bash -c 'cd /mnt; yarn; yarn run dist --win'
```

Afterwards, the files can be found in the `dist/` directory.

Links:
- https://www.electron.build/configuration/nsis#portable
- https://www.electron.build/code-signing
- https://www.electron.build/multi-platform-build#to-build-app-for-windows-on-linux
