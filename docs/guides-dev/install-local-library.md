---
displayName: 1. Install a local library

tags:
  - guide
  - dev

options:
  order: 1
---

# Install a Local Library

> :information_source: This guide teaches how to connect an Alva project to a local library with the Alva Design Library as example. 

> For a guide on how to create a custom pattern library from scratch, see [Create a custom Library](./doc/docs/guides/create-library?guides-enabled=true).

---

In this guide you will learn how to bring your prototype to live by connecting it to a pattern library. We'll also have a look on how to use the connected patterns.

This will involve a bit of work in the terminal. Don't worry if you are unfamliar with the terminal, we'll have you covered with a detailed step by step guide.

## You'll need

* :computer: Terminal
* :evergreen_tree: Git – [Install](https://git-scm.com/)
* :turtle: Node.js `v8` – [Install](https://nodejs.org/en/)


## 1. Clone Alva Design Library

Open a Terminal window. Type the following command into your terminal.

```
git clone https://github.com/meetalva/alva-design.git
```

Press enter to execute the command and download the code from [github.com/meetalva/alva-design](https://github.com/meetalva/alva-design) into a new local folder called `alva-design`.

If everything worked you should see output resembling this:

```
Cloning into 'alva-design'...
remote: Counting objects: 1409, done.
remote: Compressing objects: 100% (194/194), done.
Resolving deltas: 100% (660/660), done.
```

## 2. Prepare Alva Design Library for Analysis

Next we have to "build" Alva Design Library from the source files we just cloned. 
We do this to make Alva's life easier when it tries to understand the library's code.

Change into the `alva-design` folder with the following terminal command.

```
cd alva-design
```

Then install the library's dependencies by typing

```
npm install
```

Depending on your connection speed this may take a while.

On success the last line of your terminal should look roughly like this:

```
added 1059 packages in 13.795s
```

Let's create the build results for the Alva Desingkit now. You can do so by executing

```
npm run build
```

This will create JavaScript and typing files from the Alva Design Library TypeScript sources.

Run the following command and keep hold of the path that is printed to the terminal, we'll need it later:

```sh
echo $PWD
# /Users/alva-user/Desktop
```

## 3. Connect Alva Design Library to Alva 

The Alva Design Library is now ready to be connected to Alva. Start Alva and create a new project by hitting `Create New Alva File` on the right side of the welcome screen

![](https://media.meetalva.io//splash.svg)

---

Alva will display a fresh, empty file. On the right side of the window you can find a "Connect a library" teaser. Hit the "Connect" button.

![](https://media.meetalva.io/connect-teaser.svg)

---

In the file dialog that opens, locate the Alva Design Library we cloned in step 2. Remember the last command `echo $PWD`? At the path your terminal printed for this command you can find the Alva Design Library.

Make sure to select the `package.json` file in the `alva-design` folder. 

Analysing the Alva Design Library should take Alva just a few seconds. 
You can verify everything worked if the library pane looks roughly like the screenshot below. 

![](https://media.meetalva.io/libraries.svg)

Notice the second library with the green "Connected" indicator? That is the Alva Design Library we just added.

---

## 4. Put connected Patterns to use

Apart from listing the Alva Design Library in the libraries pane, connecting it had a second more subtle effect. 
If you scroll down in your patterns list, you can find new patterns:

![](https://media.meetalva.io/pattern-list.png)

Let's put what we learned in the [Essentials](./doc/docs/guides/essentials?guides-enabled=true) guide to use and 
put a Alva Design Library button element in our prototype. Double click on the button pattern. Alva should render an empty button element on the preview. Change the `Order` property to `Primary` to give it a nice solild background.

![](https://media.meetalva.io/empty-button.png)

Next, let's add some text to the button. Locate the `Text` pattern in the pattern list and drag it onto the
button. Then change its text property to something, e.g. "Hello there.". 

Your Alva screen should look like this now:

![](https://media.meetalva.io/text-button.png)

:tada: Congratulations! You just used your first third-party code pattern in Alva. 

---

## Next

* **Next**: [Interaction](./doc/docs/guides/interaction?guides-enabled=true)
