# Data Backup — Android Interview Questions

> This file contains the complete blueprint for regenerating all `data/` files.
> Each topic file exports a global `const` variable. `data/index.js` assembles them into `const topics = [...]`.

## Schema Reference

```javascript
// Each data file follows this structure:
const topicVariableData = {
    id: "topic-id",
    title: "Topic Title",
    subsections: null | [{ id: "sub-id", title: "Sub Title", keyTopics: ["..."] }],
    keyTopics: ["Important Topic 1", "Topic 2"],
    questions: [
        {
            id: "question-id",
            referenceLinks: [{ title: "Link Title", url: "https://..." }],
            question: "Question text?",
            answer: "<p><strong>🔑 Section</strong></p><ul><li>Point 1</li></ul>",
            tags: ["tag1", "tag2"],
            hasDiagram: false,
            diagramType: null | "flowchart" | "animation" | "sequence",
            diagramConfig: null | { nodes, connections, columns, title } | { steps, title } | { actors, messages, title },
            codeSnippets: [{ language: "kotlin"|"java"|"xml", title: "Title", code: "..." }],
            subsection: "sub-id"  // only for topics with subsections
        }
    ]
};
```

## data/index.js

```javascript
const topics = [
  kotlinCoroutinesData, kotlinFlowApiData, kotlinData, androidData,
  androidLibrariesData, androidArchitectureData, designPatternData,
  androidSystemDesignData, androidUnitTestingData, androidToolsTechnologiesData,
  jetpackComposeData, javaData, otherTopicsData, dataStructuresAlgorithmsData
];
```

---



## Topic 1: kotlin-coroutines.js

- **Variable**: `kotlinCoroutinesData`
- **ID**: `kotlin-coroutines`
- **Title**: "Kotlin Coroutines"
- **Subsections**: null
- **Key Topics**: Coroutines, Suspend Functions, launch, async-await & withContext, Dispatchers (Main, IO, Default), Coroutine Scope, coroutineScope vs supervisorScope, lifecycleScope/viewModelScope/GlobalScope, CoroutineContext, Job & SupervisorJob, suspendCoroutine & suspendCancellableCoroutine, runBlocking, Callback to Coroutines, Retrofit with Coroutines, Parallel Multiple Network Calls, Room Database with Coroutines, Unit Testing ViewModel with Coroutines, Exception Handling, Structured Concurrency, Cancellation
- **Questions (20)**:

| # | ID | Question |
|---|---|----|
| 1 | coroutines-what-are-they | What are Coroutines in Kotlin? |
| 2 | coroutines-suspend-function | What is a suspend function? |
| 3 | coroutines-launch-vs-async | What is the difference between launch and async in Kotlin Coroutines? |
| 4 | coroutines-withcontext | What is withContext and when should you use it? |
| 5 | coroutines-dispatchers | What are Coroutine Dispatchers? |
| 6 | coroutines-scope | What is CoroutineScope? |
| 7 | coroutines-coroutinescope-vs-supervisorscope | What is the difference between coroutineScope and supervisorScope? |
| 8 | coroutines-lifecycle-scopes | What are lifecycleScope, viewModelScope, and GlobalScope? |
| 9 | coroutines-context | What is CoroutineContext? |
| 10 | coroutines-job-vs-supervisorjob | What is the difference between Job and SupervisorJob? |
| 11 | coroutines-suspend-coroutine | What are suspendCoroutine and suspendCancellableCoroutine? |
| 12 | coroutines-runblocking | What is runBlocking? |
| 13 | coroutines-callback-to-coroutines | How do you convert Callbacks to Coroutines? |
| 14 | coroutines-retrofit | How do you use Retrofit with Coroutines? |
| 15 | coroutines-parallel-network-calls | How do you make parallel multiple network calls with Coroutines? |
| 16 | coroutines-room-database | How do you use Room Database with Coroutines? |
| 17 | coroutines-unit-testing-viewmodel | How do you unit test a ViewModel with Coroutines? |
| 18 | coroutines-exception-handling | How does exception handling work in Coroutines? |
| 19 | coroutines-structured-concurrency | What is structured concurrency? |
| 20 | coroutines-cancellation | How do you cancel a coroutine? |

**Reference links pattern**: Most questions link to outcomeschool.com/blog/ articles.

**Answer style**: HTML with emoji section headers (🚀, ⏸️, 🔀, etc.), `<strong>` for headings, `<ul><li>` for bullet points, `<code>` for inline code.

**Code snippets**: Kotlin examples showing ViewModel usage, coroutine patterns, Android integration.

**Diagram**: Q1 has a flowchart showing coroutine execution flow (Main Thread → launch/async → Suspend Point → Background Work → Resume → Complete).

---

## Topic 2: kotlin-flow-api.js

- **Variable**: `kotlinFlowApiData`
- **ID**: `kotlin-flow-api`
- **Title**: "Kotlin Flow API"
- **Subsections**: null
- **Key Topics**: Flow Builder/Operator/Collector, flowOn & Dispatchers, Creating Flow Using Flow Builder, Operators (filter, map, zip, flatMapConcat, retry, debounce, distinctUntilChanged, flatMapLatest), Terminal Operators, Cold Flow vs Hot Flow, StateFlow and SharedFlow, callbackFlow, channelFlow, Long-running tasks in parallel with Kotlin Flow, Retry Operator, Retrofit with Kotlin Flow, Room Database with Kotlin Flow, Zip Operator for Parallel Multiple Network Calls, Instant Search Using Kotlin Flow Operators, Exception Handling in Kotlin Flow, Unit Testing ViewModel with Kotlin Flow and StateFlow
- **Questions (17)**:

| # | ID | Question |
|---|---|----|
| 1 | flow-what-is-flow | What is Flow in Kotlin? Explain the concepts of Flow Builder, Operator, and Collector. |
| 2 | flow-flowon | What is flowOn and how does it change dispatchers? |
| 3 | flow-builders | What are the different ways to create a Flow (Flow Builders)? |
| 4 | flow-common-operators | What are the common Flow operators like filter, map, zip, flatMapConcat, retry, debounce, distinctUntilChanged, flatMapLatest? |
| 5 | flow-terminal-operators | What are terminal operators in Kotlin Flow? |
| 6 | flow-cold-vs-hot | What is the difference between Cold Flow and Hot Flow? |
| 7 | flow-stateflow-sharedflow | What is StateFlow and SharedFlow? |
| 8 | flow-callbackflow | What is callbackFlow and how do you convert callbacks to Flow? |
| 9 | flow-channelflow | What is channelFlow and how is it different from callbackFlow? |
| 10 | flow-parallel-tasks | How do you run long-running tasks in parallel with Kotlin Flow? |
| 11 | flow-retry-operator | How does the Retry operator work in Kotlin Flow? |
| 12 | flow-retrofit | How do you use Retrofit with Kotlin Flow? |
| 13 | flow-room-database | How do you use Room Database with Kotlin Flow? |
| 14 | flow-zip-parallel-calls | How do you use the Zip operator for parallel multiple network calls? |
| 15 | flow-instant-search | How do you implement Instant Search using Kotlin Flow operators? |
| 16 | flow-exception-handling | How does exception handling work in Kotlin Flow? |
| 17 | flow-unit-testing | How do you unit test ViewModels with Kotlin Flow and StateFlow? |

