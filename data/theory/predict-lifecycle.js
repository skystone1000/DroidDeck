/* ==========================================================================
   M57 — Predict the output: lifecycle and launch modes.

   The last module in the track, and the second whose answers are reasoned
   rather than proved. There is no device or emulator behind the snippet
   harness, so none of this can be run; every block carries an `unrunnable`
   reason and validate-theory.js counts them.

   Last on purpose. A reasoned answer is worth less than a proved one, and the
   reader should meet the sixty-three verified puzzles before the seventeen
   that are argued.
   ========================================================================== */

const LIFECYCLE_UNRUNNABLE = 'Android framework: no device or emulator behind the snippet harness';

const predictLifecycleModule = {
    id: 'predict-lifecycle',
    trackId: 'output',
    order: 57,
    title: 'Lifecycle and Launch Modes',
    tagline: 'Which callback, in which order, and which ones do not fire at all.',
    estimatedMinutes: 22,
    prerequisites: ['activities-lifecycle', 'fragments', 'viewmodel'],
    docHub: {
        title: 'Activity lifecycle',
        path: '/guide/components/activities/activity-lifecycle'
    },

    chapters: [
        {
            id: 'the-callback-order',
            title: 'The order the callbacks actually arrive in',
            importance: 'must-know',
            summary: 'Rotation, navigation and leaving the app produce three different sequences, and two activities changing places interleave rather than taking turns.',
            interviewAngle: 'The lifecycle question is asked everywhere and answered by reciting seven method names. The version that separates people is the interleaving between two activities, because it cannot be recited from a diagram of one.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Nothing in this module can be compiled here, so every answer is an ordered description rather than a console dump — and it is labelled as one. Where a detail depends on API level, the answer says which level.</p>'
                },
                {
                    type: 'predict',
                    id: 'rotation-callback-order',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>The device is rotated with no <code>configChanges</code> declared. Which callbacks fire, in what order?</p>',
                    code: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState) }
    override fun onStart() { super.onStart() }
    override fun onResume() { super.onResume() }
    override fun onPause() { super.onPause() }
    override fun onStop() { super.onStop() }
    override fun onSaveInstanceState(outState: Bundle) { super.onSaveInstanceState(outState) }
    override fun onDestroy() { super.onDestroy() }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'onPause — the Activity is no longer in the foreground.',
                            'onStop — it is no longer visible.',
                            'onSaveInstanceState — on API 28 and above this runs after onStop; before API 28 it ran between onPause and onStop.',
                            'onDestroy — this instance is finished. isChangingConfigurations() returns true, isFinishing() returns false.',
                            'A NEW instance is constructed. onCreate runs, and savedInstanceState is non-null.',
                            'onStart.',
                            'onRestoreInstanceState — the same Bundle again, after onStart rather than during onCreate.',
                            'onResume — the new instance is in the foreground.'
                        ],
                        explain: '<p>The whole Activity is <strong>destroyed and rebuilt</strong>; it is not reconfigured in place. That is why anything held in a field is gone and anything in a <code>ViewModel</code> is not.</p><p>The <code>onSaveInstanceState</code> position moved in API 28 and the older ordering is still in a lot of blog posts. Relying on the position is a mistake in either case — treat it as "some time before <code>onDestroy</code>".</p><p><code>isChangingConfigurations()</code> is how <code>onDestroy</code> can tell this apart from a real finish, and it is exactly the check <code>ViewModelStore</code> uses to decide whether to keep the ViewModels.</p>'
                    },
                    distractor: '<p>Putting <code>onSaveInstanceState</code> before <code>onPause</code>, or expecting <code>onRestoreInstanceState</code> inside <code>onCreate</code>. The Bundle arrives twice and neither delivery is where people assume.</p>'
                },
                {
                    type: 'predict',
                    id: 'a-to-b-callbacks-interleave',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>A starts B. Interleave the callbacks of both activities into one sequence.</p>',
                    code: `// in ActivityA
startActivity(Intent(this, ActivityB::class.java))`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'A.onPause — A gives up the foreground first.',
                            'B.onCreate.',
                            'B.onStart.',
                            'B.onResume — B is now interactive.',
                            'A.onStop — only NOW, after B is fully resumed and covering it.',
                            'A.onSaveInstanceState may also run around here, since A could be killed while stopped.'
                        ],
                        explain: '<p>The two lifecycles overlap. <code>A.onStop</code> comes <strong>after</strong> <code>B.onResume</code>, not before <code>B.onCreate</code>, because the system will not tear down the outgoing screen until the incoming one is actually ready to be seen.</p><p>This is why heavy work in <code>onPause</code> delays the next screen from appearing — everything between <code>A.onPause</code> and <code>B.onResume</code> is time the user spends looking at the old screen. Save in <code>onStop</code>, not <code>onPause</code>.</p><p>It is also why "release the camera in <code>onPause</code>, acquire it in <code>onResume</code>" is the documented pairing: for that brief window both activities exist, and only <code>onPause</code> is guaranteed to have run before the other one resumes.</p>'
                    },
                    distractor: '<p>Running A all the way down to <code>onStop</code> before B starts. The sequences interleave, and the gap between them is what the user perceives as transition lag.</p>'
                },
                {
                    type: 'predict',
                    id: 'back-against-home',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>Back button against home button. Which callbacks differ?</p>',
                    code: `class MainActivity : AppCompatActivity() {

    override fun onStop() {
        super.onStop()
        Log.d(TAG, "onStop, isFinishing=\$isFinishing")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy, isFinishing=\$isFinishing")
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'BACK: onPause, then onStop, then onDestroy.',
                            'BACK: isFinishing() is true, and onSaveInstanceState is NOT called — there is no state to come back to.',
                            'HOME: onPause, then onStop. And that is all.',
                            'HOME: onSaveInstanceState IS called, because the process may be killed while in the background.',
                            'HOME: no onDestroy. The Activity stays alive, stopped, in the back stack.',
                            'Returning to it: onRestart, onStart, onResume — note onRestart, which only ever runs on this path.'
                        ],
                        explain: '<p><code>onDestroy</code> and <code>onSaveInstanceState</code> are the two that differ, and they differ in opposite directions. Back means finished, so there is nothing to save; home means backgrounded, so saving is exactly what is needed.</p><p><code>onRestart</code> is the callback nobody can place, and this is its only home: it runs when a stopped Activity is coming back, between <code>onStop</code> and <code>onStart</code>. It never runs on first launch.</p><p>If the process is killed while stopped, returning does not run <code>onRestart</code> — it runs a full <code>onCreate</code> with the saved Bundle, which is why the two paths converge on the same restoration code.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'a-dialog-does-not-stop-the-activity',
                    importance: 'should-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>An <code>AlertDialog</code>, and a dialog-themed <code>Activity</code>. What does each do to the Activity underneath?</p>',
                    code: `// (a) a Dialog shown from this Activity
AlertDialog.Builder(this).setTitle("Delete?").show()

// (b) an Activity with a dialog theme, started from this Activity
startActivity(Intent(this, TranslucentActivity::class.java))`,
                    output: {
                        kind: 'trace',
                        lines: [
                            '(a) AlertDialog: NO lifecycle callback fires at all.',
                            '(a) The Activity stays RESUMED. The dialog is another window belonging to the same Activity, not a new one.',
                            '(b) Dialog-themed Activity: onPause fires on the Activity underneath.',
                            '(b) onStop does NOT fire, because the activity below is still partly visible behind the translucent one.',
                            '(b) Dismissing it: onResume only — there was no onStop, so there is no onStart or onRestart either.'
                        ],
                        explain: '<p>A <code>Dialog</code> is not an Activity and does not touch the lifecycle. Code written in <code>onPause</code> expecting to react to "a dialog appeared" never runs.</p><p>Case (b) is the only situation that produces <code>onPause</code> without <code>onStop</code>, and it is the reason the pair exists as two callbacks rather than one. Partially visible is a real state: still on screen, not interactive.</p><p>Which is also why "stop the video in <code>onPause</code>" and "release it in <code>onStop</code>" are different decisions rather than a style preference.</p>'
                    },
                    distractor: '<p>Expecting a dialog to pause the Activity. It is intuitive, it is what a dialog looks like, and no callback fires.</p>'
                }
            ],
            docs: [
                { title: 'The activity lifecycle', path: '/guide/components/activities/activity-lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-activity-lifecycle' },
                { topicId: 'android', questionId: 'android-dialog-vs-dialogfragment' }
            ]
        },

        {
            id: 'launch-modes-and-lifetimes',
            title: 'Launch modes, and what outlives what',
            importance: 'must-know',
            summary: 'A launch mode decides whether you get a new instance or an existing one back, and three different owners — the Activity, its ViewModel, and a Fragment view — have three different lifetimes.',
            interviewAngle: 'The launch mode question is usually answered by defining four modes. The useful version says which callback is delivered instead of onCreate, and what happens to getIntent().',
            buildsOn: ['the-callback-order'],
            blocks: [
                {
                    type: 'predict',
                    id: 'singletop-delivers-onnewintent',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>A <code>singleTop</code> Activity is already on top and is started again with a new Intent. What runs, and what does <code>intent</code> return?</p>',
                    code: `// AndroidManifest.xml
// <activity android:name=".DetailActivity" android:launchMode="singleTop" />

// DetailActivity is already on top; this is started again with a new id
startActivity(Intent(this, DetailActivity::class.java).putExtra("id", "second"))`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'No new instance is created, and onCreate does NOT run.',
                            'onPause runs on the existing instance.',
                            'onNewIntent(newIntent) is delivered.',
                            'onResume runs.',
                            'Inside onNewIntent, the property `intent` STILL returns the original Intent — the one from onCreate.',
                            'It only changes if you call setIntent(newIntent) yourself. Otherwise every later read of `intent` returns the stale one.'
                        ],
                        explain: '<p><code>onNewIntent</code> replaces <code>onCreate</code>, which means any setup written in <code>onCreate</code> that depends on the Intent’s extras simply does not happen for the second launch.</p><p>The stale <code>intent</code> is the part that produces real bugs. The new extras are in the parameter and nowhere else until you call <code>setIntent</code>, so a screen that reads <code>intent.getStringExtra("id")</code> later keeps showing the first item.</p><p>The reliable shape is a small function taking an Intent, called from both <code>onCreate</code> and <code>onNewIntent</code>, with <code>setIntent</code> as the first line of the latter.</p>'
                    },
                    distractor: '<p>Expecting <code>intent</code> to be updated automatically, since the system just handed the Activity a new one. It hands it to the parameter, not to the property.</p>'
                },
                {
                    type: 'predict',
                    id: 'singletask-clears-what-is-above-it',
                    importance: 'should-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>The stack is Home → List → Detail, and Home is <code>singleTask</code>. Home is started again. What happens to List and Detail?</p>',
                    code: `// AndroidManifest.xml
// <activity android:name=".HomeActivity" android:launchMode="singleTask" />

startActivity(Intent(this, HomeActivity::class.java))`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'The system finds the existing HomeActivity instance in the task.',
                            'Detail is destroyed: onPause, onStop, onDestroy — and isFinishing() is true.',
                            'List is destroyed the same way.',
                            'Home is NOT recreated. onNewIntent is delivered to the existing instance.',
                            'Home receives onRestart, onStart, onResume — it was stopped, and it is coming back.',
                            'The back stack is now just Home, so pressing back leaves the app.'
                        ],
                        explain: '<p><code>singleTask</code> guarantees at most one instance <em>in its task</em>, and it enforces that by <strong>destroying everything above it</strong>. Two activities were finished by a call that mentioned neither.</p><p>That is the right behaviour for a genuine home or entry screen and wrong for almost everything else — it silently discards unsaved work on the screens it clears, and it is a common cause of "the back button leaves the app too early".</p><p><code>singleInstance</code> goes further and puts the Activity alone in its own task, which affects how it appears in Recents.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'fragment-view-outlives-nothing',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>A Fragment is replaced with <code>addToBackStack</code>, then the user presses back. Which callbacks run each way?</p>',
                    code: `parentFragmentManager.beginTransaction()
    .replace(R.id.container, DetailFragment())
    .addToBackStack(null)
    .commit()`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Going forward, the outgoing Fragment runs onPause, onStop, onDestroyView.',
                            'It does NOT run onDestroy or onDetach — the Fragment instance is still alive on the back stack.',
                            'Its view hierarchy is gone; its fields are not.',
                            'Pressing back: onCreateView, onViewCreated, onStart, onResume — a NEW view for the SAME Fragment instance.',
                            'So the Fragment lifecycle ran once and the view lifecycle ran twice.',
                            'Any observer registered with `this` as the LifecycleOwner in onCreateView is now registered twice, and fires twice per emission.'
                        ],
                        explain: '<p>A Fragment has <strong>two lifecycles</strong>, and this is the case that makes the difference visible: the instance survives, the view does not.</p><p>The last line is the leak everyone hits. Observing with <code>this</code> ties the observer to the Fragment’s lifetime, which outlives the view — so the second <code>onCreateView</code> adds a second observer holding a destroyed view. <code>viewLifecycleOwner</code> exists precisely to scope it to the view instead, and it is the right answer essentially always.</p><p>The same reasoning is why a binding reference must be nulled in <code>onDestroyView</code>.</p>'
                    },
                    distractor: '<p>Expecting <code>onDestroy</code> alongside <code>onDestroyView</code>. Only the view is torn down, which is exactly what makes the stale-observer bug possible.</p>'
                },
                {
                    type: 'predict',
                    id: 'viewmodel-survives-rotation-not-finish',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: LIFECYCLE_UNRUNNABLE,
                    prompt: '<p>Rotate, then press back. When does <code>onCleared</code> run?</p>',
                    code: `class DetailViewModel : ViewModel() {
    override fun onCleared() { /* release resources */ }
}

class DetailActivity : AppCompatActivity() {
    private val vm: DetailViewModel by viewModels()
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Rotation: the Activity runs onDestroy, and isChangingConfigurations() is true.',
                            'Rotation: the ViewModelStore is retained, so onCleared does NOT run.',
                            'Rotation: the new Activity instance asks for a DetailViewModel and receives the SAME object, with its state intact.',
                            'Back: the Activity runs onDestroy with isFinishing() true.',
                            'Back: the store is cleared, onCleared RUNS, and viewModelScope is cancelled with it.',
                            'Process death while backgrounded: the ViewModel and everything in it are gone, and onCleared never runs at all.'
                        ],
                        explain: '<p><code>onDestroy</code> happens on both paths and only one of them clears the ViewModel — <code>isChangingConfigurations()</code> is the flag that tells them apart, and it is precisely why "survives rotation" is not the same claim as "survives being destroyed".</p><p>The last line is the boundary people forget. A <code>ViewModel</code> is held in memory by the <code>ViewModelStore</code>, so it cannot survive the process being killed. That is <code>SavedStateHandle</code>’s job, and it is why the two are used together rather than one replacing the other.</p><p><code>onCleared</code> not running on process death also means it is the wrong place for anything that must happen — it is for releasing in-memory resources, not for persisting.</p>'
                    },
                    distractor: '<p>Expecting <code>onCleared</code> on every <code>onDestroy</code>, or expecting a ViewModel to survive process death because it survived rotation. Two different mechanisms, two different guarantees.</p>'
                }
            ],
            docs: [
                { title: 'Tasks and the back stack', path: '/guide/components/activities/tasks-and-back-stack', kind: 'guide' },
                { title: 'ViewModel overview', path: '/topic/libraries/architecture/viewmodel', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-launch-modes' },
                { topicId: 'android', questionId: 'android-fragment-lifecycle' },
                { topicId: 'android', questionId: 'android-viewmodel' }
            ]
        }
    ]
};
