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

---

## kotlin-flow-api — 2026-10-16

Three questions: one `verify`, two `simplify`. Opening the source turned up a
problem larger than the three, described at the end.

### Settled — checked, correct, do not re-open

**`flow-exception-handling` — `catch` and cancellation. The claim holds; the
mechanism was described wrongly.** The triage note said this one gets stated
incorrectly all over the internet, and the answer was one of the places doing
it: it said `catch` "rethrows" a `CancellationException` rather than treating it
as a normal error. The KDoc is narrower and more exact — `catch` *"is transparent
to exceptions that occur in downstream flow and does not catch exceptions that
are thrown to cancel the flow."* It never receives the exception, so there is
nothing to rethrow. Outcome for the reader is the same; the sentence an
interviewer is listening for is not.

Three things from the same KDoc were added while it was open: `catch` can
rethrow selectively (`if (e !is IOException) throw e`), an exception thrown from
its own action continues downstream to the next `catch`, and `retryWhen` is the
recommended way to retry — falling back with `emitAll` *"introduc[es an]
ever-growing stack of suspending calls."*
Source: [catch — kotlinx.coroutines API](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html).

**`flow-flowon` — accurate, and now uses the docs' own word.** Nothing was
wrong. The rewrite drops the undefined "region" the triage flagged and quotes
the guide instead: `flowOn` is *"context-preserving"* — it *"changes only the
coroutine context of the upstream flow while keeping the downstream flow in the
caller's context."* Added the reason the operator has to exist, which the answer
never gave: a `flow { }` builder may not change its own context, so an `emit()`
wrapped in `withContext` fails at runtime.
Source: [Flows — change the coroutine context with flowOn](https://kotlinlang.org/docs/coroutines-flow.html#change-the-coroutine-context-of-a-cold-flow-with-flowon).

**`flow-stateflow-sharedflow` — the question that prompted the plan. Accurate
throughout.** No claim changed. It was rewritten to §3.8's worked example, which
this plan drafted in advance: "StateFlow is a value you can observe. SharedFlow
is an event stream you can replay." `conflated`, `replay`, `distinct-until-
changed`, `extraBufferCapacity`, `DROP_OLDEST` all stay. "Dispatcher-aware",
"composes with the rest of the Flow operator set" and "specialized for
representing UI state" go, replaced by what they mean.

### Found while verifying: sixteen links to a page that no longer exists

`kotlinlang.org/docs/flow.html` is now a **stub that meta-refreshes** to
`coroutines-flow.html`. It answers 200, so `check-doc-links.js` passed it
happily — the checker follows HTTP redirects but cannot see an HTML one. Sixteen
references across the corpus pointed at it, and every anchor among them was
dead, because the Flow documentation was reorganised at the same time:

| Old anchor | Now |
|---|---|
| `#flow-context` | `coroutines-flow.html#change-the-coroutine-context-of-a-cold-flow-with-flowon` |
| `#exception-transparency` | `coroutines-flow.html#use-the-catch-operator-to-handle-upstream-exceptions` |
| `#flows-are-cold` | `coroutines-flow.html#cold-flows` |
| `#stateflow-and-sharedflow` | `coroutines-flow.html#hot-flows` |
| `#terminal-flow-operators` | `coroutines-flow-operators.html#terminal-operators` |
| `#debounce` | gone from the guide — now the `debounce` API reference |
| `#flattening-flows` | gone from the guide — now the `flatMapLatest` API reference |

All sixteen were rewritten in this commit rather than left for the topics that
own them, because it is one root cause and a mechanical fix; splitting it across
`kotlin`, `android-libraries` and the theory corpus would have left known-dead
anchors sitting in the tree for no gain. `kotlin` in particular has no `words`
flags at all, so its four would never have been reached.

**This is a gap in `check-doc-links.js`, not a one-off.** A meta-refresh stub
passes the check today. Worth closing, but not by guessing — recorded here so
the decision is made deliberately.

---

## java — 2026-10-16

Four questions, all flagged `simplify` and none flagged `verify`. The triage
file said so explicitly: *"Nothing flagged for verification. This is old,
stable, well-documented material and the answers are careful with it."*

Mostly true. But §3.8 rewrites are done with the source open, and two claims did
not survive the reading — both in sentences the triage pass had no reason to
doubt, because they are the kind of detail that was correct when written and
quietly stopped being so.

### Corrected

**`garbage-collector` — ZGC does not have sub-millisecond pauses, per the guide
this answer cites.** The answer said "`ZGC`/`Shenandoah` (very low pause,
sub-millisecond, for huge heaps)". The Java 17 tuning guide says ZGC *"provides
max pause times of a few milliseconds, but at the cost of some throughput"* —
and the throughput trade-off, which the answer omitted, is the part an
interviewer follows up on. Shenandoah is also not in that guide's list of
collectors at all; it names four, Serial, Parallel, G1 and ZGC. Corrected to
those four with the guide's own wording.
Source: [Oracle: Available Collectors](https://docs.oracle.com/en/java/javase/17/gctuning/available-collectors.html).

**`garbage-collector` — "G1, default since Java 9" is more absolute than the
docs are.** They say G1 is *"selected by default on most hardware and operating
system configurations"*, and, two paragraphs up, that the serial collector *"is
selected by default on certain hardware and operating system configurations"*.
Now quoted rather than rounded off.
Source: [Oracle: Available Collectors](https://docs.oracle.com/en/java/javase/17/gctuning/available-collectors.html).

**`atomic-operations` — `weakCompareAndSet` was deprecated, not renamed.** The
answer's parenthetical read "(renamed `weakCompareAndSetPlain` in newer JDKs)".
It was deprecated in Java 9 and still exists, and the javadoc gives a reason
worth repeating: *"This method has plain memory effects but the method name
implies volatile memory effects."* There are now four explicit variants —
`Plain`, `Acquire`, `Release`, `Volatile` — which is the actual answer to
"what happened to `weakCompareAndSet`".
Source: [Oracle: AtomicInteger](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html).

**`atomic-operations` — `lazySet` is a release store, not an eventual one.** The
answer said it "writes eventually, without the immediate cross-thread visibility
guarantee or a full memory fence". The javadoc pins it exactly: `lazySet` has
*"memory effects as specified by `VarHandle.setRelease`"*. Release ordering is a
real guarantee — earlier writes cannot move after it — which "writes eventually"
does not convey.
Source: [Oracle: AtomicInteger](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html).

### Settled — checked, correct, do not re-open

**`threadpoolexecutor` — the submission order is right, and the answer was
missing its consequence.** The javadoc's three queuing rules match the answer
step for step. What it did not say is the trap that follows from them:
*"Using an unbounded queue... will cause new tasks to wait in the queue when all
corePoolSize threads are busy. Thus, no more than corePoolSize threads will ever
be created. (And the value of the maximumPoolSize therefore doesn't have any
effect.)"* Added, because a pool configured 4-to-64 behind a `LinkedBlockingQueue`
is a pool of 4, and that is the thing people get wrong.
Source: [Oracle: ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html).

**`abstract-classes-vs-interfaces` — accurate throughout, including the parts
that date.** Instance fields, the implicit `public static final` on interface
fields, `default` and `static` from Java 8, `private` helpers from Java 9, and
"interfaces still cannot hold instance state" all hold. Rewritten for §3.8 only,
with the diamond-problem bullet split so the modern half — resolving a `default`
conflict with `Interface.super.method()` — is stated rather than alluded to.

---

## android-unit-testing — 2026-10-16

Two questions, both must-know, both flagged `simplify` and neither flagged
`verify`. The triage file called them the hardest rewrites in the topic, on the
grounds that every noun in them has to survive §3.8 rule 2. That was right, and
the reading also turned up a gap between them.

### Corrected

**`unit-testing-viewmodel-coroutines-livedata` — the two `TestDispatcher`s were
presented as interchangeable.** The answer said to install "`StandardTestDispatcher`
or `UnconfinedTestDispatcher`" as if the choice did not matter. It is the whole
difficulty of the topic. `runTest` uses a `StandardTestDispatcher` by default,
and coroutines launched on it do not run until the test yields — the docs make
the point with a worked example whose assertion is annotated `// ❌ Fails` until
`advanceUntilIdle()` is added. An `UnconfinedTestDispatcher` starts them eagerly
instead. The three yielding calls (`advanceUntilIdle`, `advanceTimeBy`,
`runCurrent`) are now named.

That gap was visible inside the corpus, not only against the source: this answer
said `runTest` "auto-advances virtual time", while the *next* question's pitfall
said you must advance manually. Both were describing real behaviour, and neither
said which case it was in.
Source: [Testing Kotlin coroutines on Android](https://developer.android.com/kotlin/coroutines/test).

**Added: one scheduler per test.** Neither answer mentioned it, and it is stated
as a rule: *"There should only be one scheduler instance used in a test, shared
between all TestDispatchers."* Two schedulers means two clocks.
Source: [Testing Kotlin coroutines on Android](https://developer.android.com/kotlin/coroutines/test).

### Settled — checked, correct, do not re-open

**`InstantTaskExecutorRule`, and why both it and `Dispatchers.setMain()` are
needed.** Correct as written — they solve unrelated problems, `LiveData`'s
`ArchTaskExecutor` and the Main dispatcher. Kept, and kept as the interview tip,
because it is the discriminating question.

**`SharingStarted.WhileSubscribed()` does not start the upstream until something
subscribes.** Correct. Sharpened into the failure it actually causes: a test that
only reads `.value` never subscribes, so it asserts against the initial value and
**passes for the wrong reason** — worse than failing.

**Turbine.** `github.com/cashapp/turbine` still resolves without redirecting;
checked after the Retrofit move. The `awaitItem()` / `cancelAndIgnoreRemainingEvents()`
usage is right, and the answer now says when to reach for it rather than
presenting it as the default.

---

## android-system-design — 2026-10-16

Four questions, all `simplify`, none `verify`. Nothing was wrong, so this entry
is short on corrections and is mostly a record that the topic needed a different
treatment from the rest of the phase.

### Settled — checked, correct, do not re-open

All four are accurate. `inSampleSize` downsampling, `LruCache` at an eighth of
the heap, the Signal Protocol's Double Ratchet, Room-as-source-of-truth,
`WorkManager` network constraints, STUN against TURN, SDP and ICE, Opus and
VP8/VP9/H.264, SRTP over UDP, and the SFU/MCU distinction all hold. The seven
reference links were re-checked for redirects after the Retrofit move; all seven
resolve cleanly.

### Note on method

The triage file was right that §3.8's rules do not fit this topic. Its rules
assume an answer that is too **dense**; these four were too **long**. Every one
had the same shape — requirements, then components, then trade-offs, all as
bullets at one flat level of detail — so there was no dense prose to cut and
applying rule 2 alone would have achieved nothing.

The treatment used instead: **lead with the two or three decisions that actually
get discussed, and demote the rest to detail hanging off them.** Image loading
opens on the two-level cache, downsampling before allocation, and cancelling on
recycle. WhatsApp opens on local-first plus outbox, and everything else follows
from it. Offline-first opens on the source-of-truth rule and why the UI never
calls the network. Voice and video opens on the split between signalling, which
you supply, and media, which WebRTC moves.

Nothing technical was dropped, per §3.8 rule 5. Lengths fell from 2780, 1952,
1904 and 1970 characters to 2614, 1822, 1713 and 1942 — a modest saving, and the
wrong thing to measure. The improvement is that each answer now has a first
sentence worth saying out loud, which none of them had.

`design-image-loading-library` remains the longest answer in the bank at 2614.
That is defensible for a whole-system design question, and cutting further would
mean removing content rather than reordering it.

---

## android-tools-technologies and other-topics — 2026-10-17

The last four flagged questions in the phase, taken together because the three
`verify` flags among them are the same kind of claim: a platform rule with a
date attached, of the sort that is correct when written and quietly stops being
so. All three had moved.

### Corrected

**`local-notification-exact-time` — the exact-alarm permission changed twice and
the answer knew about one of them.** The triage pass called this the most
consequential thing in its topic, and it was right. The answer said only that
"since Android 12 (API 31), scheduling exact alarms requires the
`SCHEDULE_EXACT_ALARM` permission (Android 13+ it's user-toggleable in
Settings)". Three things are missing, each of which ships a bug:

- `SCHEDULE_EXACT_ALARM` *"is not pre-granted to fresh installs of apps targeting
  Android 13 (API level 33) and higher."* A reader who believed the old answer
  ships an app whose reminders never fire on any new install.
- `USE_EXACT_ALARM` exists from Android 13 as the alternative: *"Granted
  automatically. Cannot be revoked by the user. Subject to an upcoming Google
  Play policy. Limited use cases"* — for alarm-clock and calendar apps.
- Revocation is not passive. *"When the `SCHEDULE_EXACT_ALARM` permission is
  revoked for your app, your app stops, and all future exact alarms are
  canceled."* The `ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED`
  broadcast is what tells you to reschedule, and the answer now says so.

Source: [Schedule alarms](https://developer.android.com/develop/background-work/services/alarms).

**`annotation-processing` — "commonly 2x" was not a claim anyone made.** The
triage asked for the figure to be sourced or dropped. It could not be sourced
from the cited page: the current KSP overview does not mention kapt or build
speed at all. Android's own migration guide says *"up to 2x faster"* — a ceiling,
not a typical case, which is a different claim. Corrected to the guide's wording
and the guide added as a reference.

The same page carries a fact the answer omitted entirely and which is now the
headline: *"Kapt is now in maintenance mode, and we recommend that you migrate
from kapt to KSP for all processors that support it."* Also added the trade KSP
makes — its processors *"can't examine expressions or statements, and they can't
modify the source code"* — because "KSP is faster" without that reads as a free
lunch.
Source: [Migrate from kapt to KSP](https://developer.android.com/build/migrate-to-ksp),
[Kotlin Symbol Processing API](https://kotlinlang.org/docs/ksp-overview.html).

**`16-kb-page-size` — the answer had no version, no scope and no date.** It said
"newer devices/kernels support 16 KB pages" and left the rest to the reader. All
three are stated on the guide: support begins with **Android 15**; the Play
requirement covers *"all apps targeting Android 15 (API level 35) and higher...
on 64-bit devices"*; and *"Starting February 1, 2027, if your app updates don't
support 16 KB memory page sizes, you won't be able to release these updates."*

The scope sentence was also softer than the source. The answer said pure-Kotlin
apps are "generally unaffected"; the guide's condition is *"if your app uses any
NDK libraries, either directly or indirectly through an SDK"*, and indirectly is
where this catches people — one analytics SDK with a bundled `.so` puts a
Kotlin-only app in scope. The concrete fix is now in the answer too, the two
linker flags rather than "rebuild with a toolchain that supports it".
Source: [Support 16 KB page sizes](https://developer.android.com/guide/practices/page-sizes).

### The `firebase` decision

The triage refused to trim this one and asked Phase 4 to choose: cut it to what
Firebase *is* plus the three services that get asked about, or accept it as a
reference entry and leave it, on the grounds that trimming a third would leave
it neither.

**Chosen: keep every service, change the shape.** The catalogue is now a
two-column table rather than six bullets, which is the right form for a list of
products and reads in a fraction of the time. That freed the prose to do the
part worth reading — the cost side, which is where the interview actually goes.
Reordered so the billing trap (*Firestore bills per document read, so an
unbounded listener is a billing bug that looks like a performance one*) and the
security-rules point come before the feature list's afterglow. 2516 characters
down to roughly 2100, with nothing dropped.

### Settled — checked, correct, do not re-open

The `local-notification-exact-time` snippet's existing trace and `explain` were
re-read against the same source and hold, including the `AllowWhileIdle`
rate-limit note and `FLAG_IMMUTABLE` being mandatory from Android 12.

---

## Phase 4 closed — 2026-10-17

26 questions read against their primary sources across 8 topics. Fifteen claims
corrected, thirteen checked and left alone, and sixteen links repointed at pages
that had moved underneath them.

**Validator check 3 is on.** Every must-know question must carry at least one
`referenceLink`, mirroring the rule `validate-theory.js` has always applied to
must-know chapters. It passed on its first run — all 143 already had one — so it
went in as a ratchet rather than a clean-up. That is the part of this pass that
keeps working: a dated log records what was true in October 2026, but the check
is what stops a must-know answer from ever again asserting something nobody can
go and look up.

**What actually rots.** Every single correction in this file was a fact with a
version or a date attached. `onSaveInstanceState` crossing `onStop` at API 28.
`SCHEDULE_EXACT_ALARM` ceasing to be pre-granted at API 33. Scoped storage at 29,
30 and 33. `weakCompareAndSet` deprecated at Java 9. ZGC's pause target. kapt
entering maintenance mode. The 16 KB deadline. Not one timeless claim was wrong —
the diamond problem, CAS retry loops, `LruCache` sizing, the Signal Protocol and
STUN against TURN all came through untouched.

So a cheaper future audit than reading everything has an obvious first move:
**find the sentences with a version number in them.** They are where the errors
live, and they are grep-able.

**What the checker still cannot see.** A page that answers 200 and meta-refreshes
elsewhere passes `check-doc-links.js`, which is how sixteen dead anchors survived
every previous run. Worth closing deliberately, in its own commit, rather than
during a content pass.

### 2026-10-20 — design system pass

Both themes walked end to end on every commit. Checked at 1440, 1000, 820 and
375px.

- **Tokens.** Every `var(--x)` used across `css/`, `js/` and `index.html` resolves
  to a `--x:` defined in `themes.css`; no colour literal remains in the other
  four stylesheets. Cross-checked with `comm` in both directions.
- **Emoji.** None remain in `js/`, `css/` or `index.html`.
- **Keyboard.** `/` focuses search. Enter and Space expand a row; the checkbox
  inside it does not. Escape dismisses a glossary popover. Focus ring visible on
  every control the pass touched.
- **Progress.** Ticking a row moves the row, its action button, the header bar
  and the sidebar count together, with no re-render. Keys are
  `topicId:questionId`; verified two topics sharing a question id stay distinct.
- **Theory migration.** A legacy `droiddeck:theory:read` of two modules expanded
  to ten chapter keys on first load; the old key was left in place.
- **Code blocks.** Gutter line count matches the source exactly (36/36 on the
  longest Kotlin sample) and the two line boxes share a measured line height of
  21.25px. Copy verified with a real pointer gesture; the synthetic-click path
  correctly falls through to the textarea fallback.
- **Empty state.** `#kotlin-coroutines?tier=good` — a genuinely empty
  combination — renders the state rather than a blank page.
- **Not covered.** No automated test asserts any of the above; this pass has no
  test-suite equivalent and the two validators only prove the corpus is intact.