**Diagram**: Q1 has a flowchart (Flow Builder → Operator → Operator → Collector).

---





## Topic 3: kotlin.js

- **Variable**: `kotlinData`
- **ID**: `kotlin`
- **Title**: "Kotlin"
- **Subsections**: null
- **Key Topics**: const keyword advantages, lateinit vs lazy initialization, Inline functions (inline, noinline, crossinline), Companion objects, Extension functions, Data classes, Sealed classes and use-cases, Scope functions (let, run, with, apply, also), Reified keyword, Higher-order functions and lambdas, val vs var, Visibility modifiers, Singleton (object declaration), open vs public, Labels in Kotlin, Elvis operator (?:), == vs === (structural vs referential equality), Collections overview, JvmStatic/JvmField/JvmOverloads annotations, Delegates and delegation, Coroutines basics, Launch vs Async, Coroutine Scope and Context, Structured concurrency, suspend vs blocking, runBlocking, Kotlin Flow (stateIn, shareIn, flatMap operators, collect vs collectLatest), Kotlin Multiplatform, String vs StringBuffer vs StringBuilder, Inline classes (value classes), Infix notation, partition function, associateBy (List to Map), Remove duplicates from array, init block, List vs Array, Sequences vs Collections
- **Questions (66)**:

| # | ID | Question |
|---|---|----|
| 1 | kotlin-const-advantage | What is the advantage of using const in Kotlin? |
| 2 | kotlin-lateinit | When to use lateinit keyword used in Kotlin? |
| 3 | kotlin-inline-function | What is inline function in Kotlin? |
| 4 | kotlin-companion-object | What are companion objects in Kotlin? |
| 5 | kotlin-extension-functions | What are extension functions in Kotlin? |
| 6 | kotlin-data-classes | What is a data class in Kotlin? |
| 7 | kotlin-remove-duplicates | How to remove duplicates from an array in Kotlin? |
| 8 | kotlin-jvmstatic | What is a JvmStatic Annotation in Kotlin? |
| 9 | kotlin-jvmfield | What is a JvmField Annotation in Kotlin? |
| 10 | kotlin-jvmoverloads | What is a JvmOverloads Annotation in Kotlin? |
| 11 | kotlin-noinline | What is noinline in Kotlin? |
| 12 | kotlin-crossinline | What is crossinline in Kotlin? |
| 13 | kotlin-scope-functions | What are scope functions in Kotlin? |
| 14 | kotlin-reified | What is a reified keyword in Kotlin? |
| 15 | kotlin-lateinit-vs-lazy | What is the difference between lateinit and lazy in Kotlin? |
| 16 | kotlin-init-block | What is an init block in Kotlin? |
| 17 | kotlin-equality-operators | What is the difference between == and === in Kotlin? |
| 18 | kotlin-higher-order-functions | What are higher-order functions in Kotlin? |
| 19 | kotlin-function-returning-function | Write a Higher-Order Function that returns a function. |
| 20 | kotlin-lambdas | What are Lambdas in Kotlin? |
| 21 | kotlin-associateby | How does associateBy work for List to Map conversion in Kotlin? |
| 22 | kotlin-open-keyword | What is the open keyword in Kotlin? |
| 23 | kotlin-internal-modifier | What is the internal visibility modifier in Kotlin? |
| 24 | kotlin-partition | What is the partition filtering function in Kotlin? |
| 25 | kotlin-infix-notation | What is infix notation in Kotlin? |

| 26 | kotlin-multiplatform | How does the Kotlin Multiplatform work? |
| 27 | kotlin-suspending-vs-blocking | What is the difference between suspending and blocking in Kotlin Coroutines? |
| 28 | kotlin-runblocking | What is runBlocking in Kotlin Coroutines? |
| 29 | kotlin-structured-concurrency | What is the meaning of structured concurrency in Kotlin Coroutines? |
| 30 | kotlin-string-vs-stringbuffer-vs-stringbuilder | What is the difference between String, StringBuffer, and StringBuilder? |
| 31 | kotlin-val-vs-var | What is the difference between val and var in Kotlin? |
| 32 | kotlin-lateinit-check-initialized | How to check if a lateinit variable has been initialized? |
| 33 | kotlin-lazy-initialization | How to do lazy initialization of variables in Kotlin? |
| 34 | kotlin-visibility-modifiers | What are the visibility modifiers in Kotlin? |
| 35 | kotlin-static-equivalent | What is the equivalent of Java static methods in Kotlin? |
| 36 | kotlin-singleton | How to create a Singleton class in Kotlin? |
| 37 | kotlin-open-vs-public | What is the difference between open and public in Kotlin? |
| 38 | kotlin-apply-scope-function | What is the apply scope function and its use cases? |
| 39 | kotlin-let-scope-function | What is the let scope function and its use cases? |
| 40 | kotlin-scope-functions-use-cases | Explain the use-case of let, run, with, also, apply in Kotlin. |
| 41 | kotlin-apply-vs-with | How to choose between apply and with in Kotlin? |
| 42 | kotlin-list-vs-array | What is the difference between List and Array types in Kotlin? |
| 43 | kotlin-labels | What are Labels in Kotlin? |
| 44 | kotlin-coroutines-basics | What are Coroutines in Kotlin? |
| 45 | kotlin-coroutine-scope | What is Coroutine Scope? |
| 46 | kotlin-coroutine-scopes-android | What are the scopes in Kotlin Coroutines used in Android? |
| 47 | kotlin-coroutine-context | What is Coroutine Context? |
| 48 | kotlin-launch-vs-async | What is the difference between launch and async in Kotlin Coroutines? |
| 49 | kotlin-thread-sleep-vs-delay | What is the difference between Thread.sleep() and delay() in Kotlin? |
| 50 | kotlin-inline-classes | What are inline classes (value classes) in Kotlin? |
| 51 | kotlin-sealed-classes | What are Sealed Classes in Kotlin? |
| 52 | kotlin-sealed-classes-android-use-cases | What are common use-cases of Sealed classes in Android? |
| 53 | kotlin-collections | Tell about the Collections in Kotlin. |
| 54 | kotlin-elvis-operator | What does ?: do in Kotlin? (Elvis Operator) |
| 55 | kotlin-coroutine-timeouts | How do timeouts work in Kotlin Coroutines? |
| 56 | kotlin-combine-coroutine-results | How do you combine multiple coroutine results? |
| 57 | kotlin-coroutine-job | What is a Job in Kotlin Coroutines? |
| 58 | kotlin-job-cancel-vs-scope-cancel | What is the difference between job.cancel() and scope.cancel() in Coroutines? |
| 59 | kotlin-async-exception-no-await | What happens if an exception is thrown inside an async coroutine, but await() is never called? |
| 60 | kotlin-debounce-coroutines | How to implement debounce using Kotlin Coroutines? |
| 61 | kotlin-coroutines-series-parallel | How to run two coroutines in series and parallel in Kotlin? |
| 62 | kotlin-yield | What is yield in Kotlin Coroutines? |
| 63 | kotlin-delegates | What are Delegates in Kotlin? |
| 64 | kotlin-statein-vs-sharein | What is the difference between stateIn and shareIn in Kotlin Flow? |
| 65 | kotlin-flatmap-operators | What is the difference between flatMapConcat, flatMapMerge, and flatMapLatest in Kotlin Flow? |
| 66 | kotlin-collect-vs-collectlatest | What is the difference between collect and collectLatest in Kotlin Flow? |

