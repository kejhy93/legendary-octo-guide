# GIT Cheatsheet — Interactive Rebase

## What is a Rebase?

A rebase replays commits from one base onto another base. Conceptually, Git takes a set of commits, temporarily removes them, and applies them again one by one on top of a new base. This means commit hashes change, history becomes linear, and the result looks as if the commits were created in a different order or combined differently.

Unlike a merge, which creates a new "merge commit" that ties two branches together, a rebase rewrites history so it appears as a straight line. This produces a cleaner, more readable `git log` and makes it easier to trace when and why a change was introduced.

---

## What is Interactive Rebase?

Interactive rebase lets you edit the commit sequence **before** Git replays it. You decide, commit by commit, what should happen: keep it, reword it, squash it with another, drop it entirely, and more.

```bash
git rebase -i <base>
```

The most common form targets the last N commits on the current branch:

```bash
git rebase -i HEAD~5
```

This opens your configured editor with a list like this:

```
pick a1b2c3d Add user entity
pick d4e5f6g Add repository layer
pick h7i8j9k Fix typo in repository
pick l0m1n2o Add service layer
pick p3q4r5s Fix tests
```

Commits are listed from **oldest (top) to newest (bottom)** — the opposite of `git log`. You edit the verb in front of each hash, save the file, and Git carries out your instructions.

---

## Core Interactive Rebase Operations

| Command  | Purpose |
|----------|---------|
| `pick`   | Keep the commit as-is |
| `reword` | Keep the commit, edit its message |
| `edit`   | Pause to amend the commit |
| `squash` | Merge into previous commit, edit message |
| `fixup`  | Merge into previous commit, discard message |
| `drop`   | Remove the commit entirely |
| `exec`   | Run a shell command after a commit |

Each operation is described in detail in the sections below.

---

## Pick

`pick` is the default: replay the commit exactly as it was.

```
pick a1b2c3d Add user entity
```

Beyond keeping commits unchanged, you can also **reorder** them by simply rearranging lines in the editor:

```
pick a1b2c3d Add user entity
pick l0m1n2o Add service layer
pick d4e5f6g Add repository layer
```

### Use cases
- Fix incorrect logical order in the history
- Move refactors before the feature commits they enable
- Group related changes together for a cleaner review

### Caution
Reordering commits that depend on each other (e.g., one introduces a method that the next one calls) may produce merge conflicts during replay. Git will pause and let you resolve them before continuing.

---

## Squash & Fixup

Both operations combine a commit into the one that precedes it. The difference is what happens to the commit message.

### Squash

Opens an editor so you can compose a combined message from both commits:

```
pick a1b2c3d Add repository layer
squash h7i8j9k Fix typo in repository
```

Git pre-fills the editor with both messages, and you edit freely before saving.

### Fixup

Same merge, but the second commit's message is **silently discarded** — no editor opens:

```
pick a1b2c3d Add repository layer
fixup h7i8j9k Fix typo in repository
```

**Rule**: `squash` and `fixup` must always follow the commit they are merging into — they cannot appear on the first line.

### Typical pattern

```
pick A Main feature
fixup B Small fix
fixup C Formatting tweak
```

This is a very common cleanup workflow before merging a feature branch: collapse all "wip", "fix", and "oops" commits into a single, well-described commit.

---

## Reword

`reword` lets you change a commit message without touching its content.

```
reword a1b2c3d Add usr entity
pick   d4e5f6g Add repository layer
```

When Git reaches the `reword` line during replay, it pauses and opens your editor with the current message pre-filled. Save and close to continue the rebase.

### Use cases
- Fix typos in commit messages (e.g., "usr" → "user")
- Add a ticket or issue reference (e.g., `JIRA-1234`)
- Clarify vague messages like "fix" or "wip" before a code review

### Note
The commit content stays identical — only the message changes. Because the message is part of what Git hashes, the commit hash **will** change even though the diff is the same.

---

## Edit

`edit` pauses the rebase at the marked commit so you can make changes before continuing. This is the most flexible operation.

```
pick   a1b2c3d Add user entity
edit   d4e5f6g Add repository layer
pick   h7i8j9k Add service layer
```

When Git pauses, you are sitting right on that commit. Common actions:

### Amend the commit (add or change files)

```bash
git add <file>
git commit --amend
```

### Split the commit into smaller ones

```bash
git reset HEAD~1        # undo the commit but keep changes in working tree
git add -p              # stage changes selectively (interactive patch mode)
git commit -m "Part 1"
git add -p
git commit -m "Part 2"
```

When you are satisfied, resume the rebase:

```bash
git rebase --continue
```

---

## Splitting a Commit — By Whole Files

When a single commit bundles changes from logically separate files, the cleanest split is by staging files individually.

Mark the commit with `edit`:

