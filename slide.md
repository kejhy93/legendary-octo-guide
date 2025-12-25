# GIT Cheatsheet
## Interactive Rebase

A rebase replays commits from one base onto another base.

Conceptually, Git:
- Takes a set of commits
- Temporarily removes them
- Applies them again, one by one, on top of a new base

This means:
- Commit hashes change
- History becomes linear
- The result looks as if the commits were created in a different order or combined differently
---

## What is interactive rebase?

Interactive rebase lets you edit the commit sequence before Git replays it.

```bash
git rebase -i <base>
```

Typical usage:
```bash
git rebase -i HEAD~5
```
This opens an editor with something like this:
```
pick a1b2c3d Add user entity
pick d4e5f6g Add repository layer
pick h7i8j9k Fix typo in repository
pick l0m1n2o Add service layer
pick p3q4r5s Fix tests
```
These commits are listed from oldest (top) to newest (bottom).

---

## Core interactive rebase operations
- pick
- squash
- fixup
- edit
- reword
- drop
- less common commands

---

## Pick
### Default
```
pick a1b2c3d Add user entity
```
Means: replay the commit as-is.

### Changing commit order
You can reorder commits simply by reordering lines.
```
pick a1b2c3d Add user entity
pick l0m1n2o Add service layer
pick d4e5f6g Add repository layer
```
it will replay commits in this new order.

Use cases
- Fix incorrect logical order
- Move refactors before feature commits
- Group related changes together

Caution
- Reordering commits that depend on each other may cause conflicts

---

## Squash && Fixup
### Squash
Squashing combines multiple commits into one.
```
pick a1b2c3d Add repository layer
squash h7i8j9k Fix typo in repository
```

Result:
- Both commits become one
- You are prompted to edit the combined commit message

### Fixup
```
pick a1b2c3d Add repository layer
fixup h7i8j9k Fix typo in repository
```

Result:
- Commits are combined
- The second commit message is discarded

Rule
squash / fixup must always follow the commit they are merging into

Typical pattern
```
pick A Main feature
fixup B Small fix
fixup C Formatting
```
---

