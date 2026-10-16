# Verification log

Plan [§3.7](plans/2026-08-17-answer-quality.md). One section per topic, written
when that topic's Phase 4 pass runs, recording the date of the pass and every
claim it changed — with the source that settled it.

There is deliberately no `verified: true` field in the corpus. A boolean would
be stale the moment anything around it moved, and it would promise the reader a
guarantee this repo cannot keep. A dated log of what was actually read, and what
actually changed, is the honest version of the same thing.

Two rules for entries. **Record the settled ones too** — a claim that survived
the check is worth a line, because the next pass should not re-open it. And
**name the source, not the search** — the line that decided it, quoted where the
wording matters.

---

## android — 2026-10-16

Seven questions read: the five lifecycle answers the triage file named as the
most-read in the bank (9, 10, 11, 13, 14), plus the two it flagged as carrying
version-specific platform behaviour (84, 100).

### Corrected

**`android-save-restore-instance-state` — `onSaveInstanceState()` was on the
wrong side of `onStop()`.** The answer said it is "called **before**
`onStop()` (and after `onPause()`)". Both halves are wrong. The `Activity`
reference: *"If called, this method will occur after `onStop()` for applications
targeting platforms starting with `Build.VERSION_CODES.P`. For applications
targeting earlier platform versions this method will occur before `onStop()` and
there are no guarantees about whether it will occur before or after
`onPause()`."* So it is after `onStop()` for anything targeting API 28 or
higher — which is every app shipping today — and even on the old path the
`onPause()` ordering was never guaranteed. The Fragment lifecycle guide states
the same split in its Figure 2.
Source: [Activity](https://developer.android.com/reference/android/app/Activity),
[Fragment lifecycle](https://developer.android.com/guide/fragments/lifecycle).

**`android-activity-lifecycle` — `onPause()` described split-screen as an
example when the docs use it as the counter-example.** The answer read
"partially obscured (e.g. dialog on top, split-screen)". The guide says the
opposite: *"a Paused activity might still be fully visible if the app is in
multi-window mode. Consider using `onStop` instead of `onPause` to fully release
or adjust UI-related resources and operations to better support multi-window
mode."* Rewritten to say focus is what is lost, and to point release work at
`onStop()`.
Source: [The activity lifecycle (Views)](https://developer.android.com/topic/libraries/architecture/views/activity-lifecycle-views).

**`android-activity-lifecycle` — the interview tip had the skipping backwards.**
It claimed `onPause()`→`onResume()` is "the guaranteed pair for any
interruption" while `onStop()`/`onDestroy()` may be skipped. The reference makes
a narrower and more useful point about `onDestroy()` alone: *"do not count on
this method being called as a place for saving data"*, because the system can
kill the hosting process *"without calling this method (or any others) in it"*.
Replaced with that.
Source: [Activity](https://developer.android.com/reference/android/app/Activity).

**`android-permission-levels` — "four protection levels" is the wrong shape, and
it omitted special permissions entirely.** `signature|privileged` is a flag
combination, not a fourth level. The overview page organises permissions as
three *types* — install-time (sub-typed into `normal` and `signature`), runtime
(`dangerous`), and **special** (`appop`) — and special permissions are the
category the answer was missing. That omission mattered: it is where
`SYSTEM_ALERT_WINDOW`, `MANAGE_EXTERNAL_STORAGE` and `SCHEDULE_EXACT_ALARM`
live, which is exactly why none of them can be obtained with a runtime request.
The `SCHEDULE_EXACT_ALARM` reference calls itself *"a special access permission"*
in as many words.
Source: [Permissions overview](https://developer.android.com/guide/topics/permissions/overview),
[Manifest.permission](https://developer.android.com/reference/android/Manifest.permission).

**`android-permission-levels` — the permission-group claim was folklore.** The
answer said granting one permission in a group "used to auto-grant the rest".
The docs make a stronger and more current point: *"permissions can change groups
without notice, so don't assume that a particular permission is grouped with any
other permission."* Grouping is a dialog-batching mechanism, not a grant rule.
Source: [Permissions overview](https://developer.android.com/guide/topics/permissions/overview).

**`android-scoped-storage` — five years out of date on permissions.** The answer
predated Android 13 entirely. Added the granular media permissions
(`READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`, API 33+) that
replaced `READ_EXTERNAL_STORAGE`; added that on Android 10 and higher no storage
permission at all is needed for media the app itself owns; and replaced the limp
"largely irrelevant now" tip with the fact that actually lands —
*"if your app targets Android 11 (API level 30) or higher, the
`WRITE_EXTERNAL_STORAGE` permission doesn't have any effect on your app's access
to storage."* Also corrected "enforced from Android 10" to *targets* Android 10,
which is what the docs say and a different claim.
Source: [Data and file storage overview](https://developer.android.com/training/data-storage),
[Access media files from shared storage](https://developer.android.com/training/data-storage/shared/media).

**`android-scoped-storage` — the Play review claim was vague.** "Requires
special Play Store review" is now dated and sourced: the policy evaluates apps
targeting API 30+ that request `MANAGE_EXTERNAL_STORAGE`, and has been in effect
since May 2021.
Source: [Manage all files on a storage device](https://developer.android.com/training/data-storage/manage-all-files).

### Settled — checked, correct, do not re-open

**`android-ondestroy-without-onpause-onstop` — the `finish()`-in-`onCreate()`
claim holds, verbatim.** *"You can call `finish()` from within this function, in
which case `onDestroy()` will be immediately called after `onCreate(Bundle)`
without any of the rest of the activity lifecycle (`onStart()`, `onResume()`,
`onPause()`, etc.) executing."* The same reference documents a second
short-circuit the answer did not have — `finish()` from `onStart()` jumps
straight to `onStop()` — which has been added.
Source: [Activity](https://developer.android.com/reference/android/app/Activity).

**`android-save-restore-instance-state` — "not called on back press or
`finish()`" holds.** *"`onSaveInstanceState` is not called when the user
explicitly closes the activity or in other cases when `finish` is called."* So
does `onRestoreInstanceState` running after `onStart()`, and only when there is
state to restore.
Source: [The activity lifecycle (Views)](https://developer.android.com/topic/libraries/architecture/views/activity-lifecycle-views),
[Activity](https://developer.android.com/reference/android/app/Activity).

**`android-save-restore-instance-state` — the 1MB Binder limit is real, and
worse than stated.** *"The Binder transaction buffer has a limited fixed size,
currently 1MB, which is shared by all transactions in progress for the
process."* Shared is the part the answer was missing: a `Bundle` can throw
`TransactionTooLargeException` well below 1MB. Kept and sharpened rather than
corrected.
Source: [TransactionTooLargeException](https://developer.android.com/reference/android/os/TransactionTooLargeException).

**`android-fragment-lifecycle` — the two-lifecycle gotcha holds.** *"A
fragment's view has a separate `Lifecycle` that is managed independently from
that of the fragment's `Lifecycle`."* Two additions from the same page:
`onViewStateRestored()` was missing from the callback list, and the guide now
prefers the `Fragment(@LayoutRes int)` constructor over overriding
`onCreateView()`.
Source: [Fragment lifecycle](https://developer.android.com/guide/fragments/lifecycle).

### Note on sources

The Activity lifecycle guide has been rewritten around Compose and no longer
documents `onSaveInstanceState` at all. The View-based callbacks now live on
**The activity lifecycle (Views)**, and the timing guarantees only exist in the
`Activity` API reference. Both have been added to the affected questions'
`referenceLinks`, because the page the answers already linked can no longer
settle the claims they make.

---

## kotlin-coroutines — 2026-10-16

Five questions, the two `verify` flags and the three `simplify` flags the triage
file raised. The triage note said no answer in this topic had failed on
accuracy and that two claims wanted sourcing. One of the two turned out to be
backwards.

### Corrected

**`coroutines-launch-vs-async` — the root-`async` claim was inverted.** The
answer said "a root-level `async` that's never awaited still crashes the app on
failure, same as `launch` — the exception isn't silently swallowed." The guide
says the exact opposite, and demonstrates it: `async` *"always catches all
exceptions and represents them in the resulting `Deferred` object, so its
`CoroutineExceptionHandler` has no effect either"*, and its sample throws from a
`GlobalScope.async` under the comment *"Nothing is printed, relying on user to
call await"*.

The distinction the answer was reaching for is real, but it runs the other way.
Builders "come in two flavors: propagating exceptions automatically (`launch`)
or exposing them to users (`async` and `produce`)", and that split applies
*"when these builders are used to create a root coroutine, that is not a child
of another coroutine"*. So a **root** `async` swallows; a **non-root** `async`
is a child, cancels its parent, and propagates like `launch`. Both halves are
now stated, with "root" defined in the answer rather than assumed.
Source: [Coroutine exceptions handling](https://kotlinlang.org/docs/exception-handling.html).

**`coroutines-exception-handling` — the same error, one question over.** It said
a `CoroutineExceptionHandler` does not catch `async` exceptions "unless the
`async` is itself the root coroutine". Root is precisely the case where the
handler has no effect. Rewritten against the same two sentences, and the
handler's actual rule added: it is *"invoked only on uncaught exceptions —
exceptions that were not handled in any other way"*, and children delegate
upward, so a handler in a child's context is never used.
Source: [Coroutine exceptions handling](https://kotlinlang.org/docs/exception-handling.html).

### Settled — checked, correct, do not re-open

**`coroutines-retrofit` — no `withContext(Dispatchers.IO)` needed. Confirmed,
and now sourced.** This is one of the most argued-about claims in Android, and
Retrofit's own changelog settles it for 2.6.0: *"Behind the scenes this behaves
as if defined as `fun user(...): Call<User>` and then invoked with
`Call.enqueue`."* `enqueue` runs on OkHttp's dispatcher, so the request and the
response parsing are both off the main thread. The answer's wording was loose in
one respect — it credited "Retrofit's coroutine adapter", but suspend functions
do not go through a call adapter at all — so the mechanism is now named
properly.
Source: [Retrofit CHANGELOG, 2.6.0](https://github.com/lysine-dev/retrofit/blob/trunk/CHANGELOG.md).

**`coroutines-what-are-they` and `coroutines-context` — accurate, only
unspeakable.** Nothing in either needed correcting. Both were rewritten under
§3.8 alone: CPS, `Continuation`, `CoroutineScope`, `CoroutineDispatcher` and
structured concurrency all stay; "lightweight, cooperative units of
concurrency", "indexed set of elements" and "immutable, persistent structure"
go, replaced by what they do.

**`CancellationException` is ignored by handlers.** Added to the exception
answer while the source was open, because its absence was why the previous
version read as if every exception reached a handler: *"Coroutines internally
use `CancellationException` for cancellation, these exceptions are ignored by
all handlers."*
Source: [Coroutine exceptions handling](https://kotlinlang.org/docs/exception-handling.html).

### Note on sources

`github.com/square/retrofit` now 301s to `github.com/lysine-dev/retrofit`. The
canonical URL is recorded, since `check-doc-links.js` treats a redirect as a
failure by design.
