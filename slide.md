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

After saving and closing the editor, Git replays the commits according to your instructions.

---

## Core interactive rebase operations

| Command | Purpose |
|---------|---------|
| `pick`    | Keep the commit as-is |
| `reword`  | Keep the commit, edit its message |
| `edit`    | Pause to amend the commit |
| `squash`  | Merge into previous commit, edit message |
| `fixup`   | Merge into previous commit, discard message |
| `drop`    | Remove the commit entirely |
| `exec`    | Run a shell command after a commit |

---

## Pick

### Default
```
pick a1b2c3d Add user entity
```
Means: replay the commit as-is, no changes.

### Changing commit order
Reorder lines to replay commits in a new order:
```
pick a1b2c3d Add user entity
pick l0m1n2o Add service layer
pick d4e5f6g Add repository layer
```

**Use cases**
- Fix incorrect logical order
- Move refactors before feature commits
- Group related changes together

**Caution**
- Reordering commits that depend on each other may cause conflicts

---

## Squash & Fixup

### Squash
Combines multiple commits into one and lets you edit the resulting message:
```
pick a1b2c3d Add repository layer
squash h7i8j9k Fix typo in repository
```
Result: both commits become one, Git opens an editor to write the combined message.

### Fixup
Same as squash but silently discards the second commit's message:
```
pick a1b2c3d Add repository layer
fixup h7i8j9k Fix typo in repository
```

**Rule**: `squash` / `fixup` must always follow the commit they are merging into.

**Typical pattern**
```
pick A Main feature
fixup B Small fix
fixup C Formatting tweak
```

---

## Reword

Lets you change a commit message without touching its content.

```
reword a1b2c3d Add usr entity
pick   d4e5f6g Add repository layer
```

When Git reaches the `reword` line, it pauses and opens your editor with the current message pre-filled. Save and close to continue the rebase.

**Use cases**
- Fix typos in commit messages
- Add ticket/issue references
- Clarify vague messages like "fix" or "wip"

**Note**: the commit content stays identical — only the message changes, so the hash will still change.

---

## Edit

Pauses the rebase at the marked commit so you can modify it before continuing.

```
pick   a1b2c3d Add user entity
edit   d4e5f6g Add repository layer
pick   h7i8j9k Add service layer
```

When Git pauses you are on that commit. Common actions:

**Amend the commit**
```bash
git add <file>
git commit --amend
```

**Split the commit into smaller ones**
```bash
git reset HEAD~1        # unstage the commit
git add -p              # stage selectively
git commit -m "Part 1"
git add -p
git commit -m "Part 2"
```

When done, continue the rebase:
```bash
git rebase --continue
```

---

## Splitting a commit — by whole files

Mark the commit you want to split with `edit`:
```
pick   a1b2c3d Add user entity
edit   d4e5f6g Add repository layer and service layer
pick   h7i8j9k Fix tests
```

Git pauses at that commit. Undo it but keep the changes in the working tree:
```bash
git reset HEAD~1
```

Now stage and commit each logical group as a separate file:
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

**Result**: one commit becomes two, each with its own focused message.

---

## Splitting a commit — using patches

When changes to the same file belong to different logical units, split them with `git add -p` (interactive patch staging).

Mark the commit with `edit` and reset it:
```bash
git reset HEAD~1
```

Start interactive staging:
```bash
git add -p src/UserService.java
```

Git shows each hunk and asks what to do:
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

**Tip**: use `git diff --staged` between `add -p` rounds to review exactly what will go into the next commit.

---

## Drop

Removes a commit from history entirely.

```
pick   a1b2c3d Add user entity
drop   d4e5f6g Experimental change
pick   h7i8j9k Add service layer
```

Shortcut — delete the line instead of writing `drop`:
```
pick   a1b2c3d Add user entity
pick   h7i8j9k Add service layer
```

**Use cases**
- Remove debug or WIP commits
- Clean up commits that were reverted later
- Discard accidental commits

**Caution**: if later commits depend on the dropped commit, you will get conflicts.

---

## Exec

Runs a shell command after the specified commit. Useful for automated checks during a rebase.

```
pick   a1b2c3d Add user entity
exec   ./gradlew test
pick   d4e5f6g Add repository layer
exec   ./gradlew test
```

If the command exits with a non-zero code, the rebase pauses so you can fix the issue before continuing.

**Use cases**
- Run tests after each commit to find which commit broke them
- Verify the build compiles at every step
- Run a linter across the history

**Apply a command after every commit automatically**
```bash
git rebase -i HEAD~5 --exec "./gradlew test"
```

---

## Handling conflicts during rebase

Conflicts can occur when Git cannot automatically apply a commit.

**When a conflict happens**
```
CONFLICT (content): Merge conflict in src/UserService.java
error: could not apply a1b2c3d... Add user entity
```

**Resolve it**
```bash
# 1. Fix the conflict markers in the file
# 2. Stage the resolved file
git add src/UserService.java

# 3. Continue
git rebase --continue
```

**Other options**
```bash
git rebase --skip       # discard this commit and move on
git rebase --abort      # cancel the entire rebase, restore original state
```

**Tip**: `git rebase --abort` is always safe — it returns your branch to exactly where it was before you started.

---

## Summary

| Command  | Changes content | Changes message | Removes commit |
|----------|:--------------:|:---------------:|:--------------:|
| `pick`   | no | no | no |
| `reword` | no | yes | no |
| `edit`   | yes | yes | no |
| `squash` | yes | yes | no |
| `fixup`  | yes | no | no |
| `drop`   | — | — | yes |
| `exec`   | — | — | — |

**Golden rules**
- Always work on a feature branch, never rebase shared/public branches
- When in doubt, `git rebase --abort` is your safety net
- Use `git reflog` to recover if something goes wrong
