# Example Integrations

> A few examples using `dimport` and its various modes

Here we have a modern [TodoMVC](http://todomvc.com/) application, built with:

* [Preact](https://preactjs.com/) and [`htm`](https://github.com/developit/htm)
* ESM `export`, `import`, and `import()` statments

There is _no bundling or pre-processing of any kind_.<br>
All dependencies are declared through `import` statements to [unpkg.com](https://unpkg.com/).<br>

Because of [`dimport`](https://github.com/lukeed/dimport), we are able to serve this ultra-modern application to ***all*** browsers!<br>
The examples below illustrate `dimport`'s flexibilty, as well as how little needs to change in order to accomodate your support targets.


## Examples

* **index.html**<br>
  [View Source](./index.html)<br>
  _Mounts a `module` and `nomodule` script tag, each pointing to the **same** application file._

* **inline.html**<br>
  [View Source](./inline.html)<br>
  _Illustrates `dimport`'s ability to parse inline script text – an alternative to `data-main` usage._

* **legacy.html**<br>
  [View Source](./legacy.html)<br>
  _Allows the ESM-driven application to run anywhere, even in Internet Explorer!<sup>*</sup>_

> <sup>*</sup> While true for `dimport`, this example won't run in IE because its use of `let`, arrow functions, and template literals.

## Setup

Run a HTTP file server on this directory to explore the samples.<br>
If you do not have any, the local `package.json` can install and run a [`sirv`](https://github.com/lukeed/sirv) server for you:

```sh
$ npm install
$ npm start
```

## License

MIT © [Luke Edwards](https://lukeed.com)
