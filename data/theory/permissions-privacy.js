/* ==========================================================================
   M17 — Permissions and privacy.

   Closes the platform track. Every release since Android 6 has moved in one
   direction — less data, granted later, for shorter — so the module is
   organised around that direction rather than around an API list.
   ========================================================================== */

const permissionsPrivacyModule = {
    id: 'permissions-privacy',
    trackId: 'platform',
    order: 17,
    title: 'Permissions and Privacy',
    tagline: 'Ask for less, ask later, and expect to be told no.',
    estimatedMinutes: 25,
    prerequisites: ['intents-deep-links'],
    docHub: {
        title: 'Permissions on Android',
        path: '/guide/topics/permissions/overview'
    },

    chapters: [
        {
            id: 'permission-model',
            title: 'The permission model',
            importance: 'must-know',
            summary: 'Protection level decides whether a declaration is enough or the user must be asked.',
            interviewAngle: '"What are the protection levels?" is the question; knowing that special permissions are a fourth case is the differentiator.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Permissions are enforced by the sandbox from M12: they are the exceptions to "this app is a Linux user that can see nothing". What kind of exception it is determines how it is granted.</p>'
                },
                {
                    type: 'table',
                    title: 'Protection levels',
                    headers: ['Level', 'Granted', 'Revocable', 'Examples'],
                    rows: [
                        ['Normal', 'At install, from the manifest', 'No', 'INTERNET, VIBRATE, SET_ALARM'],
                        ['Dangerous', 'By the user, at runtime', 'Yes, any time', 'CAMERA, RECORD_AUDIO, location'],
                        ['Signature', 'Only to apps signed with the same key', 'No', 'Sharing data between your own apps'],
                        ['Special', 'Through a dedicated Settings screen', 'Yes', 'SYSTEM_ALERT_WINDOW, exact alarms, all-files access']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Special permissions are the ones people forget. They are too powerful for a dialog, so there is no dialog — you send the user to a Settings page with an intent and check the result when they return. <code>MANAGE_EXTERNAL_STORAGE</code> also needs a justification at review time, and Play will reject an app that cannot make the case.</p>'
                },
                {
                    type: 'definition',
                    term: 'Permission group',
                    html: '<p>Related dangerous permissions presented to the user as one concept — the two location permissions, or reading and writing contacts. Historically, granting one granted its group-mates; since Android 10 each is granted individually and the group only shapes what the dialog says.</p>'
                },
                {
                    type: 'types',
                    title: 'Things that surprise people',
                    items: [
                        { name: 'A grant is not permanent', html: '<p>The user can revoke it in Settings while your app is backgrounded, and Android 11 auto-revokes permissions for apps left unused for a few months. Check before every use; never cache the result.</p>' },
                        { name: 'Notifications need one now', html: '<p><code>POST_NOTIFICATIONS</code> became a runtime permission in Android 13. An app that assumed notifications always work silently stops notifying.</p>' },
                        { name: 'targetSdk decides the rules', html: '<p>The platform applies the behaviour of the SDK you target, not the one on the device. Raising <code>targetSdk</code> is what opts you into stricter rules — which is why the annual Play requirement is a real migration, not a version bump.</p>' },
                        { name: 'Declaring costs you reach', html: '<p>Some permissions imply hardware. Declaring CAMERA implies <code>uses-feature</code> camera unless you set <code>required="false"</code>, and Play then hides your app from devices without one.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Permissions on Android', path: '/guide/topics/permissions/overview', kind: 'guide' },
                { title: 'Notification runtime permission', path: '/develop/ui/compose/notifications/notification-permission', kind: 'guide' },
                { title: 'App permissions best practices', path: '/training/permissions/usage-notes', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-permission-levels' }
            ]
        },

        {
            id: 'runtime-requests',
            title: 'Requesting at runtime',
            importance: 'must-know',
            summary: 'Check, explain if needed, request, and handle the permanent no.',
            interviewAngle: 'The four-state flow — granted, not asked, rationale needed, permanently denied — is what a complete answer covers.',
            buildsOn: ['permission-model'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The mistake is treating this as two states. There are four, and the one people miss is the difference between "not asked yet" and "denied permanently" — which the API deliberately does not tell you directly.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The full flow, using the result API from M13',
                    code: `private val requestCamera = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
) { granted ->
    if (granted) openCamera() else showPermanentlyDeniedUi()
}

private fun takePhoto() = when {
    ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED -> openCamera()

    // The system says an explanation would help: they denied once before.
    shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) ->
        showRationale(onContinue = { requestCamera.launch(Manifest.permission.CAMERA) })

    // Either never asked, or denied for good — indistinguishable here.
    else -> requestCamera.launch(Manifest.permission.CAMERA)
}`,
                    notes: 'There is no "permanently denied" API. You infer it: the launch returned immediately with a denial and <code>shouldShowRequestPermissionRationale</code> is still false, so no dialog was shown.'
                },
                {
                    type: 'prose',
                    html: '<p>Once a permission is permanently denied, nothing you call will show the dialog again. The only route is an intent to your app’s Settings page, and the only honest UI is to say what the feature needs and offer to open Settings — not a loop that asks again and does nothing.</p>'
                },
                {
                    type: 'types',
                    title: 'The location cases they ask about',
                    items: [
                        { name: 'Coarse and fine', html: '<p>Since Android 12 the dialog offers <em>Precise</em> or <em>Approximate</em> even when you asked for fine, so you can be granted coarse when you requested fine. Request both together and handle the downgrade.</p>' },
                        { name: 'One-time', html: '<p>"Only this time" grants until the app is backgrounded. Any assumption that a granted permission stays granted for the session is wrong.</p>' },
                        { name: 'Background location', html: '<p>Must be requested <em>separately</em>, after foreground location is already granted, and it opens Settings rather than a dialog. Play requires a video demonstration and a justification to ship it.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The strongest thing to say about permissions is that the best request is the one you never make. The photo picker returns an image with no storage permission at all, <code>ACTION_IMAGE_CAPTURE</code> takes a photo without CAMERA, and the Contacts picker returns one contact without READ_CONTACTS — because in each case the user chose, so nothing needed granting.</p>'
                }
            ],
            docs: [
                { title: 'Request runtime permissions', path: '/training/permissions/requesting', kind: 'guide' },
                { title: 'Request location permissions', path: '/develop/sensors-and-location/location/permissions', kind: 'guide' },
                { title: 'Photo picker', path: '/training/data-storage/shared/photo-picker', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-permission-levels' }
            ]
        },

        {
            id: 'privacy-and-storage',
            title: 'Storage, secrets and the data you hold',
            importance: 'should-know',
            summary: 'Scoped storage replaced a permission with a boundary, and no secret in an APK is secret.',
            interviewAngle: '"How do you store an API key securely?" is a trap — the correct answer is that you do not ship one.',
            buildsOn: ['permission-model'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Scoped storage',
                    important: true,
                    html: '<p>Since Android 10, an app has unrestricted access only to its own directory, plus the media it created. Everything else goes through the media store or a user-chosen document — so the broad storage permission is not merely discouraged, it no longer grants what it used to.</p>'
                },
                {
                    type: 'table',
                    title: 'Where a file should go',
                    headers: ['Kind of data', 'Location', 'Permission', 'Removed on uninstall'],
                    rows: [
                        ['App-private files', 'filesDir / cacheDir', 'None', 'Yes'],
                        ['Media the app created', 'MediaStore', 'None', 'Configurable'],
                        ['Other apps’ media', 'MediaStore query', 'READ_MEDIA_* (Android 13+)', 'n/a'],
                        ['A file the user picks', 'Storage Access Framework', 'None — the pick is the grant', 'No'],
                        ['Key–value settings', 'DataStore', 'None', 'Yes']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The pattern across that table is the same one from the previous chapter: an explicit user choice replaces a permission. Opening a document through the Storage Access Framework grants access to exactly that document, which is both safer for the user and less work for you.</p>'
                },
                {
                    type: 'types',
                    title: 'Protecting what you do keep',
                    items: [
                        { name: 'Android Keystore', html: '<p>Generates and holds keys in hardware — often a secure element — so the key material never enters your process. You ask it to encrypt; you never see the key. This is the only genuinely strong option on the device.</p>' },
                        { name: 'Encrypted storage', html: '<p>Keystore-backed encryption over a file or a preferences store, for tokens and other data that must survive a restart. Note that <code>EncryptedSharedPreferences</code> from Jetpack Security is deprecated, so new code should encrypt around DataStore with a Keystore key.</p>' },
                        { name: 'Network security config', html: '<p>An XML policy for TLS: certificate pinning, which CAs to trust, and per-domain rules — declarative, so it cannot be bypassed by a stray HTTP call somewhere in a library.</p>' },
                        { name: 'Cleartext traffic', html: '<p>Unencrypted HTTP. Blocked by default since Android 9 and the right default: re-enabling it globally to fix one legacy endpoint exposes every request in the app to anyone on the network.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>There is no way to hide a secret inside an APK. <code>BuildConfig</code> fields, string resources, obfuscated names, even bytes in native code — all of it ships to the device and all of it can be read. R8 renames symbols; it does not encrypt data, and a string constant survives it intact.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>So the API-key question has two honest halves. <strong>Out of version control:</strong> keep it in <code>local.properties</code> or the CI secret store and inject it at build time, so it is not in the repository history. <strong>Out of the client entirely:</strong> if the key authorises anything that costs money or touches user data, it belongs on a backend that the app calls — the client gets a short-lived, user-scoped token instead. Saying only the first half answers the wrong question.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Worth naming to close the topic: Play’s <strong>Data safety</strong> declaration is a public statement of what you collect, why, whether it is shared, and whether it can be deleted — and it has to match what the app actually does. It is the reason "we might want this data later" is no longer a free decision, and a good place to end an answer about privacy.</p>'
                }
            ],
            docs: [
                { title: 'Storage and files overview', path: '/training/data-storage', kind: 'guide' },
                { title: 'Android keystore system', path: '/privacy-and-security/keystore', kind: 'guide' },
                { title: 'Network security configuration', path: '/privacy-and-security/security-config', kind: 'guide' },
                { title: 'App security best practices', path: '/privacy-and-security/security-best-practices', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-scoped-storage' },
                { topicId: 'android', questionId: 'android-encrypt-data' },
                { topicId: 'other-topics', questionId: 'secure-api-keys-android' },
                { topicId: 'other-topics', questionId: 'avoid-api-keys-in-vcs' },
                { topicId: 'other-topics', questionId: 'cleartext-traffic' }
            ]
        }
    ]
};
