/* ==========================================================================
   M30 — Background work.

   The decision comes first and the API second, because almost every wrong
   answer here is a right API applied to the wrong question. "Background" on
   Android means two unrelated things — off the main thread, and outside the
   screen's lifetime — and conflating them is the root of most of it.
   ========================================================================== */

const backgroundWorkModule = {
    id: 'background-work',
    trackId: 'data',
    order: 30,
    title: 'Background Work',
    tagline: 'Decide whether it must survive the app first; pick the API second.',
    estimatedMinutes: 30,
    prerequisites: ['structured-concurrency'],
    docHub: {
        title: 'Background work overview',
        path: '/develop/background-work/background-tasks'
    },

    chapters: [
        {
            id: 'choosing',
            title: 'Choosing where work runs',
            importance: 'must-know',
            summary: 'Two questions — must it finish, and is the user waiting — decide the answer.',
            interviewAngle: '"How would you run this in the background?" is a trap unless you ask what the work is first.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Android uses "background" for two things that have nothing to do with each other. <strong>Off the main thread</strong> is a threading concern, answered by coroutines (M7–M9). <strong>Outside the lifetime of the screen that asked for it</strong> is a lifecycle concern, and it is the one that needs a platform API. Loading a list while the user watches is the first kind; uploading a photo that must arrive even if they close the app is the second.</p>'
                },
                {
                    type: 'table',
                    title: 'The decision',
                    headers: ['If the work…', 'Use', 'Survives the app closing', 'Notification'],
                    rows: [
                        ['Is only useful while the screen lives', '<code>viewModelScope</code>', 'No — cancelled with it', 'No'],
                        ['Must finish, but not right now', 'WorkManager', 'Yes — across reboot', 'No'],
                        ['Must finish and the user can see it', 'Foreground service (M31)', 'While it runs', 'Required'],
                        ['Must happen at a wall-clock time', 'AlarmManager', 'Yes', 'Depends'],
                        ['Must react to a system event', 'WorkManager constraint', 'Yes', 'No']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The first row is the one people skip. A network call for the screen in front of the user does <em>not</em> need <code>WorkManager</code> — it needs <code>viewModelScope</code>, and being cancelled when the user leaves is the correct behaviour rather than a limitation. Reaching for a scheduler there costs you a job record, a serialisation boundary and a result you cannot easily deliver back.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>The mirror-image error is using a coroutine for work that must survive. <code>GlobalScope.launch</code> is not durable — the process can be killed the moment the app is cached (M12), and the upload simply never happens. It is unstructured <em>and</em> unreliable, which is why it is the wrong answer in both directions.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Whatever the choice, the main thread stays free. The ANR watchdog fires at roughly five seconds of an unresponsive input queue, and the causes are almost always the same three: a synchronous network or disk call on the main thread, a lock held by a background thread the main thread is waiting on, and heavy work in a lifecycle callback or <code>onReceive</code>. StrictMode in debug builds catches the first family before a user does.</p>'
                }
            ],
            docs: [
                { title: 'Background work overview', path: '/develop/background-work/background-tasks', kind: 'guide' },
                { title: 'Keep your app responsive', path: '/topic/performance/anrs/keep-your-app-responsive', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-background-processing' },
                { topicId: 'android', questionId: 'android-anr' },
                { topicId: 'android', questionId: 'android-parallel-tasks-callback' }
            ]
        },

        {
            id: 'workmanager',
            title: 'WorkManager',
            importance: 'must-know',
            summary: 'Deferrable work that is guaranteed to run — persisted to disk, and rescheduled after a reboot.',
            interviewAngle: '"How does WorkManager guarantee execution?" The answer is a database, not a clever thread.',
            buildsOn: ['choosing'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The guarantee is unglamorous and worth stating plainly: <code>WorkManager</code> writes your request into its own SQLite database. That row outlives the process, and a <code>BroadcastReceiver</code> on boot reschedules everything still pending. Nothing is kept in memory, so nothing is lost when the process dies.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>It does not run the work itself either. Underneath it delegates to whatever the device supports — <code>JobScheduler</code> on modern versions, <code>AlarmManager</code> plus a receiver on older ones — which is the other half of what it buys you: one API instead of a version check.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A worker, its constraints, and unique work',
                    code: `class SyncWorker(context: Context, params: WorkerParameters) :
    CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = try {
        repository.sync()
        Result.success()
    } catch (e: IOException) {
        Result.retry()              // exponential backoff, handled for us
    } catch (e: SerializationException) {
        Result.failure()            // will never succeed; do not retry
    }
}

val request = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)
            .setRequiresCharging(true)
            .build()
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .build()

// KEEP: a second enqueue while one is pending is ignored, rather than
// queueing a duplicate — the fix for a burst of edits (M29).
WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "sync", ExistingPeriodicWorkPolicy.KEEP, request
)`,
                    notes: 'The minimum period for periodic work is <strong>15 minutes</strong>, and the interval is a floor, not a promise — the system batches jobs, so it may run later.'
                },
                {
                    type: 'types',
                    title: 'The parts that come up',
                    items: [
                        { name: 'Result.retry versus failure', html: '<p><code>retry</code> re-enqueues with backoff and is for transient problems; <code>failure</code> is terminal. Returning <code>retry</code> for a malformed payload retries forever against a body that will never parse.</p>' },
                        { name: 'Constraints', html: '<p>Network type, charging, battery not low, storage not low, device idle. This is how you stop being the app that syncs on cellular at 3%.</p>' },
                        { name: 'Chaining', html: '<p><code>beginWith(a).then(b, c).then(d)</code> — parallel steps and sequencing, with output passed between them. Compress, then upload, then clean up.</p>' },
                        { name: 'Unique work', html: '<p><code>KEEP</code>, <code>REPLACE</code> or <code>APPEND</code> against a name, so a repeated enqueue does not multiply. The most common reason an app runs the same sync six times.</p>' },
                        { name: 'Expedited work', html: '<p>For work that is important and user-initiated but still deferrable. The system grants a quota; exceed it and requests are deferred or run as regular work depending on the policy you chose.</p>' },
                        { name: 'Observing it', html: '<p><code>getWorkInfoByIdFlow</code> reports state back to the UI, which is how a screen shows an upload’s progress without owning it.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Input and output travel as <code>Data</code>, capped at roughly 10&nbsp;KB, because they are serialised into that database. Passing a payload rather than an id fails at runtime with an unhelpful error — the same "save the key, not the data" rule as M13’s saved state, for the same underlying reason.</p>'
                }
            ],
            docs: [
                { title: 'Persistent work', path: '/develop/background-work/background-tasks/persistent', kind: 'guide' },
                { title: 'Define work requests', path: '/develop/background-work/background-tasks/persistent/getting-started/define-work', kind: 'guide' },
                { title: 'Getting started with WorkManager', path: '/develop/background-work/background-tasks/persistent/getting-started', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-workmanager-explain' },
                { topicId: 'android', questionId: 'android-workmanager-guarantee' },
                { topicId: 'android', questionId: 'android-workmanager-guarantee-execution' },
                { topicId: 'android', questionId: 'android-workmanager-repeat-interval' },
                { topicId: 'android', questionId: 'android-jobscheduler' }
            ]
        },

        {
            id: 'limits',
            title: 'Alarms, Doze and the limits',
            importance: 'should-know',
            summary: 'The system will delay your work to save battery, and exact timing must be justified.',
            interviewAngle: 'Doze and standby buckets explain why "my background job stopped running" is usually working as intended.',
            buildsOn: ['workmanager'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Every restriction below exists because unrestricted background work is what drained phones. The platform’s position is that the system schedules, and the app justifies any exception — so the answer to "my job did not run overnight" is usually that it ran, batched, at a moment the system chose.</p>'
                },
                {
                    type: 'types',
                    title: 'What holds work back',
                    items: [
                        { name: 'Doze', html: '<p>The device is stationary, unplugged and screen-off, so network access and jobs are deferred and batched into periodic maintenance windows, which grow further apart the longer it lasts. Ends immediately when the user picks the phone up.</p>' },
                        { name: 'App Standby buckets', html: '<p>Apps are bucketed by how recently and often they are used — active, working set, frequent, rare, restricted — and each bucket caps how often jobs and alarms may run. An app the user opens daily is barely affected; one opened monthly is heavily throttled.</p>' },
                        { name: 'Background execution limits', html: '<p>Since API 26 a backgrounded app cannot start a normal service freely and manifest receivers stopped getting most implicit broadcasts (M15). The intended replacement is a scheduled job with constraints.</p>' },
                        { name: 'Battery optimisation exemptions', html: '<p>Users can exempt an app, and Play restricts asking for it to a small set of legitimate cases. Requiring the exemption for ordinary sync is a rejection risk, not a design.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'AlarmManager versus WorkManager',
                    left: 'AlarmManager',
                    right: 'WorkManager',
                    rows: [
                        { aspect: 'Triggers on', left: 'A wall-clock or elapsed time', right: 'Conditions being met' },
                        { aspect: 'Survives reboot', left: 'Only if you re-register', right: 'Yes, automatically' },
                        { aspect: 'Constraints', left: 'None', right: 'Network, charging, idle, storage' },
                        { aspect: 'Delivered as', left: 'A <code>PendingIntent</code> (M15)', right: 'A worker with a result' },
                        { aspect: 'Right for', left: 'Calendar reminders, alarm clocks', right: 'Everything else' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p><code>AlarmManager</code> is for work that means nothing at another time. A 7&nbsp;a.m. alarm is useless at 7:20; a sync is not. <code>setExactAndAllowWhileIdle</code> pierces Doze, and since Android 14 <code>SCHEDULE_EXACT_ALARM</code> is a special permission (M17) granted through a Settings screen — the platform asking you to prove the exactness matters.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Asked how to reduce battery use, answer in the platform’s own terms: batch work rather than trickling it, attach constraints so it waits for charging and unmetered network, use push instead of polling (M28), avoid wake locks and never hold one without a timeout, and stop location and sensor updates in <code>onStop</code> (M13). Those are the levers that actually move a battery graph.</p>'
                }
            ],
            docs: [
                { title: 'Optimize for Doze and App Standby', path: '/training/monitoring-device-state/doze-standby', kind: 'guide' },
                { title: 'Schedule alarms', path: '/develop/background-work/services/alarms', kind: 'guide' },
                { title: 'Background optimizations', path: '/topic/performance/background-optimization', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-doze-app-standby' },
                { topicId: 'android', questionId: 'android-reduce-battery' },
                { topicId: 'android', questionId: 'android-adaptive-battery-ml' },
                { topicId: 'other-topics', questionId: 'local-notification-exact-time' }
            ]
        }
    ]
};