---

## Topic 4: android.js

- **Variable**: `androidData`
- **ID**: `android`
- **Title**: "Android"
- **Subsections (20)**:

| # | Subsection ID | Title | Key Topics |
|---|---|---|---|
| 1 | base | Base | App Lag, Context, Zygote, Application Components, Project Structure, AndroidManifest.xml, Application Class |
| 2 | activity-and-fragment | Activity and Fragment | Activity Lifecycle, Fragment Lifecycle, Configuration Changes, State Restoration, Back Stack, Intent Flags |
| 3 | views-and-viewgroups | Views and ViewGroups | View Lifecycle, Custom Views, ConstraintLayout, Measure/Layout/Draw, ViewBinding |
| 4 | displaying-lists-of-content | Displaying Lists of Content | RecyclerView, DiffUtil, ViewHolder Pattern, ListAdapter, ItemDecoration |
| 5 | dialogs-and-toasts | Dialogs and Toasts | AlertDialog, DialogFragment, BottomSheetDialog, Snackbar, Toast |
| 6 | intents-and-broadcasting | Intents and Broadcasting | Explicit vs Implicit Intents, BroadcastReceiver, LocalBroadcastManager, PendingIntent, Intent Filters |
| 7 | services | Services | Foreground Service, Background Service, Bound Service, IntentService, JobIntentService |
| 8 | inter-process-communication | Inter-process Communication | AIDL, Messenger, ContentProvider, Binder |
| 9 | long-running-operations | Long-running Operations | WorkManager, AlarmManager, JobScheduler, Foreground Service |
| 10 | working-with-multimedia-content | Working With Multimedia Content | CameraX, MediaPlayer, ExoPlayer, Image Loading |
| 11 | data-saving | Data Saving | SharedPreferences, DataStore, Room Database, SQLite, File Storage |
| 12 | look-and-feel | Look and Feel | Material Design, Themes and Styles, Animations, Dark Mode, Custom Drawables |
| 13 | memory-optimizations | Memory Optimizations | Memory Leaks, WeakReference, Bitmap Handling, LeakCanary, Profiling |
| 14 | battery-life-optimizations | Battery Life Optimizations | Doze Mode, App Standby, Battery Historian, WorkManager Constraints |
| 15 | supporting-different-screen-sizes | Supporting Different Screen Sizes | Density Qualifiers, Responsive Layouts, Foldables, Multi-Window |
| 16 | permissions | Permissions | Runtime Permissions, Permission Groups, Special Permissions, Best Practices |
| 17 | native-programming | Native Programming | JNI, NDK, CMake, Native Libraries |
| 18 | android-system-internal | Android System Internal | Zygote, ART/Dalvik, System Server, Binder IPC, Linux Kernel |
| 19 | android-jetpack | Android Jetpack | ViewModel, LiveData, Navigation, Compose, Hilt, Paging |
| 20 | others | Others | (no keyTopics) |

- **Key Topics (topic-level)**: Context types and usage, Activity and Fragment lifecycle, Launch modes and back stack, Services (Foreground, Background, Bound), BroadcastReceiver and Intents, ContentProvider and data sharing, ViewModel and LiveData, RecyclerView and DiffUtil, WorkManager for background tasks, Memory optimization and LeakCanary, ANR prevention, Handler/Looper/MessageQueue, Parcelable vs Serializable
- **Questions (155)** grouped by subsection:



### base (7 questions)
| ID | Question |
|---|---|
| android-app-lag | Why does an Android App lag? |
| android-context | What is Context? How is it used? |
| android-zygote | How does Zygote make Android apps start faster? |
| android-application-components | What are all the Android application components? |
| android-project-structure | What is the project structure of an Android Application? |
| android-manifest | What is AndroidManifest.xml? |
| android-application-class | What is the Application class in Android? |

### activity-and-fragment (16 questions)
| ID | Question |
|---|---|
| android-fragment-default-constructor | Why is it recommended to use only the default constructor to create a Fragment? |
| android-activity-lifecycle | What is Activity and its lifecycle? |
| android-oncreate-vs-onstart | What is the difference between onCreate() and onStart()? |
| android-ondestroy-without-onpause-onstop | When is only onDestroy() called for an activity without onPause() and onStop()? |
| android-setcontentview-in-oncreate | Why do we need to call setContentView() in onCreate() of Activity class? |
| android-save-restore-instance-state | What is onSaveInstanceState() and onRestoreInstanceState() in activity? |
| android-fragment-lifecycle | What is Fragment and its lifecycle? |
| android-bundle | What is Bundle in Android? |
| android-launch-modes | What are the launch modes in Android? |
| android-activity-vs-fragment | What is the difference between a Fragment and an Activity? |
| android-when-fragment-over-activity | When should you use a Fragment rather than an Activity? |
| android-fragmentpageradapter-vs-fragmentstatepageradapter | What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter? |
| android-add-vs-replace-fragment | What is the difference between adding/replacing fragment in backstack? |
| android-fragment-communication | How would you communicate between two Fragments? |
| android-retained-fragment | What is a retained Fragment? |
| android-addtobackstack | What is the purpose of addToBackStack() while committing fragment transaction? |

### views-and-viewgroups (10 questions)
| ID | Question |
|---|---|
| android-optimizing-layouts | How to optimize layouts in Android? |
| android-view | What is View in Android? |
| android-gone-vs-invisible | What is the difference between View.GONE and View.INVISIBLE? |
| android-custom-view | Can you create a custom view? How? |
| android-viewgroups-vs-views | What are ViewGroups and how are they different from Views? |
| android-canvas | What is a Canvas in Android? |
| android-surfaceview | What is a SurfaceView in Android? |
| android-relative-vs-linear-layout | What is the difference between RelativeLayout and LinearLayout? |
| android-constraintlayout-optimization | How does ConstraintLayout optimize performance? |
| android-view-tree-optimization | What is the view tree? How can you optimize its depth? |



