/* ==========================================================================
   M49 — Mobile system design.

   Leans on M28–M29 and M42 rather than restating them: by this point the
   reader has the networking, sync and performance material, and what is
   missing is how to run the room. So this module is mostly method.

   docHub note: as with M44, there is no first-party page for design rounds,
   so it takes the architecture hub — the nearest one, per §9.
   ========================================================================== */

const systemDesignModule = {
    id: 'system-design',
    trackId: 'synthesis',
    order: 49,
    title: 'Mobile System Design',
    tagline: 'The client is not a small server, and the round is scored differently.',
    estimatedMinutes: 35,
    prerequisites: ['offline-first'],
    docHub: {
        title: 'Guide to app architecture',
        path: '/topic/architecture'
    },

    chapters: [
        {
            id: 'what-is-scored',
            title: 'What the round is actually testing',
            importance: 'must-know',
            summary: 'Not throughput and sharding — the client’s constraints, and whether you can make a trade-off out loud.',
            interviewAngle: 'Answering a mobile design question with a backend design is the commonest way to fail it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The reflex from backend interview prep is to start with load balancers and database sharding. In a mobile design round that is the wrong half of the system: the interviewer will nod, then ask what happens when the phone loses signal in a lift — and that is the question they were always going to ask.</p>'
                },
                {
                    type: 'comparison',
                    title: 'What differs from a backend round',
                    left: 'Mobile',
                    right: 'Backend',
                    rows: [
                        { aspect: 'Scarce resource', left: 'Battery, memory, data, screen', right: 'CPU, throughput, storage cost' },
                        { aspect: 'The network is', left: 'Unreliable and metered', right: 'Assumed present' },
                        { aspect: 'The client is', left: 'Untrusted, unpatched, offline', right: 'Controlled and uniform' },
                        { aspect: 'Deployment', left: 'Users upgrade when they feel like it', right: 'You deploy on Tuesday' },
                        { aspect: 'Scale means', left: 'Devices and versions in the wild', right: 'Requests per second' },
                        { aspect: 'Scored on', left: 'Client architecture and trade-offs', right: 'Distributed-systems reasoning' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The deployment row is the one candidates underweight and interviewers care about most. A shipped version cannot be recalled, so every client decision has to survive old versions running against a moving backend. That is why API versioning, feature flags (M43) and graceful degradation belong in a mobile design answer and rarely appear in one.</p>'
                },
                {
                    type: 'types',
                    title: 'What is being assessed',
                    items: [
                        { name: 'Do you scope before you build?', html: '<p>An open prompt is deliberately under-specified. Narrowing it is the first thing being scored, not a delay before the real answer.</p>' },
                        { name: 'Can you name a trade-off and pick?', html: '<p>"Both have merits" is a non-answer. "WebSocket for sub-second delivery, but it holds the radio awake, so push-to-wake unless the screen is open" is an answer.</p>' },
                        { name: 'Do you think about failure?', html: '<p>Offline, slow, partial, conflicting. A design that only describes the happy path is the most common miss.</p>' },
                        { name: 'Do you know what is expensive?', html: '<p>Radio wake-ups, decoded bitmaps, main-thread work, redundant syncs. Concrete costs beat generic "optimise later".</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' },
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'android-system-design', questionId: 'design-offline-first-app' }
            ]
        },

        {
            id: 'the-framework',
            title: 'A framework for running the room',
            importance: 'must-know',
            summary: 'Requirements, API, data model, architecture, offline, scale, trade-offs — in that order, out loud.',
            interviewAngle: 'Having a sequence is most of the value: it stops the round wandering and shows you have done this before.',
            buildsOn: ['what-is-scored'],
            blocks: [
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'Seven steps, roughly 45 minutes',
                    code: `1. Requirements        5 min   Ask, do not assume. Functional, then
                               non-functional: offline? real-time? scale?
                               Write the scope down and confirm it.

2. API surface         5 min   What does the client call, and what comes
                               back? REST or streaming, and why (M28).
                               Pagination shape. Auth and refresh.

3. Data model          5 min   Local entities and their relations (M27).
                               What is the source of truth (M26)?

4. Architecture       10 min   Layers and modules (M32, M38). Draw it.
                               Where each responsibility lives.

5. Offline & sync     10 min   Read path, write path, conflicts, the
                               outbox (M29). This is the mobile half.

6. Scale & perf        5 min   Large lists, big media, memory, battery,
                               startup (M42). Where it breaks first.

7. Trade-offs          5 min   What you chose against, and what you would
                               revisit with more time.

Steps 1 and 5 are what make it a MOBILE design. Skip them and you have
given a backend answer to a client question.`,
                    notes: 'The timings are a shape, not a script. The point is to move deliberately and to say which step you are on, so the interviewer can steer without interrupting.'
                },
                {
                    type: 'types',
                    title: 'Questions worth asking in step 1',
                    items: [
                        { name: 'Who is the user, and where?', html: '<p>A commuter on patchy 4G is a different product from an office user on wifi, and it changes the sync design.</p>' },
                        { name: 'Does it work offline?', html: '<p>Almost always yes, and the answer determines the entire data layer (M29).</p>' },
                        { name: 'How fresh must data be?', html: '<p>Minutes means a scheduled sync; seconds means push-to-wake; sub-second means a socket (M28). One question, three architectures.</p>' },
                        { name: 'What is out of scope?', html: '<p>Say it explicitly — "I will not design the backend’s storage layer unless you want that" — so the time goes where the round is scored.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Draw the diagram once, early, and keep returning to it. A stable picture — UI, ViewModel, repository, local store, remote source, sync worker — gives every later answer somewhere to point, and it stops the discussion becoming a list of disconnected assertions.</p>'
                }
            ],
            docs: [
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' },
                { title: 'Build an offline-first app', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-whatsapp' },
                { topicId: 'android-system-design', questionId: 'design-uber-app' },
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' }
            ]
        },

        {
            id: 'worked-designs',
            title: 'Four designs, in outline',
            importance: 'should-know',
            summary: 'Chat, feed, upload and notes — the four shapes most prompts are a variation of.',
            interviewAngle: 'Recognising which shape a prompt is lets you reuse a structure instead of improvising.',
            buildsOn: ['the-framework'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Prompts vary; shapes do not. Almost every mobile design question is a real-time feed, a paginated feed, a large transfer, or a locally-edited document — and knowing which one you are in tells you what the hard part will be.</p>'
                },
                {
                    type: 'types',
                    title: 'Chat — the real-time shape',
                    items: [
                        { name: 'Transport', html: '<p>WebSocket while the chat is open, FCM push-to-wake when it is not (M28). Say why: a held socket keeps the radio awake and dies when the process is cached (M12).</p>' },
                        { name: 'Local first', html: '<p>Messages go into Room immediately with a <code>pending</code> status, so the UI is instant and the network is a detail (M29).</p>' },
                        { name: 'Ordering and dedupe', html: '<p>Client-generated ids double as idempotency keys, so a retry does not double-send. Server timestamps decide order, because device clocks are wrong.</p>' },
                        { name: 'The hard part', html: '<p>Delivery state — sent, delivered, read — and reconciling it after an offline gap.</p>' }
                    ]
                },
                {
                    type: 'types',
                    title: 'Feed — the pagination shape',
                    items: [
                        { name: 'Paging with a RemoteMediator', html: '<p>Network fills Room, UI observes Room, so scrolling offline works to the end of the cache with no branch (M29).</p>' },
                        { name: 'Cursor, not offset', html: '<p>Offset pagination duplicates and skips items when the feed changes under you. A cursor is stable.</p>' },
                        { name: 'Media', html: '<p>Server-side resized variants, an image library with memory and disk caches, and prefetch one screen ahead — not ten (M42).</p>' },
                        { name: 'The hard part', html: '<p>Freshness against stability: inserting new items without moving what the user is reading.</p>' }
                    ]
                },
                {
                    type: 'types',
                    title: 'Upload or download — the large-transfer shape',
                    items: [
                        { name: 'WorkManager, not a coroutine', html: '<p>It must survive the app closing and a reboot (M30), with an unmetered-network constraint if it is large.</p>' },
                        { name: 'Chunked and resumable', html: '<p>Fixed-size chunks with a server-side session id, so a dropped connection resumes rather than restarts. This is the answer they are listening for.</p>' },
                        { name: 'Progress', html: '<p>Reported through <code>WorkInfo</code> so the UI observes rather than owns it, and a foreground service only if the user must watch it happen (M31).</p>' },
                        { name: 'The hard part', html: '<p>Backpressure and cancellation — and cleaning up server-side state for transfers that never finish.</p>' }
                    ]
                },
                {
                    type: 'types',
                    title: 'Offline notes — the local-editing shape',
                    items: [
                        { name: 'Local is the source of truth', html: '<p>Edits apply to Room immediately; the outbox carries them to the server when there is a network (M29).</p>' },
                        { name: 'Conflict policy, stated', html: '<p>Last-write-wins on server timestamps is the honest default; field-level merge if the product justifies it. Name the cost either way.</p>' },
                        { name: 'Soft deletes', html: '<p>A deleted flag rather than a row removal, or a delete made offline is lost when the server sends the note back.</p>' },
                        { name: 'The hard part', html: '<p>Making sync state visible without making it the user’s problem.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>A design round often ends with "what would you do differently?" — and it is not a trap. Naming a real limit of what you just described (<em>"last-write-wins loses an edit silently; with more time I would surface a conflict on the note"</em>) reads as engineering judgement. Claiming the design has no weaknesses reads as inexperience.</p>'
                }
            ],
            docs: [
                { title: 'Build an offline-first app', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' },
                { title: 'Persistent work', path: '/develop/background-work/background-tasks/persistent', kind: 'guide' },
                { title: 'Paging 3 overview', path: '/topic/libraries/architecture/paging/v3-overview', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-whatsapp' },
                { topicId: 'android-system-design', questionId: 'design-instagram-stories' },
                { topicId: 'android-system-design', questionId: 'design-file-downloader-library' },
                { topicId: 'android-system-design', questionId: 'design-networking-library' },
                { topicId: 'android-system-design', questionId: 'design-image-loading-library' },
                { topicId: 'android-system-design', questionId: 'design-analytics-library' },
                { topicId: 'android-system-design', questionId: 'design-logging-library' },
                { topicId: 'android-system-design', questionId: 'design-facebook-nearby-friends' },
                { topicId: 'android-system-design', questionId: 'design-location-based-app' },
                { topicId: 'android-system-design', questionId: 'voice-video-calls-architecture' },
                { topicId: 'android-system-design', questionId: 'data-syncing-unstable-networks' }
            ]
        }
    ]
};
