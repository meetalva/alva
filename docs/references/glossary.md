---
tags:
  - reference
---

# Glossary

## Element

An instance inside Alvas Element tree. By configuring an Element's [properties](#property) the content, display or behaviour of the element may be controlled. Elements contain the information where which data should be rendered according to which [pattern](#pattern).

## Library

A collection of code [Patterns](#pattern) that can be analyzed and used by Alva. This means a [NPM package](https://docs.npmjs.com/getting-started/packages#what-is-a-package-) that provides React component imlementations and TypeScript typings.

## Pattern

The React component implementation and API description required for Alva to detect, configure and render parts of the prototype with. A pattern contains the information which [Properties](#property) are configurable with which data types for [Element](#element) instances created from it.