### displaying-lists-of-content (13 questions)
| ID | Question |
|---|---|
| android-listview-vs-recyclerview | What is the difference between ListView and RecyclerView? |
| android-recyclerview-how-it-works | How does the RecyclerView work internally? |
| android-recyclerview-optimization | How to optimize RecyclerView scrolling performance? |
| android-nested-recyclerview-optimization | How to optimize nested RecyclerView? |
| android-recyclerview-performance-over-listview | How does RecyclerView improve performance over ListView? |
| android-recyclerview-components | What are the components of a RecyclerView? |
| android-adapter-viewholder-role | Explain the role of RecyclerView.Adapter and RecyclerView.ViewHolder. |
| android-layoutmanager | What is a LayoutManager in RecyclerView? |
| android-multiple-view-types | How do you handle multiple view types in a single RecyclerView? |
| android-diffutil | What is DiffUtil and how does it improve RecyclerView performance? |
| android-sethasfixedsize | What is the purpose of RecyclerView.setHasFixedSize(true)? |
| android-update-specific-item | How do you update a specific item in RecyclerView? |
| android-snaphelper | What is SnapHelper in RecyclerView? |

### dialogs-and-toasts (3 questions)
| ID | Question |
|---|---|
| android-dialog | What is Dialog in Android? |
| android-toast | What is Toast in Android? |
| android-dialog-vs-dialogfragment | What is the difference between Dialog and DialogFragment? |

### intents-and-broadcasting (7 questions)
| ID | Question |
|---|---|
| android-intent | What is an Intent in Android? |
| android-implicit-intent | What is an Implicit Intent? |
| android-explicit-intent | What is an Explicit Intent? |
| android-broadcast-receiver | What is a BroadcastReceiver? |
| android-broadcasts-intents-messaging | How do broadcasts and intents work to pass messages around your app? |
| android-pending-intent | What is a PendingIntent? |
| android-broadcast-types | What are the different types of Broadcasts? |

### services (7 questions)
| ID | Question |
|---|---|
| android-service-lifecycle | Explain the Android Service Lifecycle. |
| android-service | What is a Service in Android? |
| android-service-thread | On which thread does a Service run in Android? |
| android-service-vs-intentservice | What is the difference between Service and IntentService? |
| android-foreground-service | What is a Foreground Service? |
| android-jobscheduler | What is a JobScheduler? |
| android-workmanager-guarantee | How does WorkManager guarantee task execution? |

### inter-process-communication (5 questions)
| ID | Question |
|---|---|
| android-two-apps-interact | How can two distinct Android apps interact? |
| android-multiple-processes | Is it possible to run an Android app in multiple processes? How? |
| android-aidl | What is AIDL? Enumerate the steps in creating a bounded service through AIDL. |
| android-background-processing | What can you use for background processing in Android? |
| android-content-provider | What is a ContentProvider and what is it typically used for? |

### long-running-operations (8 questions)
| ID | Question |
|---|---|
| android-parallel-tasks-callback | How to run parallel tasks and get a callback when all are complete? |
| android-anr | What is ANR? How can the ANR be prevented? |
| android-threadpool-advantages | What are the advantages of using a ThreadPool? |
| android-daemon-vs-user-threads | What is the difference between Daemon Threads and User Threads? |
| android-handler-looper-handlerthread | Explain Looper, Handler, and HandlerThread. |
| android-garbage-collection | How does Garbage Collection work in Android? |
| android-memory-leak-vs-oom | What is the difference between Memory Leak and Out of Memory (OOM) Error? |
| android-runnable-vs-thread | What is the difference between a Runnable and a Thread in Android? |

### working-with-multimedia-content (2 questions)
| ID | Question |
|---|---|
| android-bitmap-handling | How do you handle bitmaps in Android as they take too much memory? |
| android-bitmap-pool | What is a Bitmap pool? |

### data-saving (8 questions)
| ID | Question |
|---|---|
| android-datastore-preferences | What is Jetpack DataStore Preferences? |
| android-persisting-data | What are the ways of persisting data in an Android app? |
| android-orm | What is ORM? How does it work? |
| android-preserve-activity-rotation | How would you preserve Activity state during a screen rotation? |
| android-data-storage-options | What are different ways to store data in your Android app? |
| android-scoped-storage | What is Scoped Storage in Android? |
| android-encrypt-data | How to encrypt data in Android? |
| android-commit-vs-apply | What is the difference between commit() and apply() in SharedPreferences? |

### look-and-feel (4 questions)
| ID | Question |
|---|---|
| android-spannable | What is a Spannable in Android? |
| android-spannablestring | What is a SpannableString? |
| android-text-best-practices | What are the best practices for using text in Android? |
| android-dark-mode | How to implement Dark mode in an application? |

### memory-optimizations (4 questions)
| ID | Question |
|---|---|
| android-improve-performance | How to improve Android app performance? |
| android-ontrimmemory | What is the onTrimMemory() method? |
| android-fix-oom | How to identify and fix OutOfMemory issues? |
| android-find-memory-leaks | How do you find memory leaks in Android applications? |

### battery-life-optimizations (4 questions)
| ID | Question |
|---|---|
| android-adaptive-battery-ml | How does Android implement Adaptive Battery using ML? |
| android-reduce-battery | How to reduce battery usage in an Android application? |
| android-doze-app-standby | What is Doze? What about App Standby? |
| android-overdraw | What is overdraw in Android? |





### supporting-different-screen-sizes (1 question)
| ID | Question |
|---|---|
| android-screen-resolutions | How do you support different types of resolutions? |

### permissions (1 question)
| ID | Question |
|---|---|
| android-permission-levels | What are the different protection levels in permissions? |

### native-programming (2 questions)
| ID | Question |
|---|---|
| android-ndk | What is the NDK and why is it useful? |
| android-renderscript | What is RenderScript? |

### android-system-internal (8 questions)
| ID | Question |
|---|---|
| android-runtime | What is Android Runtime? |
| android-dalvik-art-jit-aot | What are Dalvik, ART, JIT, and AOT in Android? |
| android-dalvik-vs-art | What are the differences between Dalvik and ART? |
| android-baseline-profiles | What are Baseline Profiles in Android? |
| android-dex | What is DEX in Android? |
| android-multidex | What is Multidex in Android? |
| android-force-gc | Can you manually call the Garbage Collector? |
| android-app-starts | What are Cold, Warm, and Hot app starts in Android? |

