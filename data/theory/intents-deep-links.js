/* ==========================================================================
   M15 — Intents, broadcasts, deep links and talking to other apps.

   Everything in this module crosses a boundary — between components, between
   apps, or between the web and your app — which is why it all rests on the
   Binder and sandbox material from M12.
   ========================================================================== */

const intentsDeepLinksModule = {
    id: 'intents-deep-links',
    trackId: 'platform',
    order: 15,
    title: 'Intents, Deep Links and Other Apps',
    tagline: 'A message the system delivers, sometimes to code you did not write.',
    estimatedMinutes: 30,
    prerequisites: ['activities-lifecycle'],
    docHub: {
        title: 'Intents and intent filters',
        path: '/guide/components/intents-filters'
    },

    chapters: [
        {
            id: 'intents',
            title: 'Explicit and implicit intents',
            importance: 'must-know',
            summary: 'Name the component, or describe the job and let the system find someone who does it.',
            interviewAngle: 'The distinction is easy; the follow-up about resolution failing on Android 11+ is the one that separates answers.',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Intent',
                    important: true,
                    html: '<p>A message object describing an operation to be performed. It is the universal currency for starting components — the same object launches an activity, starts a service and delivers a broadcast — and because it travels over Binder, its payload must be parcelable.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Explicit versus implicit',
                    left: 'Explicit',
                    right: 'Implicit',
                    rows: [
                        { aspect: 'Names', left: 'A specific class or component', right: 'An action, and often data' },
                        { aspect: 'Resolved by', left: 'Nothing — it is already decided', right: 'The package manager, against intent filters' },
                        { aspect: 'Target', left: 'Almost always your own app', right: 'Any app that declared it can help' },
                        { aspect: 'Can fail', left: 'Only if the class is wrong', right: 'Yes — nothing may handle it' },
                        { aspect: 'Typical use', left: 'Your own navigation', right: 'Share, dial, open a URL, pick a photo' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Both, and the check that stops the crash',
                    code: `// Explicit — you know exactly which component runs.
startActivity(Intent(this, DetailActivity::class.java).putExtra("id", itemId))

// Implicit — you describe the job.
val share = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "Worth a read: \\u0024url")
}
// Always offer the chooser rather than silently picking a default.
startActivity(Intent.createChooser(share, "Share via"))

// Nothing may be installed that can handle it.
val dial = Intent(Intent.ACTION_DIAL, "tel:5550100".toUri())
if (dial.resolveActivity(packageManager) != null) startActivity(dial)
// …or just catch it, which is more robust on Android 11+:
runCatching { startActivity(dial) }.onFailure { showNoAppInstalled() }`,
                    notes: 'An unhandled implicit intent throws <code>ActivityNotFoundException</code>. On a phone with no dialler — a tablet, an emulator — the dial case is not hypothetical.'
                },
                {
                    type: 'prose',
                    html: '<p>An intent filter in the manifest is how an app advertises what it can handle. Resolution matches on three things — <strong>action</strong>, <strong>data</strong> (scheme, host, MIME type) and <strong>category</strong> — and a filter must match all three parts of the intent to be a candidate. If several match, the system shows a chooser; if one is set as default, it wins silently, which is why <code>createChooser</code> is usually the more honest call.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>From Android 11, <code>resolveActivity</code> and <code>queryIntentActivities</code> only see apps your manifest declares an interest in. Without a <code>&lt;queries&gt;</code> element the check returns null even though a perfectly good handler is installed, and the feature silently stops working on new devices. This is <strong>package visibility</strong>, and it is a genuinely common production surprise.</p>'
                },
                {
                    type: 'syntax',
                    language: 'xml',
                    title: 'Declaring what you need to see, and what you handle',
                    code: `<!-- Without this, resolveActivity() cannot see a browser on Android 11+. -->
<queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="https" />
    </intent>
</queries>

<!-- Advertising that this activity can receive shared text. -->
<activity android:name=".ShareTargetActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="text/plain" />
    </intent-filter>
</activity>`,
                    notes: 'Some intents are exempt — <code>ACTION_SEND</code> through a chooser, and the common intents that open a system app — because the user, not your code, is choosing the target.'
                }
            ],
            docs: [
                { title: 'Intents and intent filters', path: '/guide/components/intents-filters', kind: 'guide' },
                { title: 'Common intents', path: '/guide/components/intents-common', kind: 'guide' },
                { title: 'Package visibility filtering', path: '/training/package-visibility', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-intent' },
                { topicId: 'android', questionId: 'android-explicit-intent' },
                { topicId: 'android', questionId: 'android-implicit-intent' }
            ]
        },

        {
            id: 'broadcasts',
            title: 'Broadcasts and PendingIntent',
            importance: 'must-know',
            summary: 'A broadcast is a fan-out message; a PendingIntent is permission for someone else to act as you.',
            interviewAngle: 'PendingIntent mutability has been mandatory since API 31 — naming FLAG_IMMUTABLE and why reads as current.',
            buildsOn: ['intents'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Broadcasts are the system’s publish–subscribe channel: connectivity changed, the device booted, the battery is low. They are cheap to send and expensive to receive badly, and most of the last decade of Android releases has been about restricting them.</p>'
                },
                {
                    type: 'types',
                    title: 'The kinds worth naming',
                    items: [
                        { name: 'Normal', html: '<p>Delivered to all receivers in an undefined order, asynchronously. The default and nearly always what you want.</p>' },
                        { name: 'Ordered', html: '<p>Delivered one receiver at a time by priority, each able to modify the result or abort it entirely. Slow, and rarely justified.</p>' },
                        { name: 'Sticky', html: '<p>Deprecated. The last value was retained and handed to late subscribers — no security, no guarantee of freshness. A <code>StateFlow</code> is what you actually wanted (M11).</p>' },
                        { name: 'Local', html: '<p><code>LocalBroadcastManager</code> is deprecated too. It was a system-wide bus used for in-process messaging; the replacement is a <code>SharedFlow</code> or <code>StateFlow</code> in a shared component, which is type-safe and testable.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Where a receiver is registered',
                    left: 'Manifest-declared',
                    right: 'Context-registered',
                    rows: [
                        { aspect: 'Lives', left: 'Independent of your process', right: 'Only while registered' },
                        { aspect: 'Wakes the app', left: 'Yes — a process is started for it', right: 'No' },
                        { aspect: 'Implicit broadcasts', left: 'Blocked since API 26, with exceptions', right: 'Still delivered' },
                        { aspect: 'Unregistering', left: 'Nothing to do', right: 'Yours, or it leaks' },
                        { aspect: 'Use for', left: 'Boot completed, explicit app-to-app', right: 'Anything you care about only while visible' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The API 26 restriction is the one to know. Manifest-declared receivers stopped getting most implicit broadcasts, because every install added another process the system had to spin up whenever connectivity flickered. If work must happen on a system condition, the answer is <code>WorkManager</code> with constraints, not a manifest receiver — and from API 34, context-registered receivers must also declare whether they are exported.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>onReceive</code> runs on the main thread and the process may be killed the moment it returns. There is roughly ten seconds before an ANR, and no legitimate way to start a coroutine and hope. Hand off to <code>WorkManager</code>, or use <code>goAsync()</code> for a short, bounded piece of work.</p>'
                },
                {
                    type: 'definition',
                    term: 'PendingIntent',
                    important: true,
                    html: '<p>A token that wraps an intent together with your app’s identity and permissions, handed to another process so it can perform that action <em>as you</em>, later. The notification shade, the alarm manager and app widgets all need one, because they act after your process is gone.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Mutability, which is now mandatory',
                    code: `// The common case: the recipient only fires it, never edits it.
val open = PendingIntent.getActivity(
    context,
    requestCode = 0,
    Intent(context, MainActivity::class.java).putExtra("id", itemId),
    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
)

// FLAG_MUTABLE only where the platform must fill something in — a direct-
// reply notification action needs to add the typed text.
val reply = PendingIntent.getBroadcast(
    context, 1, replyIntent, PendingIntent.FLAG_MUTABLE
)`,
                    notes: 'From API 31 one of the two flags must be present or the call throws. Defaulting to <code>FLAG_IMMUTABLE</code> is right: a mutable <code>PendingIntent</code> lets the holder rewrite the intent and have your app execute it.'
                },
                {
                    type: 'tip',
                    html: '<p>The <code>requestCode</code> is part of a <code>PendingIntent</code>’s identity, and extras are <em>not</em>. Two notifications built with the same request code are the same <code>PendingIntent</code>, so without <code>FLAG_UPDATE_CURRENT</code> the second silently reuses the first one’s extras — tapping notification five opens item one.</p>'
                }
            ],
            docs: [
                { title: 'Broadcasts overview', path: '/develop/background-work/background-tasks/broadcasts', kind: 'guide' },
                { title: 'Implicit broadcast exceptions', path: '/develop/background-work/background-tasks/broadcasts/broadcast-exceptions', kind: 'guide' },
                { title: 'PendingIntent', path: '/reference/android/app/PendingIntent', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-broadcast-receiver' },
                { topicId: 'android', questionId: 'android-broadcast-types' },
                { topicId: 'android', questionId: 'android-broadcasts-intents-messaging' },
                { topicId: 'android', questionId: 'android-pending-intent' },
                { topicId: 'other-topics', questionId: 'local-notification-exact-time' }
            ]
        },

        {
            id: 'deep-links',
            title: 'Deep links and App Links',
            importance: 'must-know',
            summary: 'Any app can claim a custom scheme; only a verified owner can claim an https link without a chooser.',
            interviewAngle: '"Deep link versus App Link" is really a question about verification and about who else could intercept the URL.',
            buildsOn: ['intents'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A deep link is an implicit <code>ACTION_VIEW</code> intent your app declared a filter for. That is the whole mechanism — which is also the problem, because nothing stops a second app declaring the same filter.</p>'
                },
                {
                    type: 'table',
                    title: 'The three things people call deep links',
                    headers: ['Kind', 'Example', 'Who can claim it', 'Opens'],
                    rows: [
                        ['Custom scheme', 'droiddeck://item/42', 'Any app — first come, no ownership', 'A chooser if more than one'],
                        ['Web link', 'https://droiddeck.dev/item/42', 'Any app declaring the filter', 'A chooser, including the browser'],
                        ['Verified App Link', 'https://droiddeck.dev/item/42', 'Only the verified domain owner', 'Your app, directly']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Verification is what makes the third row different. You publish <code>assetlinks.json</code> at <code>https://your-domain/.well-known/assetlinks.json</code> listing your package name and signing certificate fingerprint; at install time the system fetches it and confirms the claim. Custom schemes cannot be verified by anyone, which is why a malicious app can register <code>yourbank://</code> and why sensitive flows should never rely on one.</p>'
                },
                {
                    type: 'syntax',
                    language: 'xml',
                    title: 'The filter that makes it an App Link',
                    code: `<activity android:name=".MainActivity" android:exported="true">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="droiddeck.dev" />
    </intent-filter>
</activity>`,
                    notes: '<code>BROWSABLE</code> is what allows a browser to hand the link over, and <code>autoVerify="true"</code> is what triggers the assetlinks check. Miss either and the link opens a chooser instead of your app.'
                },
                {
                    type: 'types',
                    title: 'What the destination has to get right',
                    items: [
                        { name: 'A synthesised back stack', html: '<p>The user arrived from outside, so Up must lead somewhere sensible even though they never visited the parent — the Up-versus-Back distinction from M24, in its most visible form.</p>' },
                        { name: 'Signed-out and unknown-id states', html: '<p>A deep link is an untrusted, arbitrary URL from the internet. It may point at content that has been deleted, or that this user cannot see.</p>' },
                        { name: 'Handling it on re-entry', html: '<p>If the activity is <code>singleTop</code> the link arrives in <code>onNewIntent</code>, not <code>onCreate</code> (M13).</p>' },
                        { name: 'Testing without a build', html: '<p><code>adb shell am start -a android.intent.action.VIEW -d "https://droiddeck.dev/item/42"</code> exercises the real resolution path.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Navigation supports deep links directly: a destination declares its own <code>deepLink</code>, and the library builds the back stack for you rather than leaving you to construct it with <code>TaskStackBuilder</code>. Mentioning that is a good way to end the answer.</p>'
                }
            ],
            docs: [
                { title: 'Handle Android App Links', path: '/training/app-links', kind: 'guide' },
                { title: 'Verify Android App Links', path: '/training/app-links/verify-applinks', kind: 'guide' },
                { title: 'Create a deep link for a destination', path: '/guide/navigation/design/deep-link', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-implicit-intent' },
                { topicId: 'android', questionId: 'android-push-notifications' },
                { topicId: 'other-topics', questionId: 'fcm-push-notification-flow' }
            ]
        },

        {
            id: 'ipc',
            title: 'Talking to another app',
            importance: 'should-know',
            summary: 'Separate processes share no memory, so every option here is Binder wearing a different coat.',
            interviewAngle: 'AIDL is asked more than it is used. Knowing when it is overkill is worth more than knowing its syntax.',
            buildsOn: ['broadcasts'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Two apps are two Linux users with two heaps (M12). Nothing is shared, so every mechanism below is a way of marshalling data through the kernel — and the right question is always which is the <em>cheapest</em> one that does the job.</p>'
                },
                {
                    type: 'table',
                    title: 'The options, cheapest first',
                    headers: ['Mechanism', 'Shape', 'Concurrent calls', 'Reach for it when'],
                    rows: [
                        ['Intent', 'Fire and forget, or a result', 'n/a', 'Almost always — starting a screen, sharing content'],
                        ['ContentProvider', 'CRUD over a URI', 'Yes', 'Exposing structured data — contacts, media, files'],
                        ['Messenger', 'A queue of Messages', 'No — serialised on one thread', 'Simple, low-volume, ordered messaging'],
                        ['AIDL', 'A generated typed interface', 'Yes — multi-threaded', 'A real API surface with many calls'],
                        ['Broadcast', 'Fan-out notification', 'n/a', 'Telling several listeners something happened']
                    ]
                },
                {
                    type: 'definition',
                    term: 'AIDL',
                    html: '<p>Android Interface Definition Language. You write an interface in a <code>.aidl</code> file; the tooling generates a proxy for the client and a stub for the service, both of which marshal arguments across Binder. The steps: define the interface, implement the <code>Stub</code> inside a service, return that binder from <code>onBind</code>, and have the client <code>bindService</code> and call <code>asInterface</code> on what it receives.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The trade-off between <code>Messenger</code> and AIDL is concurrency. A <code>Messenger</code> funnels everything onto one thread, so you never think about locking; AIDL calls arrive on a binder thread pool, so the service must be thread-safe. Choose <code>Messenger</code> unless you need the throughput — and choose neither if an intent or a provider would do.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>AIDL is a common wrong answer to "how do two apps share data". It is right for a service exposing an interface, and overkill for handing over a value or a file, which an intent and a content URI already do — with the added benefit that a <code>FileProvider</code> URI grants temporary read permission to exactly one recipient rather than opening anything up.</p>'
                },
                {
                    type: 'types',
                    title: 'Multiple processes inside one app',
                    items: [
                        { name: 'How', html: '<p><code>android:process=":sync"</code> on a component puts it in a second process. Used to isolate a crashy native library, or to keep a large background component out of the UI process’s memory footprint.</p>' },
                        { name: 'What breaks', html: '<p>Statics are per-process, so any singleton exists twice and <code>Application.onCreate</code> runs in each. Shared in-memory caches quietly stop being shared, which is usually a bigger cost than the isolation is worth.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Android Interface Definition Language (AIDL)', path: '/develop/background-work/services/aidl', kind: 'guide' },
                { title: 'Content providers', path: '/guide/topics/providers/content-providers', kind: 'guide' },
                { title: 'Share files with FileProvider', path: '/training/secure-file-sharing/setup-sharing', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-two-apps-interact' },
                { topicId: 'android', questionId: 'android-aidl' },
                { topicId: 'android', questionId: 'android-content-provider' },
                { topicId: 'android', questionId: 'android-multiple-processes' }
            ]
        }
    ]
};