```
pick   a1b2c3d Add user entity
edit   d4e5f6g Add repository layer and service layer
pick   h7i8j9k Fix tests
```

Git pauses at that commit. Undo it but keep all changes in the working tree:

```bash
git reset HEAD~1
```

Now stage and commit each logical group separately:

```bash
git add src/repository/UserRepository.java
git commit -m "Add repository layer"

git add src/service/UserService.java
git commit -m "Add service layer"
```

Continue the rebase:

```bash
git rebase --continue
```

**Result**: one commit becomes two, each with its own focused message and diff.

---

## Splitting a Commit — Using Patches

When changes to the **same file** belong to different logical units, use `git add -p` (interactive patch staging) to split them at the hunk level.

Mark the commit with `edit` and reset it:

```bash
git reset HEAD~1
```

Start interactive staging for the file:

```bash
git add -p src/UserService.java
```

Git shows each changed hunk and asks what to do:

```
@@ -10,6 +10,12 @@ public class UserService {
+    public User findById(Long id) { ... }
+    public List<User> findAll() { ... }

Stage this hunk [y,n,q,a,d,s,?]?
```

| Key | Action |
|-----|--------|
| `y` | stage this hunk |
| `n` | skip this hunk |
| `s` | split hunk into smaller pieces |
| `e` | manually edit the hunk |
| `q` | quit, leave remaining hunks unstaged |

Commit the staged hunks, then repeat for the next logical group:

```bash
git commit -m "Add user query methods"

git add -p src/UserService.java   # stage remaining hunks
git commit -m "Add user mutation methods"
```

Finish the rebase:

```bash
git rebase --continue
```

**Tip**: run `git diff --staged` between `add -p` rounds to review exactly what will go into the next commit before you commit it.

---

## Drop

`drop` removes a commit from history entirely. The changes it introduced are discarded.

```
pick   a1b2c3d Add user entity
drop   d4e5f6g Experimental change
pick   h7i8j9k Add service layer
```

**Shortcut** — simply delete the line instead of writing `drop`:

```
pick   a1b2c3d Add user entity
pick   h7i8j9k Add service layer
```

### Use cases
- Remove debug or WIP commits that were never meant to stay
- Clean up commits that were reverted later in the same branch
- Discard accidental commits (e.g., committed to the wrong branch)

### Caution
If later commits depend on the code introduced by the dropped commit, Git will encounter conflicts during replay. You will need to resolve them or abort the rebase.

---

## Exec

`exec` runs a shell command after the specified commit. If the command exits with a non-zero code, the rebase pauses so you can investigate and fix the issue before continuing.

```
pick   a1b2c3d Add user entity
exec   ./gradlew test
pick   d4e5f6g Add repository layer
exec   ./gradlew test
```

### Use cases
- Run the test suite after each commit to pinpoint exactly which commit broke something
- Verify the project compiles at every step in the history
- Run a linter or formatter check across all commits

### Apply a command after every commit automatically

Instead of typing `exec` after each line, use the `--exec` flag:

```bash
git rebase -i HEAD~5 --exec "./gradlew test"
```

This inserts an `exec` line after every commit automatically.

---

## Handling Conflicts During Rebase

Conflicts can occur when Git cannot automatically apply a commit on top of the new base. This is normal and recoverable.

**When a conflict happens**

```
CONFLICT (content): Merge conflict in src/UserService.java
error: could not apply a1b2c3d... Add user entity
```

**Resolve it**

```bash
# 1. Open the file and fix the conflict markers (<<<<<<<, =======, >>>>>>>)
# 2. Stage the resolved file
git add src/UserService.java

# 3. Continue the rebase
git rebase --continue
```

**Other options**

```bash
git rebase --skip       # discard this commit and move on (use with caution)
git rebase --abort      # cancel the entire rebase, restore original state
```

**Tip**: `git rebase --abort` is always safe — it returns your branch to exactly the state it was in before you started the rebase. When in doubt, abort and try again.

---

## Summary

| Command  | Changes content | Changes message | Removes commit |
|----------|:--------------:|:---------------:|:--------------:|
| `pick`   | no  | no  | no  |
| `reword` | no  | yes | no  |
| `edit`   | yes | yes | no  |
| `squash` | yes | yes | no  |
| `fixup`  | yes | no  | no  |
| `drop`   | —   | —   | yes |
| `exec`   | —   | —   | —   |

### Golden Rules

1. **Always work on a feature branch** — never rebase commits that have been pushed to a shared/public branch. Rewriting shared history forces everyone else to reconcile their local copy.
2. **`git rebase --abort` is your safety net** — if something goes wrong mid-rebase, abort and start over rather than trying to salvage a broken state.
3. **Use `git reflog` to recover** — even after a completed rebase, `git reflog` shows every state your branch has been in. You can reset to a pre-rebase SHA if needed.