### android-jetpack (13 questions)
| ID | Question |
|---|---|
| android-jetpack-overview | What is Android Jetpack and why use it? |
| android-viewmodel | What is a ViewModel and how is it useful? |
| android-shared-viewmodel | What is SharedViewModel in Android? |
| android-architecture-components | What are Android Architecture Components? |
| android-stateflow-vs-livedata | What is the difference between StateFlow and LiveData? |
| android-livedata | What is LiveData in Android? |
| android-livedata-vs-observablefield | How is LiveData different from ObservableField? |
| android-setvalue-vs-postvalue | What is the difference between setValue and postValue in LiveData? |
| android-share-viewmodel-fragments | How do you share ViewModel between Fragments? |
| android-workmanager-explain | Explain WorkManager and its use cases. |
| android-workmanager-repeat-interval | What is the minimum repeat interval for PeriodicWorkRequest? |
| android-workmanager-guarantee-execution | How does WorkManager guarantee task execution? |
| android-viewmodel-internals | How does ViewModel work internally? |

### others (12 questions)
| ID | Question |
|---|---|
| android-serializable-vs-parcelable | What is the difference between Serializable and Parcelable? |
| android-bundle-vs-map | Why is Bundle used for data passing instead of a simple Map? |
| android-troubleshoot-crash | How do you troubleshoot a crashing application? |
| android-push-notifications | How does the Android push notification system work? |
| android-aapt | What is AAPT? |
| android-flatbuffers-vs-json | What is the difference between FlatBuffers and JSON? |
| android-hashmap-arraymap-sparsearray | What are the differences between HashMap, ArrayMap, and SparseArray? |
| android-sparsearray-advantages | What are the advantages of SparseArray in Android? |
| android-annotations | What are Annotations in Android? |
| android-custom-annotation | How to create a custom Annotation? |
| android-support-library | What is the Android Support Library? Why was it introduced? |
| android-data-binding | What is Android Data Binding? |

---



## Topic 5: android-libraries.js

- **Variable**: `androidLibrariesData`
- **ID**: `android-libraries`
- **Title**: "Android Libraries"
- **Subsections**: null
- **Key Topics**: OkHttp Interceptors and Caching, Dependency Injection (Dagger, Hilt), Dagger Components/Modules/Scopes, RxJava Operators (map, flatMap, zip, concat, merge), RxJava Subjects and Observable types, Kotlin Flow, Image Loading (Glide, Fresco), Retrofit and Networking, CompositeDisposable lifecycle, App Startup Library, Schedulers (io vs computation), Search implementation with RxJava, Pagination with RxJava
- **Questions (28)**:

| # | ID | Question |
|---|---|----|
| 1 | okhttp-interceptor | Explain OkHttp Interceptor. |
| 2 | okhttp-caching | How does HTTP Caching work with OkHttp? |
| 3 | okhttp-logging | How to enable logging in OkHttp? |
| 4 | android-dagger-why | Why do we use a Dependency Injection Framework like Dagger in Android? |
| 5 | android-dagger-annotations | Explain @Inject, @Module, @Provides, @Component in Dagger 2. |
| 6 | android-dagger-how-works | How does Dagger work internally? |
| 7 | android-dagger-vs-hilt | How will you choose between Dagger 2 and Dagger-Hilt? |
| 8 | android-dagger-component | What is a Component in Dagger? |
| 9 | android-dagger-module | What is a Module in Dagger? |
| 10 | android-dagger-custom-scope | How does a custom scope work in Dagger? |
| 11 | android-rxjava-composite-disposable | When to call dispose and clear on CompositeDisposable in RxJava? |
| 12 | android-multipart-request | What is a Multipart Request in Networking? |
| 13 | android-kotlin-flow | What is Flow in Kotlin? |
| 14 | android-app-startup-library | What is the App Startup Library? |
| 15 | android-rxjava-overview | What is RxJava? |
| 16 | android-rxjava-error-handling | How do you handle errors in RxJava? |
| 17 | android-rxjava-flatmap-vs-map | What is the difference between FlatMap and Map in RxJava? |
| 18 | android-rxjava-create-vs-fromcallable | When to use Create operator and when to use fromCallable operator of RxJava? |
| 19 | android-rxjava-defer | When to use the defer operator of RxJava? |
| 20 | android-rxjava-timer-delay-interval | How are Timer, Delay, and Interval operators used in RxJava? |
| 21 | android-rxjava-parallel-calls | How to make two network calls in parallel using RxJava? |
| 22 | android-rxjava-concat-vs-merge | What is the difference between Concat and Merge in RxJava? |
| 23 | android-rxjava-subject | Explain Subject in RxJava. |
| 24 | android-rxjava-observable-types | What are the types of Observables in RxJava? |
| 25 | android-rxjava-search | How to implement search feature using RxJava? |
| 26 | android-rxjava-pagination | How to implement pagination in RecyclerView using RxJava? |
| 27 | android-glide-fresco | How do Android Image Loading Libraries (Glide, Fresco) work? |
| 28 | android-rxjava-schedulers-io-vs-computation | What is the difference between Schedulers.io() and Schedulers.computation() in RxJava? |

**Note**: Most questions in this file have empty `codeSnippets: []` — answers are primarily HTML explanations without code blocks.

---



## Topic 6: android-architecture.js

- **Variable**: `androidArchitectureData`
- **ID**: `android-architecture`
- **Title**: "Android Architecture"
- **Subsections**: null
- **Key Topics**: MVVM, MVP, MVC, MVI, Clean Architecture, Multi-Module Architecture, Software Architecture vs Design, Repository Pattern, Separation of Concerns
- **Questions (8)**:

| # | ID | Question |
|---|---|----|
| 1 | arch-describe-last-app | Describe the architecture of your last app. |
| 2 | arch-mvvm | Describe MVVM architecture. |
| 3 | arch-mvc-mvp-mvvm | What is the difference between MVC, MVP, and MVVM? |
| 4 | arch-clean | What is Clean Architecture? |
| 5 | arch-mvi | What is MVI (Model-View-Intent) architecture? |
| 6 | arch-vs-design | What is the difference between Software Architecture and Software Design? |
| 7 | arch-multi-module-benefits | What are the benefits of Multi-Module Architecture? |
| 8 | arch-multi-module-when | When should you adopt Multi-Module Architecture? |

**Note**: All questions have `codeSnippets: []` and `hasDiagram: false`.

---

## Topic 7: design-pattern.js

- **Variable**: `designPatternData`
- **ID**: `design-pattern`
- **Title**: "Design Pattern"
- **Subsections**: null
- **Key Topics**: Builder Pattern, Singleton Pattern, Factory Pattern, Observer Pattern, Repository Pattern, Adapter Pattern, Facade Pattern, Dependency Injection, Strategy Pattern, Patterns in Android Libraries (Retrofit, Glide), Patterns in AOSP
- **Questions (15)**:

