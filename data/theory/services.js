/* ==========================================================================
   M31 — Services.

   Closes the data track, and comes after WorkManager on purpose: a service is
   now the exception rather than the default, and reading it that way stops
   the reflex of answering every background question with one.

   Cross-app IPC lives in M15, where the Binder material already is. This
   module covers binding as a service concern and points there for the rest.
   ========================================================================== */

const servicesModule = {
    id: 'services',
    trackId: 'data',
    order: 31,
    title: 'Services and Foreground Services',
    tagline: 'Not a thread, and no longer the default answer to anything.',
    estimatedMinutes: 25,
    prerequisites: ['background-work'],
    docHub: {
        title: 'Services overview',
        path: '/develop/background-work/services'
    },

    chapters: [
        {
            id: 'service-basics',
            title: 'What a service is, and is not',
            importance: 'must-know',
            summary: 'A component with no UI that runs on the main thread — the two halves people get backwards.',
            interviewAngle: '"Which thread does a Service run on?" is a direct test, and the answer is the main one.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A service is an application component (M12) with no user interface, whose purpose is to keep the app process alive and important while something happens. That is all it provides. It does not provide a thread, and the single most common Android interview mistake is believing that it does.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>A <code>Service</code> runs on the <strong>main thread</strong> of the process that hosts it. Blocking work inside <code>onStartCommand</code> freezes the UI and triggers an ANR exactly as it would in an activity. "Background" describes its lack of a UI, not where its code executes.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Started versus bound',
                    left: 'Started',
                    right: 'Bound',
                    rows: [
                        { aspect: 'Begun by', left: '<code>startService</code> / <code>startForegroundService</code>', right: '<code>bindService</code>' },
                        { aspect: 'Lives until', left: 'It stops itself, or is stopped', right: 'The last client unbinds' },
                        { aspect: 'Returns a value', left: 'No', right: 'Yes — through an <code>IBinder</code>' },
                        { aspect: 'Callbacks', left: '<code>onStartCommand</code>', right: '<code>onBind</code> / <code>onUnbind</code>' },
                        { aspect: 'For', left: 'Fire-and-forget work', right: 'An ongoing client–server relationship' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'The two lifecycles',
                    code: `Started                          Bound
  startService()                   bindService()
      ↓                                ↓
  onCreate()   (first time only)   onCreate()   (first client only)
      ↓                                ↓
  onStartCommand()  ← each call    onBind()     (first client only)
      ↓                                ↓
   running…                         running…
      ↓                                ↓
  stopSelf() / stopService()       every client unbinds → onUnbind()
      ↓                                ↓
  onDestroy()                      onDestroy()

A service can be both at once, and then it survives until BOTH conditions
are met: it has been stopped AND every client has unbound.`,
                    notes: '<code>onCreate</code> runs once per service instance, not once per <code>startService</code> call — the same relationship <code>onCreate</code> has to <code>onStart</code> in an activity (M13).'
                },
                {
                    type: 'types',
                    title: 'Names you will meet in older code',
                    items: [
                        { name: 'IntentService', html: '<p>A service with a worker thread and a queue: each intent was handled off the main thread, sequentially, and the service stopped itself when the queue drained. Deprecated in API 30, because the background execution limits mean it often cannot be started at all.</p>' },
                        { name: 'JobIntentService', html: '<p>The compatibility bridge — an <code>IntentService</code> on old versions, a <code>JobScheduler</code> job on new ones. Also deprecated; it existed to survive a transition that <code>WorkManager</code> then completed.</p>' },
                        { name: 'The modern replacement', html: '<p><code>WorkManager</code> for anything deferrable (M30), a coroutine for anything tied to the screen, and a foreground service only when the user must be told it is happening.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The return value of <code>onStartCommand</code> decides what happens if the system kills the process mid-work. <code>START_NOT_STICKY</code> lets it stay dead, <code>START_STICKY</code> recreates the service with a null intent, and <code>START_REDELIVER_INTENT</code> recreates it with the last intent redelivered — the only one of the three that is safe for work that must actually complete.</p>'
                }
            ],
            docs: [
                { title: 'Services overview', path: '/develop/background-work/services', kind: 'guide' },
                { title: 'Background work overview', path: '/develop/background-work/background-tasks', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-service' },
                { topicId: 'android', questionId: 'android-service-lifecycle' },
                { topicId: 'android', questionId: 'android-service-thread' },
                { topicId: 'android', questionId: 'android-service-vs-intentservice' }
            ]
        },

        {
            id: 'foreground-services',
            title: 'Foreground services',
            importance: 'must-know',
            summary: 'A visible, non-dismissable notification bought with a declared type and a reason for starting.',
            interviewAngle: 'The type requirement and the start restrictions are recent, and knowing them dates your knowledge accurately.',
            buildsOn: ['service-basics'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Foreground service',
                    important: true,
                    html: '<p>A service the user is aware of, because it must post an ongoing notification. In exchange the process is treated as foreground-important (M12), so it is near the last thing killed under memory pressure and is largely exempt from background restrictions while it runs.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The notification is the entire bargain. The user can see that something is running, which is what justifies the process keeping resources the system would otherwise reclaim — so it cannot be hidden, and it appears within five seconds whether you post it or not.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Starting one, with its type',
                    code: `// Manifest — the type is mandatory from API 34, and must be justified
// to Play at review time.
// <service android:name=".UploadService"
//          android:foregroundServiceType="dataSync" />

class UploadService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, id: Int): Int {
        startForeground(
            NOTIFICATION_ID,
            buildNotification(),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
        )
        scope.launch {                       // still your job to leave the main thread
            uploader.run()
            stopSelf()
        }
        return START_REDELIVER_INTENT
    }
}`,
                    notes: 'Declaring the wrong type throws at runtime, and the permission matching the type — for example <code>FOREGROUND_SERVICE_DATA_SYNC</code> — must also be in the manifest.'
                },
                {
                    type: 'types',
                    title: 'The restrictions worth naming',
                    items: [
                        { name: 'You often cannot start one from the background', html: '<p>Since Android 12, starting a foreground service while the app is backgrounded throws <code>ForegroundServiceStartNotAllowedException</code> unless you fit an exemption — a visible activity, a high-priority push message, an exact alarm, a few others.</p>' },
                        { name: 'The type is mandatory', html: '<p>From Android 14 every foreground service declares a type — <code>dataSync</code>, <code>location</code>, <code>mediaPlayback</code>, <code>camera</code> and so on — and Play requires a justification for the more sensitive ones.</p>' },
                        { name: 'dataSync is time-limited', html: '<p>Android 15 caps <code>dataSync</code> and <code>mediaProcessing</code> at roughly six hours per day, after which the system stops it. Long-running sync is meant to be <code>WorkManager</code>, and this is the platform enforcing that.</p>' },
                        { name: 'startForeground within five seconds', html: '<p>Miss the window after <code>startForegroundService</code> and the system throws an ANR-style crash. The notification must be ready before the work begins.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The clean way to answer "when would you use a foreground service?" is by the user’s expectation, not by the technology: music the user started, a run being tracked, a navigation route, a file transfer with visible progress. If the user would be surprised to learn it was running, it is not a foreground service — it is <code>WorkManager</code> work you have not justified.</p>'
                }
            ],
            docs: [
                { title: 'Foreground services', path: '/develop/background-work/services/fgs', kind: 'guide' },
                { title: 'Foreground service types', path: '/develop/background-work/services/fgs/service-types', kind: 'guide' },
                { title: 'Foreground service launch restrictions', path: '/develop/background-work/services/fgs/restrictions-bg-start', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-foreground-service' },
                { topicId: 'android', questionId: 'android-service' }
            ]
        },

        {
            id: 'bound-services',
            title: 'Binding, and reaching across processes',
            importance: 'should-know',
            summary: 'A bound service is a client–server relationship inside your app, or a Binder interface outside it.',
            interviewAngle: 'The in-process case is simple and the cross-process case is M15 — knowing which one is being asked matters.',
            buildsOn: ['service-basics'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Binding gives a client a direct handle on a running service. In the same process that handle is just an object — a <code>LocalBinder</code> returning the service instance — so calls are ordinary method calls with no marshalling and no thread hop. Across processes it becomes a Binder proxy, and everything in M15 applies.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The in-process case, which is most of them',
                    code: `class PlayerService : Service() {
    inner class LocalBinder : Binder() {
        fun service(): PlayerService = this@PlayerService
    }
    override fun onBind(intent: Intent) = LocalBinder()

    val position: StateFlow<Duration> = …      // observed by the client
}

private val connection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName, binder: IBinder) {
        player = (binder as PlayerService.LocalBinder).service()
    }
    override fun onServiceDisconnected(name: ComponentName) { player = null }
}

override fun onStart() { bindService(intent, connection, Context.BIND_AUTO_CREATE) }
override fun onStop()  { unbindService(connection) }      // or the service leaks`,
                    notes: 'Binding in <code>onStart</code> and unbinding in <code>onStop</code> is the M13 pairing rule again — and forgetting the second half keeps the service alive for the life of the process.'
                },
                {
                    type: 'pitfall',
                    html: '<p>The connection is asynchronous. <code>bindService</code> returns before <code>onServiceConnected</code> runs, so any code that assumes the binder is available immediately after the call will read null — and it will usually work on a fast device, which is what makes it a production bug.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>For a service another app binds to, the interface has to cross a process boundary and the options are the ones from M15 — <code>Messenger</code> for simple, serialised messaging and AIDL for a concurrent typed interface. The service must also be exported, which makes it an attack surface: validate the caller, because anything on the device can bind to it.</p>'
                }
            ],
            docs: [
                { title: 'Bound services', path: '/develop/background-work/services/bound-services', kind: 'guide' },
                { title: 'Services overview', path: '/develop/background-work/services', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-aidl' },
                { topicId: 'android', questionId: 'android-two-apps-interact' }
            ]
        }
    ]
};
