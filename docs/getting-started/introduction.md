---
title: Introduction
description: What Thread Weaver does, and what it deliberately does not do.
---

# Introduction

A long post is hard to read on a timeline. Thread Weaver splits that post into a sequence of shorter posts before you publish it.

## Who it is for

Use it when you already have the words and you need them to fit a character limit. The tool is a workbench, not a social network. It does not sign you in, and it does not keep a history of what you wrote.

## What stays on your machine

Splitting, markers, totals, and the download file are computed in the page. Copy uses the browser clipboard. Listen uses a voice already installed on the machine, and it follows the language written on the card: English, German, or Thai. Send opens the platform's compose page in a new tab and leaves the actual post to you.

The only remote call is the QR image. Send to Phone asks `api.qrserver.com` for a picture of the current post. Everything else stays local.

## Languages

The switcher at the top right opens English at `/`, German at `/de`, and Thai at `/th`. The address picks that language. The browser language does not redirect. Listen still follows the card, so a German post on the English page is read in German.

## Version

The project is version **1.0.0**. That is the production release. Leave `package.json` on that number unless the maintainer asks for a bump.