| # | ID | Question |
|---|---|----|
| 1 | design-pattern-builder | What is the Builder Pattern? |
| 2 | design-pattern-singleton | What is the Singleton pattern? |
| 3 | design-pattern-factory | What is the Factory pattern? |
| 4 | design-pattern-observer | What is the Observer pattern? |
| 5 | design-pattern-repository | What is the Repository pattern? |
| 6 | design-pattern-adapter | What is the Adapter pattern? |
| 7 | design-pattern-facade | What is the Facade pattern? |
| 8 | design-pattern-dependency-injection | What is Dependency Injection? |
| 9 | design-pattern-strategy | What is the Strategy Pattern? |
| 10 | design-pattern-android-common | What design patterns are commonly used in Android? |
| 11 | design-pattern-kotlin-optional-vs-builder | Kotlin Optional Parameters vs Builder Pattern |
| 12 | design-pattern-observer-android-examples | What are examples of the Observer pattern in Android? |
| 13 | design-pattern-retrofit | What design pattern is used in Retrofit library? |
| 14 | design-pattern-glide | What design pattern is used in Glide library? |
| 15 | design-pattern-aosp | What design patterns are used in AOSP? |

---



## Topic 8: android-system-design.js

- **Variable**: `androidSystemDesignData`
- **ID**: `android-system-design`
- **Title**: "Android System Design"
- **Subsections**: null
- **Key Topics**: Image Loading Library Design, File Downloader Design, Chat App Design, Networking Library Design, Caching Library Design, Location-based App Design, Offline-First Architecture, LRU Cache Design, Analytics/Logging Library, HTTP vs Long-Polling vs WebSocket vs SSE, Voice/Video Calls Architecture, Data Syncing on Unstable Networks
- **Questions (28)**:

| # | ID | Question |
|---|---|----|
| 1 | design-image-loading-library | Design an Image Loading Library |
| 2 | design-file-downloader-library | Design a File Downloader Library |
| 3 | design-whatsapp | Design WhatsApp |
| 4 | design-instagram-stories | Design Instagram Stories |
| 5 | design-networking-library | Design a Networking Library |
| 6 | design-facebook-nearby-friends | Design Facebook Near-By Friends App |
| 7 | design-caching-library | Design a Caching Library |
| 8 | design-location-based-app | Design problems based on location-based app |
| 9 | design-offline-first-app | How to build an offline-first app? |
| 10 | design-lru-cache | Design LRU Cache |
| 11 | design-analytics-library | Design an Analytics Library |
| 12 | design-logging-library | Design a Logging Library |
| 13 | http-request-long-polling-websocket-sse | HTTP Request vs HTTP Long-Polling vs WebSocket vs Server-Sent Events |
| 14 | voice-video-calls-architecture | How do Voice and Video Calls work? |
| 15 | data-syncing-unstable-networks | How do you handle data syncing on unstable networks? |
| 16 | design-uber-app | Design Uber App |
| 17 | where-is-my-train-without-internet | How does Where Is My Train work without Internet? |
| 18 | database-normalization-vs-denormalization | Database Normalization vs Denormalization |
| 19 | hash-vs-encrypt-vs-encode | Hash vs Encrypt vs Encode |
| 20 | webhook-vs-polling | Webhook vs Polling |
| 21 | real-time-updates-android | Options for real-time updates in Android App |
| 22 | network-optimization-mobile | Network Optimization in Mobile App |
| 23 | firebase-remote-config | Firebase Remote Config |
| 24 | accurate-time-android | How to get accurate time in Android? |
| 25 | query-optimization-sqlite | Query Optimization in SQLite |
| 26 | websocket-vs-socket-io | WebSocket vs Socket.IO |
| 27 | symmetric-vs-asymmetric-encryption | Symmetric vs Asymmetric Encryption |
| 28 | sms-retriever-api-android | SMS Retriever API in Android |

---


## Topic 9: android-unit-testing.js

- **Variable**: `androidUnitTestingData`
- **ID**: `android-unit-testing`
- **Title**: "Android Unit Testing"
- **Subsections**: null
- **Key Topics**: Unit Testing ViewModel with Coroutines and LiveData, Unit Testing ViewModel with Flow and StateFlow, Espresso, Robolectric, UI Automator, Mockito, Code Coverage, Instrumented Tests
- **Questions (10)**:

| # | ID | Question |
|---|---|----|
| 1 | unit-testing-viewmodel-coroutines-livedata | Unit Testing ViewModel with Kotlin Coroutines and LiveData |
| 2 | unit-testing-viewmodel-flow-stateflow | Unit Testing ViewModel with Kotlin Flow and StateFlow |
| 3 | what-is-espresso | What is Espresso? |
| 4 | what-is-robolectric | What is Robolectric? |
| 5 | disadvantages-of-robolectric | What are the disadvantages of Robolectric? |
| 6 | what-is-ui-automator | What is UI-Automator? |
| 7 | what-is-unit-test | What is a unit test? |
| 8 | what-is-instrumented-test | What is an instrumented test? |
| 9 | why-mockito-used | Why is Mockito used? |
| 10 | what-is-code-coverage | What is code coverage? |

---

## Topic 10: android-tools-technologies.js

- **Variable**: `androidToolsTechnologiesData`
- **ID**: `android-tools-technologies`
- **Title**: "Android Tools And Technologies"
- **Subsections**: null
- **Key Topics**: CI/CD Pipeline, ADB, 16 KB page size, StrictMode, Lint, App Release Checklist, Git, Firebase, Profiling, SQLite Debugging, ProGuard/R8, Android Studio Memory Profiler, Kotlin DSL Gradle, Gradle Build System, Annotation Processors (kapt, ksp), Build Variants, Desugaring, APK Size Reduction, Build Speed Optimization
- **Questions (30)**:

| # | ID | Question |
|---|---|----|
| 1 | ci-cd-pipeline | What is CI/CD Pipeline? |
| 2 | adb | What is ADB? |
| 3 | 16-kb-page-size | What is 16 KB page size for Android Apps? |
| 4 | strictmode | What is StrictMode in Android? |
| 5 | lint | What is Lint? What is it used for? |
| 6 | app-release-checklist | What is the Android App Release Checklist for Production Launch? |
| 7 | git-android-development | What is Git and how is it used in Android development? |
| 8 | firebase | What is Firebase? |
| 9 | measure-method-execution-time | How to measure method execution time in Android? |
| 10 | sqlite-database-debugging | Can you access your SQLite Database for debugging? |
| 11 | proguard-things-to-care | What are things to take care of while using ProGuard? |
| 12 | android-studio-memory-profiler | How to use Android Studio Memory Profiler? |
| 13 | kotlin-dsl-gradle | What is Kotlin DSL for Gradle? |
| 14 | implementation-vs-api-gradle | What is the difference between implementation and api in Gradle? |
| 15 | gradle | What is Gradle? |
| 16 | gradle-related-files | What are the Gradle related files in an Android Project? |
| 17 | custom-gradle-task | How do you create a custom task in Gradle? |
| 18 | annotation-processor-kapt-ksp | What is the difference between annotationProcessor, kapt, and ksp? |
| 19 | build-variants | What are Build Variants in Android? |
| 20 | desugaring | What is Desugaring in Android? |
| 21 | reduce-apk-size | How to reduce APK size? |
| 22 | speed-up-gradle-build | How can you speed up the Gradle build? |
| 23 | gradle-build-system-explained | Explain the Gradle build system. |
| 24 | multiple-apks | What about multiple APKs for Android apps? |
| 25 | proguard-usage | What is ProGuard used for? |
| 26 | proguard-rules-pro-file | What is proguard-rules.pro file used for? |
| 27 | proguard-vs-r8 | What is the difference between ProGuard and R8? |
| 28 | obfuscation-minification | What is obfuscation? What about minification? |
| 29 | change-app-params-without-update | How to change app parameters without an app update? |
| 30 | write-ahead-logging | What is Write-Ahead Logging (WAL) and why is it used in databases? |

