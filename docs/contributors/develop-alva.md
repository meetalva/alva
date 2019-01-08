---
tags:
  - contributing
---

# Howto: Develop Alva

:woman_student: **Level**: Expert

## What to expect

Shows how to build Alva from sources. Most likely
this is interesting to you if you want to contribute
code changes to Alva or try out features that are not 
released yet.

**After following the steps below you have a working dev setup for Alva**

## Prerequesites

* :evergreen_tree: [git](https://git-scm.com/downloads)
* :turtle: [Node.js](https://nodejs.org/en/) `>= 8`
* :cat2: [yarn](https://yarnpkg.com/en/)
* :computer: A terminal emulator 
* :globe_with_meridians: Internet connection


## Fetch and prepare project

Open a terminal and enter

```sh
git clone https://github.com/meetalva/alva.git
cd alva
yarn
```

## Start the build processes

```
yarn run watch
```

## Start Alva

```sh
yarn alva # start electron version
# alternatively:
# yarn alva --host=node
# yarn alva --host=static --serve
```
