/* ==========================================================================
   M55 — Predict the output: Java semantics.

   The cheapest module in the track and the most certain to be correct. Java's
   tricky-output canon is old, small and completely settled — integer caching
   at 127 against 128, string interning, finally overriding a return, static
   initialisation order, char arithmetic, ternary autoboxing — and every source
   surveyed for the plan named the same set.

   tools/run-snippets.js was built partly for these. Its own header names four
   of them as the questions people get wrong until they watch them run, which
   is the whole argument for asking them here rather than explaining them.

   All twelve printed exactly what was predicted, which is what "settled" looks
   like from the authoring side.
   ========================================================================== */

const predictJavaModule = {
    id: 'predict-java',
    trackId: 'output',
    order: 55,
    title: 'Java Semantics',
    tagline: 'Twenty-five years of the same six questions.',
    estimatedMinutes: 28,
    prerequisites: ['jvm-foundations', 'predict-kotlin'],
    docHub: {
        title: 'Kotlin for Java developers',
        path: '/kotlin/add-kotlin'
    },

    chapters: [
        {
            id: 'identity-and-equality',
            title: 'Two objects that hold the same thing',
            importance: 'must-know',
            summary: 'Reference equality has caches underneath it — an integer cache and a string pool — which is why == sometimes agrees with equals and sometimes does not.',
            interviewAngle: 'The == against equals question is asked everywhere and answered correctly by almost everyone. The version that separates people gives the boundary: 127 against 128, and why.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Both puzzles here have the same shape: <code>==</code> asks whether two references point at one object, and the JVM quietly arranges for some values to share an object. Knowing <em>which</em> is the whole question.</p>'
                },
                {
                    type: 'predict',
                    id: 'integer-cache-127-against-128',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>Two pairs of boxed integers, one either side of a boundary. Which comparisons are true?</p>',
                    code: `public class Caching {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;

        System.out.println("127 ==     127 : " + (a == b));
        System.out.println("127 equals 127 : " + a.equals(b));
        System.out.println("128 ==     128 : " + (c == d));
        System.out.println("128 equals 128 : " + c.equals(d));

        int primitive = 128;
        System.out.println("128 == int 128 : " + (c == primitive));
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            '127 ==     127 : true',
                            '127 equals 127 : true',
                            '128 ==     128 : false',
                            '128 equals 128 : true',
                            '128 == int 128 : true'
                        ],
                        explain: '<p>The JVM caches boxed <code>Integer</code> objects from &minus;128 to 127, so autoboxing 127 twice yields the <strong>same object</strong> and <code>==</code> is true by accident. 128 is outside the cache, two objects are allocated, and the identical comparison is false.</p><p>The last line is the one people miss: comparing an <code>Integer</code> with an <code>int</code> is not a reference comparison at all. The boxed value is unboxed first and two primitives are compared numerically, so it is true regardless of caching.</p><p><code>equals</code> is right in every case, which is the actual lesson.</p>'
                    },
                    distractor: '<p>Answering true for both <code>==</code> lines because the values are equal, or false for both because they are separate variables. The boundary is what the question is for.</p>'
                },
                {
                    type: 'predict',
                    id: 'string-literal-against-new-string',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>Six comparisons across literals, <code>new String</code>, and two kinds of concatenation.</p>',
                    code: `public class Pool {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";
        String c = new String("hello");

        System.out.println("a == b            : " + (a == b));
        System.out.println("a == c            : " + (a == c));
        System.out.println("a.equals(c)       : " + a.equals(c));
        System.out.println("a == c.intern()   : " + (a == c.intern()));

        String compileTime = "hel" + "lo";
        String prefix = "hel";
        String runTime = prefix + "lo";

        System.out.println("a == compile-time : " + (a == compileTime));
        System.out.println("a == run-time     : " + (a == runTime));
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'a == b            : true',
                            'a == c            : false',
                            'a.equals(c)       : true',
                            'a == c.intern()   : true',
                            'a == compile-time : true',
                            'a == run-time     : false'
                        ],
                        explain: '<p>Identical string literals share one pooled object, so <code>a == b</code>. <code>new String</code> forces a fresh allocation, so <code>a == c</code> is false while <code>equals</code> is true. <code>intern()</code> asks for the pooled instance and gets the same one back.</p><p>The last pair is the interesting half. <code>"hel" + "lo"</code> is folded by the compiler into the literal <code>"hello"</code> and pooled with the rest; <code>prefix + "lo"</code> cannot be folded because <code>prefix</code> is a variable, so it builds a new object at runtime.</p><p>Two expressions that look identical in source differ because one was resolved before the program started.</p>'
                    },
                    distractor: '<p>Expecting the two concatenations to behave the same. Whether the operands are compile-time constants decides it, and nothing in the syntax says so.</p>'
                }
            ],
            docs: [
                { title: 'String (API reference)', url: 'https://docs.oracle.com/javase/8/docs/api/java/lang/String.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'integer-caching-wrapper-classes' },
                { topicId: 'java', questionId: 'string-pool-in-java' },
                { topicId: 'java', questionId: 'equals-vs-double-equals' }
            ]
        },

        {
            id: 'try-catch-finally',
            title: 'What finally can and cannot change',
            importance: 'must-know',
            summary: 'finally always runs, and a return inside it replaces the one already in flight — but assigning to a variable in finally does not.',
            interviewAngle: 'Everyone knows finally always runs. The follow-up worth being ready for is what happens when both try and finally return, and why mutating the returned variable behaves differently.',
            buildsOn: ['identity-and-equality'],
            blocks: [
                {
                    type: 'predict',
                    id: 'finally-overrides-a-return',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>One method returns from both <code>try</code> and <code>finally</code>. The other mutates the returned variable in <code>finally</code>. What comes back from each?</p>',
                    code: `public class Finally {
    static int returnInFinally() {
        try {
            return 1;
        } finally {
            return 2;
        }
    }

    static int mutateInFinally() {
        int value = 1;
        try {
            return value;
        } finally {
            value = 99;
        }
    }

    public static void main(String[] args) {
        System.out.println("return in finally : " + returnInFinally());
        System.out.println("mutate in finally : " + mutateInFinally());
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['return in finally : 2', 'mutate in finally : 1'],
                        explain: '<p>The pair is the point. A <code>return</code> in <code>finally</code> <strong>discards</strong> the one already in flight, so 1 is thrown away and 2 comes back. But assigning to the variable in <code>finally</code> changes nothing, because <code>return value</code> had already copied the value onto the stack before <code>finally</code> ran.</p><p>Returning what was returned, not the variable it came from. That distinction is also why returning a mutable object <em>and</em> mutating it in <code>finally</code> <em>would</em> be visible — the reference was copied, the object was not.</p><p>A <code>return</code> inside <code>finally</code> also swallows any exception in flight, which is why every linter warns about it.</p>'
                    },
                    distractor: '<p>Expecting both to behave the same way, in either direction. One overrides the return and the other cannot reach it.</p>'
                },
                {
                    type: 'predict',
                    id: 'finally-runs-after-a-caught-throw',
                    importance: 'should-know',
                    language: 'java',
                    prompt: '<p>The <code>catch</code> returns and the <code>finally</code> appends. What does the caller see, and in what order do the two lines print?</p>',
                    code: `public class Order {
    static String run() {
        StringBuilder log = new StringBuilder();
        try {
            log.append("try ");
            throw new RuntimeException("x");
        } catch (RuntimeException e) {
            log.append("catch ");
            return log.toString().trim();
        } finally {
            log.append("finally");
            System.out.println("inside finally, the log reads: " + log);
        }
    }

    public static void main(String[] args) {
        System.out.println("run() returned: " + run());
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'inside finally, the log reads: try catch finally',
                            'run() returned: try catch'
                        ],
                        explain: '<p><code>finally</code> runs <strong>after</strong> the <code>catch</code> block has computed its return value but <strong>before</strong> the method actually returns — which is why its line prints first, and why the caller never sees the word it appended.</p><p><code>toString()</code> had already produced an independent <code>String</code>. The <code>StringBuilder</code> kept changing; the snapshot taken from it did not.</p>'
                    }
                }
            ],
            docs: [
                { title: 'The finally block', url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/finally.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'try-catch-finally' },
                { topicId: 'java', questionId: 'final-finally-finalize' }
            ]
        },

        {
            id: 'initialisation-and-arguments',
            title: 'Construction order, and what a method can change',
            importance: 'must-know',
            summary: 'Static initialisers run once before anything else; instance initialisers run before every constructor. And Java passes references by value, which is not the same as passing by reference.',
            interviewAngle: 'Pass-by-value is the one people answer confidently and wrongly. The convincing version distinguishes mutating the object from reassigning the parameter.',
            buildsOn: ['try-catch-finally'],
            blocks: [
                {
                    type: 'predict',
                    id: 'static-then-instance-then-constructor',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>A static block, an instance block, a constructor, and two instances. What order, and how many of each?</p>',
                    code: `public class Init {
    static { System.out.println("static block"); }
    { System.out.println("instance block"); }
    Init() { System.out.println("constructor"); }

    public static void main(String[] args) {
        System.out.println("-- first instance --");
        new Init();
        System.out.println("-- second instance --");
        new Init();
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'static block',
                            '-- first instance --',
                            'instance block',
                            'constructor',
                            '-- second instance --',
                            'instance block',
                            'constructor'
                        ],
                        explain: '<p>The static block runs <strong>before <code>main</code></strong>, once, when the class is initialised — and <code>main</code> cannot start until its own class is initialised. It never runs again.</p><p>The instance block runs before the constructor body, once per instance, so it appears twice. That is the mechanism behind the double-brace initialisation trick, and behind the fact that a field initialiser cannot see a value the constructor has not assigned yet.</p>'
                    },
                    distractor: '<p>Expecting <code>-- first instance --</code> to print first because <code>main</code> is the entry point. Class initialisation precedes it.</p>'
                },
                {
                    type: 'predict',
                    id: 'pass-by-value-of-a-reference',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>One method mutates the list, one reassigns the parameter, one increments an int. Which changes are visible to the caller?</p>',
                    code: `import java.util.ArrayList;
import java.util.List;

public class PassByValue {
    static void mutate(List<String> list) {
        list.add("added");
    }

    static void reassign(List<String> list) {
        list = new ArrayList<>();
        list.add("ignored");
    }

    static void bump(int n) {
        n = n + 1;
    }

    public static void main(String[] args) {
        List<String> items = new ArrayList<>();

        mutate(items);
        System.out.println("after mutate   : " + items);

        reassign(items);
        System.out.println("after reassign : " + items);

        int count = 1;
        bump(count);
        System.out.println("after bump     : " + count);
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'after mutate   : [added]',
                            'after reassign : [added]',
                            'after bump     : 1'
                        ],
                        explain: '<p>Only the mutation. Java is <strong>pass by value</strong> without exception — what is copied for an object parameter is the <em>reference</em>, so the method can follow it to the same object and change it, but assigning a new reference to the parameter only rebinds the local copy.</p><p>If Java were pass by reference, <code>reassign</code> would have replaced the caller’s list. It cannot, and neither can <code>bump</code>.</p><p>The phrase that settles it: Java passes references by value; it does not pass by reference.</p>'
                    },
                    distractor: '<p>Concluding from <code>mutate</code> that objects are passed by reference. <code>reassign</code> is in the snippet specifically to rule that out.</p>'
                }
            ],
            docs: [
                { title: 'Initialization blocks', url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/initial.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'pass-by-reference-or-value' },
                { topicId: 'java', questionId: 'static-keyword' }
            ]
        },

        {
            id: 'conversions-and-arithmetic',
            title: 'Silent conversions',
            importance: 'must-know',
            summary: 'The ternary unifies its branches into one type before it picks one, + means two different things depending on its operands, and integer division discards rather than rounds.',
            interviewAngle: 'The ternary NullPointerException is the sharpest of these because the null is never dereferenced in the source — the unboxing the compiler inserted does it.',
            buildsOn: ['initialisation-and-arguments'],
            blocks: [
                {
                    type: 'predict',
                    id: 'ternary-unboxes-and-npes',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>The second ternary never selects the null branch. Does it still throw?</p>',
                    code: `public class Ternary {
    public static void main(String[] args) {
        Integer present = 42;
        Integer absent = null;

        Object bothBoxed = true ? present : absent;
        System.out.println("both Integer : " + bothBoxed);

        try {
            Object mixed = false ? 0 : absent;
            System.out.println("never reached: " + mixed);
        } catch (NullPointerException e) {
            System.out.println("int and Integer threw NullPointerException");
        }
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'both Integer : 42',
                            'int and Integer threw NullPointerException'
                        ],
                        explain: '<p>It throws, and the null is never written in the source. When one branch is <code>int</code> and the other <code>Integer</code>, the conditional operator’s type is the <strong>primitive</strong>, so the compiler inserts an unboxing of whichever branch is chosen — and unboxing a null reference throws.</p><p>The first ternary is safe purely because both branches are already <code>Integer</code>, so no conversion is needed. Change <code>0</code> to <code>Integer.valueOf(0)</code> and the second becomes safe too.</p><p>Which means adding a literal to one branch of a working ternary can introduce a NullPointerException in the other.</p>'
                    },
                    distractor: '<p>Reasoning that <code>false</code> selects <code>absent</code>, assigns null, and prints "null" — the conversion happens on the selected branch regardless.</p>'
                },
                {
                    type: 'predict',
                    id: 'char-plus-int-is-arithmetic',
                    importance: 'should-know',
                    language: 'java',
                    prompt: '<p>Six expressions using <code>+</code>. Which are arithmetic and which are concatenation?</p>',
                    code: `public class Chars {
    public static void main(String[] args) {
        char a = 'a';

        System.out.println("a + 1           : " + (a + 1));
        System.out.println("(char)(a + 1)   : " + (char) (a + 1));
        System.out.println("'a' + 'b'       : " + ('a' + 'b'));
        System.out.println("\\"\\" + 'a' + 'b'  : " + ("" + 'a' + 'b'));
        System.out.println("1 + 2 + \\"x\\"     : " + (1 + 2 + "x"));
        System.out.println("\\"x\\" + 1 + 2     : " + ("x" + 1 + 2));
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'a + 1           : 98',
                            '(char)(a + 1)   : b',
                            "'a' + 'b'       : 195",
                            '"" + \'a\' + \'b\'  : ab',
                            '1 + 2 + "x"     : 3x',
                            '"x" + 1 + 2     : x12'
                        ],
                        explain: '<p><code>+</code> concatenates only when one operand is already a <code>String</code>; otherwise it is arithmetic, and <code>char</code> promotes to <code>int</code>. So <code>\'a\' + \'b\'</code> is 195, not <code>"ab"</code> — prefixing an empty string is what forces the other reading.</p><p>The last two are the same operands in a different order producing different answers, because <code>+</code> is left-associative: <code>1 + 2</code> is arithmetic and gives 3 before meeting the string, while <code>"x" + 1</code> is already a string and 2 joins it.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'integer-division-truncates',
                    importance: 'should-know',
                    language: 'java',
                    prompt: '<p>Where does the cast have to go, and which way does negative division round?</p>',
                    code: `public class Division {
    public static void main(String[] args) {
        System.out.println("7 / 2           : " + (7 / 2));
        System.out.println("7 / 2.0         : " + (7 / 2.0));
        System.out.println("(double)(7 / 2) : " + (double) (7 / 2));
        System.out.println("-7 / 2          : " + (-7 / 2));
        System.out.println("-7 % 2          : " + (-7 % 2));
        System.out.println("0.1 + 0.2       : " + (0.1 + 0.2));
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            '7 / 2           : 3',
                            '7 / 2.0         : 3.5',
                            '(double)(7 / 2) : 3.0',
                            '-7 / 2          : -3',
                            '-7 % 2          : -1',
                            '0.1 + 0.2       : 0.30000000000000004'
                        ],
                        explain: '<p>Two <code>int</code> operands give an <code>int</code> result, and the fraction is discarded before any cast can rescue it — line three casts a 3 that has already lost its remainder. Making <em>an operand</em> a double is the fix; casting the result is not.</p><p>Division truncates <strong>toward zero</strong> rather than flooring, so <code>-7 / 2</code> is &minus;3 and not &minus;4, and <code>%</code> takes the sign of the left operand. That is why <code>index % size</code> can be negative and why a hash bucket computed that way can crash.</p><p>The last line is IEEE 754 doing what it always does. Money belongs in <code>BigDecimal</code> or in integer minor units.</p>'
                    }
                }
            ],
            docs: [
                { title: 'Autoboxing and unboxing', url: 'https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'autoboxing-and-unboxing' },
                { topicId: 'java', questionId: 'eight-primitive-types' }
            ]
        },

        {
            id: 'types-at-runtime',
            title: 'What the compiler knew, and what the JVM finds out',
            importance: 'must-know',
            summary: 'Arrays carry their element type into the runtime and check it; overload resolution happens at compile time; and a hash-based collection trusts a key that stops being trustworthy.',
            interviewAngle: 'Overloading against overriding is asked as a definition and best answered as a snippet — the same call site, two different resolution rules.',
            buildsOn: ['conversions-and-arithmetic'],
            blocks: [
                {
                    type: 'predict',
                    id: 'overload-binds-statically-override-dynamically',
                    importance: 'must-know',
                    language: 'java',
                    prompt: '<p>A <code>Dog</code> in an <code>Animal</code> variable. Which method runs in each of the three calls?</p>',
                    code: `public class Dispatch {
    static class Animal {
        String name() { return "Animal"; }
    }

    static class Dog extends Animal {
        @Override String name() { return "Dog"; }
    }

    static String describe(Animal a) { return "describe(Animal)"; }
    static String describe(Dog d)    { return "describe(Dog)"; }

    public static void main(String[] args) {
        Animal asAnimal = new Dog();

        System.out.println("override, declared Animal : " + asAnimal.name());
        System.out.println("overload, declared Animal : " + describe(asAnimal));
        System.out.println("overload, declared Dog    : " + describe(new Dog()));
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'override, declared Animal : Dog',
                            'overload, declared Animal : describe(Animal)',
                            'overload, declared Dog    : describe(Dog)'
                        ],
                        explain: '<p>The same object gives two different answers. <strong>Overriding is resolved at runtime</strong> from the object’s actual class, so <code>name()</code> finds <code>Dog</code>. <strong>Overloading is resolved at compile time</strong> from the declared type of the argument, so <code>describe</code> picks the <code>Animal</code> version for a variable declared <code>Animal</code>.</p><p>This is the same rule that makes Kotlin extension functions dispatch statically — they compile to exactly this kind of static method.</p>'
                    },
                    distractor: '<p>Expecting <code>describe(Dog)</code> for the second call because the object is a <code>Dog</code>. The compiler chose the method before the object existed.</p>'
                },
                {
                    type: 'predict',
                    id: 'array-covariance-throws-at-runtime',
                    importance: 'should-know',
                    language: 'java',
                    prompt: '<p>A <code>String[]</code> held as an <code>Object[]</code>. Does storing an <code>Integer</code> compile, and does it run?</p>',
                    code: `public class Covariance {
    public static void main(String[] args) {
        Object[] objects = new String[2];

        objects[0] = "this is fine";
        System.out.println("stored a String : " + objects[0]);

        try {
            objects[1] = 42;
            System.out.println("never reached");
        } catch (ArrayStoreException e) {
            System.out.println("storing an Integer threw ArrayStoreException: " + e.getMessage());
        }
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'stored a String : this is fine',
                            'storing an Integer threw ArrayStoreException: java.lang.Integer'
                        ],
                        explain: '<p>It compiles and it fails at runtime. Java arrays are <strong>covariant</strong> — a <code>String[]</code> is assignable to an <code>Object[]</code> — which the type system cannot make safe, so the JVM checks every store and throws <code>ArrayStoreException</code> when the type is wrong.</p><p>Generics are deliberately <em>not</em> covariant for exactly this reason: <code>List&lt;String&gt;</code> is not a <code>List&lt;Object&gt;</code>, so the equivalent mistake is a compile error instead of a runtime one. Arrays predate generics and kept the older, weaker guarantee.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'mutating-a-hashmap-key',
                    importance: 'good-to-know',
                    language: 'java',
                    prompt: '<p>The key object is mutated after being put in the map. Can the entry still be found — by the same key, or by an equal one?</p>',
                    code: `import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class MutableKey {
    static class Key {
        String value;

        Key(String value) { this.value = value; }

        @Override public boolean equals(Object o) {
            return o instanceof Key && Objects.equals(value, ((Key) o).value);
        }

        @Override public int hashCode() { return Objects.hash(value); }

        @Override public String toString() { return "Key(" + value + ")"; }
    }

    public static void main(String[] args) {
        Map<Key, String> map = new HashMap<>();
        Key key = new Key("a");
        map.put(key, "stored");

        System.out.println("get(key) before   : " + map.get(key));

        key.value = "b";

        System.out.println("get(key) after    : " + map.get(key));
        System.out.println("get(new Key(\\"a\\")) : " + map.get(new Key("a")));
        System.out.println("the entry is still there: " + map);
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'get(key) before   : stored',
                            'get(key) after    : null',
                            'get(new Key("a")) : null',
                            'the entry is still there: {Key(b)=stored}'
                        ],
                        explain: '<p>Neither. The entry is visibly still in the map and is unreachable by any key at all.</p><p><code>HashMap</code> stored it in the bucket for the <em>old</em> hash. Searching with the mutated object computes the <em>new</em> hash and looks in the wrong bucket. Searching with a fresh <code>Key("a")</code> computes the old hash and looks in the right bucket, finds the entry, and then rejects it on <code>equals</code> — because the stored key now says <code>"b"</code>.</p><p>Which is why a key’s <code>hashCode</code> must be built only from fields that never change. In Kotlin, a data class with <code>val</code> properties gives you that for free; with <code>var</code> it gives you exactly this bug.</p>'
                    },
                    distractor: '<p>Expecting the fresh <code>Key("a")</code> to find it, since that is what was originally inserted. It reaches the right bucket and is turned away by the stored key, which has moved on.</p>'
                }
            ],
            docs: [
                { title: 'HashMap (API reference)', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'method-overloading-vs-overriding' },
                { topicId: 'java', questionId: 'hashcode-and-equals' },
                { topicId: 'java', questionId: 'arrays-vs-arraylists' }
            ]
        }
    ]
};