---




## Topic 11: jetpack-compose.js

- **Variable**: `jetpackComposeData`
- **ID**: `jetpack-compose`
- **Title**: "Jetpack Compose"
- **Subsections**: null
- **Key Topics**: Declarative UI, Composable Functions, Recomposition, State Management, MutableState, Side Effects (LaunchedEffect, DisposableEffect), remember vs rememberSaveable, Compose Lifecycle, Performance Optimization, State Hoisting, CompositionLocal, Compose Phases, Modifiers, Semantics (Accessibility), Navigation in Compose, Unidirectional Data Flow, Custom Layouts
- **Questions (33)**:

| # | ID | Question |
|---|---|----|
| 1 | compose-theory-references | Jetpack Compose Theory and References |
| 2 | compose-vs-view-system | Jetpack Compose vs Android View System |
| 3 | compose-declarative-ui | Explain the concept of declarative UI in Jetpack Compose. |
| 4 | compose-declarative-vs-imperative | What is the difference between Declarative UI and Imperative UI? |
| 5 | compose-composable-functions | What are Composable functions? |
| 6 | compose-recomposition | What is Recomposition in Jetpack Compose? |
| 7 | compose-state | What is State in Compose? |
| 8 | compose-mutable-state | What is MutableState in Compose? |
| 9 | compose-state-management | How does state management work in Jetpack Compose? |
| 10 | compose-stateful-vs-stateless | What is the difference between Stateful and Stateless composables? |
| 11 | compose-side-effects | What are side effects in Jetpack Compose? |
| 12 | compose-launched-vs-disposable | What is the difference between LaunchedEffect and DisposableEffect? |
| 13 | compose-remember-coroutine-scope | What is rememberCoroutineScope and its use cases? |
| 14 | compose-observe-flows-livedata | How to observe Flows and LiveData states in Compose UI? |
| 15 | compose-async-operations | How can we handle asynchronous operations in Jetpack Compose? |
| 16 | compose-non-compose-state | How can we convert a non-compose state into a Compose state? |
| 17 | compose-derived-state-of | Explain derivedStateOf in Compose. |
| 18 | compose-remember-updated-state | Explain rememberUpdatedState in Compose. |
| 19 | compose-remember-vs-saveable | What is the difference between remember and rememberSaveable? |
| 20 | compose-lifecycle | Explain the Lifecycle of a Composable in Jetpack Compose. |
| 21 | compose-lifecycle-events | How do you handle lifecycle events in Compose functions? |
| 22 | compose-performance-optimization | What are the best practices for performance optimization in Jetpack Compose? |
| 23 | compose-with-views | Can we use both Jetpack Compose and Android View in a Single App? |
| 24 | compose-state-hoisting | What is State Hoisting in Compose? |
| 25 | compose-composition-local | Explain CompositionLocal in Compose. |
| 26 | compose-phases | Explain Jetpack Compose Phases. |
| 27 | compose-modifier | What is the role of Modifier in Jetpack Compose? |
| 28 | compose-semantics | What are Semantics in Compose? |
| 29 | compose-user-input | How can you handle user input and events in Jetpack Compose? |
| 30 | compose-navigation | How do you handle navigation in Jetpack Compose? |
| 31 | compose-orientation-changes | How do you handle orientation changes in Jetpack Compose? |
| 32 | compose-unidirectional-data-flow | Explain unidirectional data flow in Jetpack Compose. |
| 33 | compose-custom-layouts | How to create Custom Layouts in Compose? |

---


## Topic 12: java.js

- **Variable**: `javaData`
- **ID**: `java`
- **Title**: "Java"
- **Subsections (8)**:

| # | Subsection ID | Title | Key Topics |
|---|---|---|---|
| 1 | solid-principles | SOLID Principles | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion |
| 2 | oop | OOP | Encapsulation, Inheritance, Polymorphism, Abstraction, Abstract Classes vs Interfaces |
| 3 | collections-generics | Collections and Generics | Arrays vs ArrayList, HashSet vs TreeSet, HashMap vs Set, Generics |
| 4 | objects-primitives | Objects and Primitives | String Immutability, String Pool, Primitives, Wrapper Classes, Pass by Value |
| 5 | java-memory-model | Java Memory Model and Garbage Collector | Garbage Collection, Heap vs Stack, GC Generations |
| 6 | concurrency | Concurrency | synchronized, ThreadPoolExecutor, volatile, Object vs Class Lock, Concurrency vs Parallelism, Atomic Operations |
| 7 | exceptions | Exceptions | try-catch-finally, Checked vs Unchecked Exceptions |
| 8 | others-java | Others | Shallow vs Deep Copy, Serialization, Reflection, static keyword, final/finally/finalize, StringBuffer vs StringBuilder, Dependency Injection |

- **Key Topics (topic-level)**: SOLID Principles, OOP (Encapsulation, Inheritance, Polymorphism, Abstraction), Collections Framework, Generics, String Immutability and Pool, Garbage Collection, Concurrency (synchronized, volatile, ThreadPool), Exception Handling, Serialization/Deserialization, Reflection, static and final keywords, Pass by Value vs Reference, Shallow vs Deep Copy, fail-fast vs fail-safe iterators
- **Questions (48)** grouped by subsection:

### solid-principles (5 questions)
| ID | Question |
|---|---|
| single-responsibility-principle | S in SOLID: Single Responsibility Principle |
| open-closed-principle | O in SOLID: Open/Closed Principle |
| liskov-substitution-principle | L in SOLID: Liskov Substitution Principle |
| interface-segregation-principle | I in SOLID: Interface Segregation Principle |
| dependency-inversion-principle | D in SOLID: Dependency Inversion Principle |

### oop (7 questions)
| ID | Question |
|---|---|
| explain-oop-concepts | Explain OOP Concepts. |
| abstract-classes-vs-interfaces | What are the differences between abstract classes and interfaces? |
| method-overloading-vs-overriding | What is the difference between method overloading and overriding? |
| string-pool-in-java | Explain String Pool in Java |
| access-modifiers-in-java | What are the access modifiers in Java? |
| interface-implement-another-interface | Can an Interface implement another Interface? |
| polymorphism-and-inheritance | What is Polymorphism? What about Inheritance? |

