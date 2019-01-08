---
tags:
  - contributing
---

# Howto: Test autupdater

:woman_student: **Level**: Expert

## What to expect

This shows how to get a local dev setup for 
autoupdater going.


## Prerequesites

* :evergreen_tree: [git](https://git-scm.com/downloads)
* :turtle: [Node.js](https://nodejs.org/en/) `>= 8`
* :cat2: [yarn](https://yarnpkg.com/en/)
* :computer: A terminal emulator 
* :globe_with_meridians: Internet connection


## 1. Install minio

Install minio on your local machine: [Download Minio](https://www.minio.io/downloads.html).
This will provide an AWS S3 like service on your localhost for electron-autoupdate to use.

On macOS:

```
brew install minio/stable/minio
brew install minio/stable/mc
```

## 2. Start and setup minio

Open a terminal and enter

```sh
mkdir -p ~/data/electron-updater
minio ~/data/electron-updater # Starts on localhost:9000
```

Take note of the `AccessKey` and `SecretKey` that are logged:

```
$ minio server ~/data/

Endpoint:  http://127.0.0.1:9000
AccessKey: [some-key]
SecretKey: [some-secret]

Browser Access:
   http://127.0.0.1:9000

Command-line Access: https://docs.minio.io/docs/minio-client-quickstart-guide
   $ mc config host add myminio http://127.0.0.1:9000 [some-key] [some-secret]
```

## 3. Create a testing bucket with mc

```
mc config host add electron-builder http://192.168.2.103:9000 [some-key] [some-secret]
mc mb electron-builder/electron-builder
```

## 4. Trigger a version bump for `@meetalva/core`

Edit `package.json` to specify a higher version, e.g. 
`0.8.0` => `1.0.0`.

```json
{
   "version": "1.0.0"
}
```

## 5. Modify publish config

In `packages/core/package.json`, add the following:

```json
{
  "build": {
    "publish": {
      "provider": "s3",
      "bucket": "electron-builder",
      "endpoint": "http://localhost:9000"
    }
  }
}
```

## 5. Publish an update to local minio

> :warning:
> Both builds created when following these steps
> must be signed for autoupdates to work

```sh
cd packages/core 
AWS_ACCESS_KEY_ID=[some-key] AWS_SECRET_ACCESS_KEY=[some-secret] yarn electron-builder --publish always
```

## 6. Reset the version

Change the version in `packages/core/package.json` back

```sh
{
   "version": "0.8.0"
}
```

## 7. Create another "older" build

```sh
yarn electron-builder
```

## 8. Start the "older" build

```
./dist/mac/Alva.app/Contents/MacOS/Alva
```

The "older" build should download and subsequently show the new version 
being available for installation.