### collections-generics (4 questions)
| ID | Question |
|---|---|
| arrays-vs-arraylists | Arrays vs ArrayLists |
| hashset-vs-treeset | HashSet vs TreeSet |
| hashmap-vs-set | HashMap vs Set |
| generics-in-java | Explain Generics in Java |

### objects-primitives (6 questions)
| ID | Question |
|---|---|
| string-class-implementation-immutability | How is String class implemented? Why was it made immutable? |
| string-immutability-meaning | What does it mean to say that a String is immutable? |
| eight-primitive-types | List the 8 primitive types in Java. |
| integer-vs-int | What is the difference between Integer and int? |
| pass-by-reference-or-value | Do objects get passed by reference or value in Java? |
| garbage-collector | What is garbage collector? How does it work? |



### concurrency (6 questions)
| ID | Question |
|---|---|
| synchronized-keyword | What does the keyword synchronized mean? |
| threadpoolexecutor | What is a ThreadPoolExecutor? |
| volatile-modifier | What is the volatile modifier? |
| object-level-vs-class-level-lock | Object Level Lock vs Class Level Lock in Java |
| concurrency-vs-parallelism | Concurrency vs Parallelism |
| atomic-operations | Describe atomic operations: get, set, lazySet, compareAndSet, weakCompareAndSet. |

### exceptions (2 questions)
| ID | Question |
|---|---|
| try-catch-finally | How does try, catch, finally work? |
| checked-vs-unchecked-exceptions | What is the difference between Checked and Unchecked Exceptions? |

### others-java (18 questions)
| ID | Question |
|---|---|
| shallow-vs-deep-copy | Shallow vs Deep Copy in Java |
| serialization-deserialization | Explain Serialization and Deserialization |
| transient-modifier | What is the transient modifier? |
| anonymous-classes | What are anonymous classes? |
| equals-vs-double-equals | What is the difference between == and .equals()? |
| hashcode-and-equals | What is hashCode() and equals() used for? |
| final-finally-finalize | What are final, finally, and finalize? |
| static-keyword | What does the static keyword mean in Java? |
| reflection-in-java | Explain Reflection in Java |
| stringbuffer-vs-stringbuilder | What is the difference between StringBuffer and StringBuilder? |

**Note**: The "others-java" subsection has additional questions beyond the 10 listed — remaining 8 are other Java fundamentals.

---



## Topic 13: other-topics.js

- **Variable**: `otherTopicsData`
- **ID**: `other-topics`
- **Title**: "Other Topics"
- **Subsections**: null
- **Key Topics**: SQLite, Room Database, User Identification, Best Practices, React Native vs Flutter, Performance Metrics, API Key Security, Kotlin Multiplatform, Memory Heap Dumps, Dark Theme Implementation, Cleartext Traffic, Annotation Processing, Push Notifications (FCM), Local Notifications
- **Questions (17)**:

| # | ID | Question |
|---|---|----|
| 1 | describe-sqlite | Describe SQLite. |
| 2 | have-you-used-room | Have you used Room? |
| 3 | identify-users-uninstalled-app | Can we identify users who have uninstalled our application? |
| 4 | android-development-best-practices | What are Android Development Best Practices? |
| 5 | react-native-vs-flutter | React Native vs Flutter |
| 6 | app-performance-metrics | What are the metrics to measure continuously during Android development? |
| 7 | avoid-api-keys-in-vcs | How to avoid API keys from check-in into VCS? |
| 8 | kotlin-multiplatform | How does Kotlin Multiplatform work? |
| 9 | memory-heap-dumps | How to use Memory Heap Dumps data? |
| 10 | implement-dark-theme | How to implement Dark Theme in your app? |
| 11 | secure-api-keys-android | How to secure API keys used in an Android App? |
| 12 | cleartext-traffic | What is Cleartext traffic? |
| 13 | memory-usage-android | Tell something about memory usage in Android. |
| 14 | annotation-processing | Explain Annotation processing. |
| 15 | android-push-notification-system | How does the Android Push Notification system work? |
| 16 | fcm-push-notification-flow | Android Push Notification Flow using FCM |
| 17 | local-notification-exact-time | How to show local Notification at an exact time? |

---



## Topic 14: data-structures-algorithms.js

- **Variable**: `dataStructuresAlgorithmsData`
- **ID**: `data-structures-algorithms`
- **Title**: "Data Structures and Algorithms"
- **Subsections**: null
- **Key Topics**: Big O Notation, Arrays vs Linked Lists, Stack and Queue, Binary Trees and BST, HashMap and Hashing, Sorting Algorithms, Dynamic Programming, BFS and DFS, Graph Representations, Common Interview Problems
- **Questions (10)**:

| # | ID | Question |
|---|---|----|
| 1 | dsa-big-o | What is Big O Notation? |
| 2 | dsa-array-vs-linkedlist | Explain Array vs LinkedList. |
| 3 | dsa-stack-queue | What is a Stack and Queue? |
| 4 | dsa-binary-tree-bst | What is a Binary Tree and Binary Search Tree? |
| 5 | dsa-hashmap-hashing | What is a HashMap and how does hashing work? |
| 6 | dsa-sorting-algorithms | What are common sorting algorithms? |
| 7 | dsa-dynamic-programming | What is Dynamic Programming? |
| 8 | dsa-bfs-dfs | What is BFS and DFS? |
| 9 | dsa-graph-representations | What is a Graph and its representations? |
| 10 | dsa-common-problems | Common algorithm problems for Android interviews. |

---

## Content Generation Guidelines

When regenerating the actual data files from this blueprint:

1. **Answer format**: HTML using `<p>`, `<ul>`, `<li>`, `<ol>`, `<strong>`, `<code>`. Each answer starts with an emoji + bold title (e.g., `<p><strong>🔑 Key Points</strong></p>`). Use multiple sections with different emoji headers.

2. **Code snippets**: Kotlin examples for most topics (some Java/XML for relevant questions). Code shows practical Android patterns (ViewModel, Repository, suspend functions, Compose).

3. **Tags**: 2-5 relevant tags per question, lowercase, hyphenated.

4. **Reference links**: Most link to `outcomeschool.com/blog/` or LinkedIn posts. Format: `[{title, url}]`.

5. **Diagrams**: Only a few questions have diagrams (Q1 of coroutines, Q1 of flow). Most have `hasDiagram: false, diagramType: null, diagramConfig: null`.

6. **Subsection field**: Only present in `android.js` and `java.js` questions where `subsections` array is defined.

7. **File writing**: Use the `node << 'NODESCRIPT'` + `fs.writeFileSync`/`fs.appendFileSync` pattern (see docs/Writing Data files.md) to avoid shell interpolation issues with HTML content in JS strings.

8. **Verification**: After writing each file, run `node --check data/filename.js` to validate syntax.

