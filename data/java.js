const javaData = {
    id: "java",
    title: "Java",
    subsections: [
        { id: "solid-principles", title: "SOLID Principles", keyTopics: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion"] },
        { id: "oop", title: "OOP", keyTopics: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Abstract Classes vs Interfaces"] },
        { id: "collections-generics", title: "Collections and Generics", keyTopics: ["Arrays vs ArrayList", "HashSet vs TreeSet", "HashMap vs Set", "Generics"] },
        { id: "objects-primitives", title: "Objects and Primitives", keyTopics: ["String Immutability", "String Pool", "Primitives", "Wrapper Classes", "Pass by Value"] },
        { id: "java-memory-model", title: "Java Memory Model and Garbage Collector", keyTopics: ["Garbage Collection", "Heap vs Stack", "GC Generations"] },
        { id: "concurrency", title: "Concurrency", keyTopics: ["synchronized", "ThreadPoolExecutor", "volatile", "Object vs Class Lock", "Concurrency vs Parallelism", "Atomic Operations"] },
        { id: "exceptions", title: "Exceptions", keyTopics: ["try-catch-finally", "Checked vs Unchecked Exceptions"] },
        { id: "others-java", title: "Others", keyTopics: ["Shallow vs Deep Copy", "Serialization", "Reflection", "static keyword", "final/finally/finalize", "StringBuffer vs StringBuilder", "Dependency Injection"] }
    ],
    keyTopics: [
        "SOLID Principles", "OOP (Encapsulation, Inheritance, Polymorphism, Abstraction)", "Collections Framework",
        "Generics", "String Immutability and Pool", "Garbage Collection", "Concurrency (synchronized, volatile, ThreadPool)",
        "Exception Handling", "Serialization/Deserialization", "Reflection", "static and final keywords",
        "Pass by Value vs Reference", "Shallow vs Deep Copy", "fail-fast vs fail-safe iterators"
    ],
    questions: [
        {
            id: "single-responsibility-principle",
            question: "S in SOLID: Single Responsibility Principle",
            answer: "<p><strong>🔑 One class, one reason to change</strong></p><ul><li>The <strong>Single Responsibility Principle</strong> states a class should have <strong>only one job or actor it answers to</strong> — if two different stakeholders can force the same class to change for unrelated reasons, it has too many responsibilities.</li><li><strong>Symptom of violation</strong> — a <code>UserManager</code> class that validates input, persists to a database, sends emails and formats reports is really four responsibilities glued together (a &quot;god class&quot;).</li><li><strong>Fix</strong> — split into <code>UserValidator</code>, <code>UserRepository</code>, <code>EmailService</code>, <code>UserReportFormatter</code>, each with a narrow, cohesive purpose.</li><li><strong>Benefits</strong> — smaller classes are easier to unit test in isolation, changes are localized (lower blast radius), and merge conflicts drop since unrelated features rarely touch the same file.</li><li><strong>Not the same as</strong> &quot;one method per class&quot; — a class can have many methods as long as they all serve the same cohesive responsibility.</li></ul><p><strong>🎯 Interview tip:</strong> a quick smell test is to describe the class in one sentence without using &quot;and&quot; — if you need &quot;and&quot;, it likely has more than one responsibility.</p>",
            referenceLinks: [{ title: "Oracle: Java Design Patterns", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/index.html" }],
            tags: ["solid", "single-responsibility", "srp", "clean-code", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Splitting a god class by responsibility",
                code: "// Before: one class, three unrelated reasons to change\nclass UserManagerBad {\n    void validate(User u) { /* validation rules */ }\n    void save(User u) { /* JDBC persistence */ }\n    void sendWelcomeEmail(User u) { /* SMTP client */ }\n}\n\n// After: each class has exactly one responsibility\nclass UserValidator {\n    boolean isValid(User u) { return u.getEmail() != null && u.getEmail().contains(\"@\"); }\n}\n\nclass UserRepository {\n    void save(User u) { /* JDBC / JPA persistence only */ }\n}\n\nclass WelcomeEmailSender {\n    void send(User u) { /* SMTP client only */ }\n}"
            }],
            subsection: "solid-principles"
        },
        {
            id: "open-closed-principle",
            question: "O in SOLID: Open/Closed Principle",
            answer: "<p><strong>🔑 Open for extension, closed for modification</strong></p><ul><li>A well-designed module should let you <strong>add new behavior without editing existing, tested code</strong> — you extend it, you don't patch it.</li><li><strong>Achieved through abstraction</strong> — depend on an interface or abstract base class, then add new behavior by writing a new implementation, not by inserting new <code>if</code>/<code>switch</code> branches into a shared method.</li><li><strong>Classic example</strong> — an <code>AreaCalculator</code> that takes a <code>Shape</code> interface with <code>area()</code>. Adding a <code>Triangle</code> means writing a new class, not touching <code>AreaCalculator</code> or existing shape classes.</li><li><strong>Why it matters</strong> — untouched code carries no regression risk; every class that already passed QA stays passed.</li><li><strong>Common enabler</strong> — the Strategy or Template Method design pattern, and dependency injection of interfaces rather than concrete types.</li></ul><p><strong>🎯 Interview tip:</strong> if you keep adding <code>else if</code> blocks to handle a new type, that code violates OCP — polymorphism should be doing that dispatch instead.</p>",
            referenceLinks: [{ title: "Oracle: Interfaces and Inheritance", url: "https://docs.oracle.com/javase/tutorial/java/IandI/index.html" }],
            tags: ["solid", "open-closed", "ocp", "polymorphism", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Adding a shape without modifying AreaCalculator",
                code: "interface Shape {\n    double area();\n}\n\nclass Circle implements Shape {\n    private final double radius;\n    Circle(double radius) { this.radius = radius; }\n    public double area() { return Math.PI * radius * radius; }\n}\n\nclass Triangle implements Shape { // new type, zero edits elsewhere\n    private final double base, height;\n    Triangle(double base, double height) { this.base = base; this.height = height; }\n    public double area() { return 0.5 * base * height; }\n}\n\nclass AreaCalculator {\n    double total(List<Shape> shapes) {\n        return shapes.stream().mapToDouble(Shape::area).sum();\n    }\n}"
            }],
            subsection: "solid-principles"
        },
        {
            id: "liskov-substitution-principle",
            question: "L in SOLID: Liskov Substitution Principle",
            answer: "<p><strong>🔑 Subtypes must be substitutable for their base type</strong></p><ul><li><strong>LSP</strong> requires that anywhere a base class <code>Base</code> is expected, a subclass <code>Derived</code> can be used <strong>without breaking correctness</strong> — callers should not need to know or check which concrete type they received.</li><li><strong>Formal rule</strong> — an overriding method may not <strong>strengthen preconditions</strong> (demand more than the base method) or <strong>weaken postconditions</strong> (promise less than the base method).</li><li><strong>Classic violation</strong> — <code>Square extends Rectangle</code> and overrides <code>setWidth()</code>/<code>setHeight()</code> to keep both sides equal. Code that does <code>rect.setWidth(5); rect.setHeight(10); assert rect.area() == 50</code> breaks for a <code>Square</code>, since the invariant the base type promised no longer holds.</li><li><strong>Symptom</strong> — a subclass that throws <code>UnsupportedOperationException</code> from an inherited method, or that requires callers to <code>instanceof</code>-check before using it, is violating LSP.</li><li><strong>Fix</strong> — favor composition, or model the relationship more precisely (e.g. both <code>Square</code> and <code>Rectangle</code> implement a common <code>Shape</code> interface instead of one extending the other).</li></ul><p><strong>🎯 Interview tip:</strong> LSP is really about <strong>behavioral</strong> compatibility, not just matching method signatures — the compiler enforces the signature, LSP is a design discipline on top of that.</p>",
            referenceLinks: [{ title: "Oracle: Overriding Methods", url: "https://docs.oracle.com/javase/tutorial/java/IandI/override.html" }],
            tags: ["solid", "liskov-substitution", "lsp", "inheritance", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "solid-principles"
        },
        {
            id: "interface-segregation-principle",
            question: "I in SOLID: Interface Segregation Principle",
            answer: "<p><strong>🔑 Many small, role-specific interfaces beat one fat interface</strong></p><ul><li><strong>ISP</strong> says <strong>clients should not be forced to depend on methods they never use</strong> — a class implementing an interface shouldn't have to provide dummy or exception-throwing implementations for methods irrelevant to it.</li><li><strong>Classic violation</strong> — a single <code>Worker</code> interface with <code>work()</code> and <code>eat()</code>. A <code>RobotWorker</code> implementing it is forced to write a meaningless <code>eat()</code> method.</li><li><strong>Fix</strong> — split into narrower interfaces, <code>Workable</code> and <code>Eatable</code>; <code>HumanWorker</code> implements both, <code>RobotWorker</code> implements only <code>Workable</code>.</li><li><strong>Java 8+ nuance</strong> — <code>default</code> methods let you add behavior to an interface without breaking existing implementers, but that's an implementation-compatibility tool, not a substitute for good interface design; ISP is still about keeping the <em>contract</em> role-specific.</li><li><strong>Benefit</strong> — smaller interfaces are easier to mock in tests and make dependencies explicit at the type level.</li></ul>",
            referenceLinks: [{ title: "Oracle: Creating Interfaces", url: "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html" }],
            tags: ["solid", "interface-segregation", "isp", "interfaces", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Splitting a fat interface",
                code: "// Before\ninterface Worker {\n    void work();\n    void eat();\n}\n\n// After: role-specific interfaces\ninterface Workable {\n    void work();\n}\n\ninterface Eatable {\n    void eat();\n}\n\nclass HumanWorker implements Workable, Eatable {\n    public void work() { System.out.println(\"working\"); }\n    public void eat() { System.out.println(\"eating lunch\"); }\n}\n\nclass RobotWorker implements Workable { // no forced eat()\n    public void work() { System.out.println(\"welding\"); }\n}"
            }],
            subsection: "solid-principles"
        },
        {
            id: "dependency-inversion-principle",
            question: "D in SOLID: Dependency Inversion Principle",
            answer: "<p><strong>🔑 Depend on abstractions, not concrete implementations</strong></p><ul><li><strong>DIP</strong> has two parts: (1) high-level modules should not depend on low-level modules — <strong>both should depend on abstractions</strong>; (2) abstractions should not depend on details — <strong>details should depend on abstractions</strong>.</li><li><strong>In practice</strong> — a <code>UserService</code> (high-level policy) should depend on a <code>UserRepository</code> interface, not directly on a <code>MySqlUserRepository</code> class (low-level detail). Swapping to <code>PostgresUserRepository</code> then requires zero changes to <code>UserService</code>.</li><li><strong>Enabler</strong> — dependency injection frameworks like <strong>Dagger</strong>, <strong>Hilt</strong>, or plain constructor injection wire concrete implementations in at composition time, keeping business logic decoupled from infrastructure.</li><li><strong>Relation to inversion of control</strong> — DIP is the design principle; DI is the technique/pattern most commonly used to satisfy it; IoC containers are the tooling.</li><li><strong>Payoff</strong> — testability (inject a fake/mock <code>UserRepository</code> in unit tests) and the ability to swap infrastructure without touching business rules.</li></ul><p><strong>🎯 Interview tip:</strong> &quot;inversion&quot; refers to inverting the traditional dependency direction — instead of high-level code reaching down to instantiate low-level classes, both point to a shared abstraction.</p>",
            referenceLinks: [{ title: "Oracle: Dependency Injection Concepts", url: "https://docs.oracle.com/javaee/6/tutorial/doc/giwhb.html" }],
            tags: ["solid", "dependency-inversion", "dip", "dependency-injection", "design-principles"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Dependency Inversion",
                columns: 3,
                nodes: [
                    { label: "UserService", type: "terminal" },
                    { label: "UserRepository (interface)", type: "decision" },
                    { label: "MySqlUserRepository" }
                ],
                connections: [ { from: 0, to: 1, label: "depends on" }, { from: 1, to: 2, label: "implemented by" } ]
            },
            codeSnippets: [{
                language: "java",
                title: "Constructor injection against an abstraction",
                code: "interface UserRepository {\n    User findById(String id);\n}\n\nclass MySqlUserRepository implements UserRepository {\n    public User findById(String id) { /* JDBC lookup */ return new User(id); }\n}\n\nclass UserService { // high-level policy — knows nothing about MySQL\n    private final UserRepository repository;\n\n    UserService(UserRepository repository) { // dependency injected\n        this.repository = repository;\n    }\n\n    User getUser(String id) { return repository.findById(id); }\n}"
            }],
            subsection: "solid-principles"
        },
        {
            id: "explain-oop-concepts",
            question: "Explain OOP Concepts.",
            answer: "<p><strong>🔑 The four pillars of Object-Oriented Programming</strong></p><table><thead><tr><th>Pillar</th><th>Meaning</th><th>Java mechanism</th></tr></thead><tbody><tr><td>Encapsulation</td><td>Bundle data and behavior together, hide internal state</td><td><code>private</code> fields + public getters/setters</td></tr><tr><td>Inheritance</td><td>Reuse and specialize behavior from a parent type</td><td><code>extends</code>, <code>super</code></td></tr><tr><td>Polymorphism</td><td>Same call, different behavior depending on the actual object</td><td>method overriding (runtime) and overloading (compile-time)</td></tr><tr><td>Abstraction</td><td>Expose what an object does, hide how</td><td><code>abstract class</code>, <code>interface</code></td></tr></tbody></table><ul><li><strong>Encapsulation</strong> also enables validation — a setter can reject an invalid value before it's stored, something a public field can't do.</li><li><strong>Inheritance</strong> models IS-A relationships; overuse leads to fragile hierarchies, which is why &quot;favor composition over inheritance&quot; is common guidance.</li><li><strong>Polymorphism</strong> is what lets a <code>List&lt;Shape&gt;</code> hold <code>Circle</code>s and <code>Square</code>s and call <code>area()</code> on each without a type check.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to give one Java code example for each pillar — interviewers often follow this question with &quot;show me&quot;.</p>",
            referenceLinks: [{ title: "Oracle: Object-Oriented Programming Concepts", url: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" }],
            tags: ["oop", "encapsulation", "inheritance", "polymorphism", "abstraction"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "oop"
        },
        {
            id: "abstract-classes-vs-interfaces",
            question: "What are the differences between abstract classes and interfaces?",
            answer: "<p><strong>🔑 Both enable abstraction, but with different rules</strong></p><table><thead><tr><th>Aspect</th><th>Abstract class</th><th>Interface</th></tr></thead><tbody><tr><td>Inheritance</td><td>A class can extend only one abstract class</td><td>A class can implement many interfaces</td></tr><tr><td>State</td><td>Can hold instance fields with any access modifier</td><td>Fields are implicitly <code>public static final</code> (constants only)</td></tr><tr><td>Constructors</td><td>Can have constructors, called via subclass <code>super()</code></td><td>No constructors</td></tr><tr><td>Method bodies</td><td>Can mix abstract and fully implemented methods</td><td>Can have <code>default</code> and <code>static</code> methods (Java 8+) plus abstract ones</td></tr><tr><td>Access modifiers</td><td>Methods can be <code>public</code>, <code>protected</code>, <code>private</code></td><td>Methods are implicitly <code>public</code> (unless <code>private</code> helper, Java 9+)</td></tr><tr><td>Use case</td><td>Share common state/code among closely related types</td><td>Define a capability/contract unrelated types can adopt</td></tr></tbody></table><ul><li><strong>Diamond problem</strong> — Java forbids multiple class inheritance to avoid ambiguous state, but multiple interface implementation is fine since (pre-default-methods) interfaces carried no state; default method conflicts must be resolved explicitly by the implementing class.</li><li><strong>Rule of thumb</strong> — use an abstract class when subclasses share implementation and an IS-A relationship; use an interface when unrelated classes share a capability (CAN-DO relationship), e.g. <code>Comparable</code>, <code>Serializable</code>.</li></ul><p><strong>🎯 Interview tip:</strong> since Java 8's <code>default</code> methods, the line has blurred — the sharpest remaining distinction is that interfaces still cannot hold instance state.</p>",
            referenceLinks: [{ title: "Oracle: Abstract Methods and Classes", url: "https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html" }],
            tags: ["abstract-class", "interface", "oop", "abstraction", "default-methods"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Abstract class with shared state vs interface contract",
                code: "abstract class Animal { // shares state + partial implementation\n    protected final String name;\n    Animal(String name) { this.name = name; }\n    void breathe() { System.out.println(name + \" breathes\"); } // concrete\n    abstract void makeSound(); // must be implemented\n}\n\ninterface Flyable { // pure capability contract\n    void fly();\n    default void land() { System.out.println(\"landing\"); } // Java 8+\n}\n\nclass Eagle extends Animal implements Flyable {\n    Eagle(String name) { super(name); }\n    void makeSound() { System.out.println(name + \" screeches\"); }\n    public void fly() { System.out.println(name + \" soars\"); }\n}"
            }],
            subsection: "oop"
        },
        {
            id: "method-overloading-vs-overriding",
            question: "What is the difference between method overloading and overriding?",
            answer: "<p><strong>🔑 Compile-time choice vs runtime dispatch</strong></p><table><thead><tr><th>Aspect</th><th>Overloading</th><th>Overriding</th></tr></thead><tbody><tr><td>Where</td><td>Same class (or subclass adding new signatures)</td><td>Subclass redefines a superclass/interface method</td></tr><tr><td>Signature</td><td>Same name, different parameter list</td><td>Same name and same parameter list</td></tr><tr><td>Binding</td><td>Resolved at compile time (static binding)</td><td>Resolved at runtime via dynamic dispatch (vtable lookup)</td></tr><tr><td>Return type</td><td>Can differ freely</td><td>Must be same or a covariant subtype</td></tr><tr><td>Access modifier</td><td>No restriction</td><td>Cannot be more restrictive than the overridden method</td></tr><tr><td>Exceptions</td><td>No restriction</td><td>Cannot throw new/broader checked exceptions</td></tr><tr><td>Annotation</td><td>None required</td><td><code>@Override</code> (recommended, catches signature mistakes at compile time)</td></tr></tbody></table><ul><li><strong>Overloading</strong> is also called compile-time / static polymorphism because the compiler picks the exact method to call based on argument types at the call site.</li><li><strong>Overriding</strong> is runtime / dynamic polymorphism — the JVM looks up the actual object's class at runtime to decide which method body runs.</li><li><code>static</code>, <code>private</code>, and <code>final</code> methods cannot be overridden (they're resolved statically), but they can still be overloaded.</li></ul><p><strong>🎯 Interview tip:</strong> a common trap question is calling an overloaded method with <code>null</code> — the compiler picks the most specific applicable overload, which can surprise people.</p>",
            referenceLinks: [{ title: "Oracle: Overriding and Hiding Methods", url: "https://docs.oracle.com/javase/tutorial/java/IandI/override.html" }],
            tags: ["overloading", "overriding", "polymorphism", "static-binding", "dynamic-dispatch"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Overloading vs overriding side by side",
                code: "class Printer {\n    void print(String s) { System.out.println(s); }         // overload 1\n    void print(int i) { System.out.println(i); }             // overload 2 (different param type)\n}\n\nclass Animal {\n    void speak() { System.out.println(\"...\"); }\n}\n\nclass Dog extends Animal {\n    @Override\n    void speak() { System.out.println(\"Woof\"); } // same signature, runtime dispatch\n}\n\nAnimal a = new Dog();\na.speak(); // prints \"Woof\" — decided at runtime by actual object type"
            }],
            subsection: "oop"
        },
        {
            id: "string-pool-in-java",
            question: "Explain String Pool in Java",
            answer: "<p><strong>🔑 A cache of interned String literals</strong></p><ul><li>The <strong>String Pool</strong> (intern pool) is a special memory region — part of the heap since Java 7 (previously in PermGen) — where the JVM stores <strong>one canonical copy</strong> of each distinct string literal.</li><li><strong>How literals get pooled</strong> — writing <code>String s = \"hello\";</code> makes the JVM check the pool first; if <code>\"hello\"</code> already exists it reuses that reference instead of allocating a new object.</li><li><code>new String(\"hello\")</code> <strong>bypasses the pool</strong> — it always allocates a fresh object on the heap, even though the literal <code>\"hello\"</code> inside it is still pooled separately.</li><li><code>String.intern()</code> manually adds a string to the pool (or returns the existing pooled reference if already present), letting you opt a heap-allocated string back into pooling.</li><li><strong>Why it's safe</strong> — pooling relies entirely on <strong>String immutability</strong>; if strings were mutable, one holder mutating a shared pooled instance would corrupt every other reference to it.</li><li><strong>Consequence</strong> — <code>==</code> between two pooled literals is <code>true</code> (same reference), but between a literal and a <code>new String(...)</code> it's <code>false</code> even though <code>.equals()</code> is <code>true</code>.</li></ul><p><strong>🎯 Interview tip:</strong> the pool is a memory optimization, not a correctness guarantee — always compare string <em>content</em> with <code>.equals()</code>, never <code>==</code>.</p>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html#intern()" }],
            tags: ["string-pool", "intern", "immutability", "heap", "strings"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "String pool behavior",
                code: "String a = \"hello\";\nString b = \"hello\";\nSystem.out.println(a == b); // true — both reference the pooled literal\n\nString c = new String(\"hello\");\nSystem.out.println(a == c);        // false — c is a distinct heap object\nSystem.out.println(a.equals(c));   // true — same content\n\nString d = c.intern(); // pull c's content into (or find in) the pool\nSystem.out.println(a == d); // true — d now references the pooled instance"
            }],
            subsection: "oop"
        },
        {
            id: "access-modifiers-in-java",
            question: "What are the access modifiers in Java?",
            answer: "<p><strong>🔑 Four visibility levels control where a member can be accessed from</strong></p><table><thead><tr><th>Modifier</th><th>Same class</th><th>Same package</th><th>Subclass (other package)</th><th>Everywhere</th></tr></thead><tbody><tr><td><code>private</code></td><td>Yes</td><td>No</td><td>No</td><td>No</td></tr><tr><td>default (package-private)</td><td>Yes</td><td>Yes</td><td>No</td><td>No</td></tr><tr><td><code>protected</code></td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td></tr><tr><td><code>public</code></td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr></tbody></table><ul><li><strong>default</strong> (no keyword) is the narrowest visibility besides <code>private</code> — used often for package-internal helper classes.</li><li><strong>protected</strong> is really &quot;package + subclasses everywhere&quot;, which is slightly broader than most people expect — a subclass in a different package can access a <code>protected</code> member only through a reference typed as the subclass, not through an arbitrary superclass reference.</li><li>Top-level classes can only be <code>public</code> or default (package-private) — never <code>private</code> or <code>protected</code>.</li><li>Choosing the narrowest modifier that works is standard encapsulation practice — it minimizes the API surface future code can depend on.</li></ul>",
            referenceLinks: [{ title: "Oracle: Controlling Access to Members of a Class", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html" }],
            tags: ["access-modifiers", "encapsulation", "public", "private", "protected"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "oop"
        },
        {
            id: "interface-implement-another-interface",
            question: "Can an Interface implement another Interface?",
            answer: "<p><strong>🔑 No — interfaces extend, they don't implement</strong></p><ul><li>An interface <strong>cannot implement</strong> another interface in Java; only a <code>class</code> uses the <code>implements</code> keyword.</li><li>An interface can, however, <strong>extend one or more other interfaces</strong> using <code>extends</code> — this is Java's form of multiple inheritance of type (contracts only, no state).</li><li>A class that <code>implements</code> a child interface must provide implementations for <strong>every abstract method</strong> declared in it and all of its parent interfaces.</li><li><strong>Why the terminology matters</strong> — <code>implements</code> implies providing a concrete method body, which interfaces (before <code>default</code> methods) never did; <code>extends</code> implies inheriting/adding to a contract.</li></ul><p><strong>🎯 Interview tip:</strong> this is a quick terminology check interviewers use to see if you understand that Java interfaces model contracts, not behavior, at the type level.</p>",
            referenceLinks: [{ title: "Oracle: Creating Interfaces", url: "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html" }],
            tags: ["interfaces", "extends", "implements", "multiple-inheritance", "oop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Interface extending multiple interfaces",
                code: "interface Readable {\n    String read();\n}\n\ninterface Writable {\n    void write(String data);\n}\n\n// An interface EXTENDS other interfaces, it does not implement them\ninterface ReadWritable extends Readable, Writable {\n    default boolean isEmpty() { return read().isEmpty(); }\n}\n\nclass FileChannel implements ReadWritable { // class IMPLEMENTS\n    public String read() { return \"data\"; }\n    public void write(String data) { /* ... */ }\n}"
            }],
            subsection: "oop"
        },
        {
            id: "polymorphism-and-inheritance",
            question: "What is Polymorphism? What about Inheritance?",
            answer: "<p><strong>🔑 &quot;Many forms&quot; through shared type, specialization through extension</strong></p><ul><li><strong>Polymorphism</strong> lets objects of different classes be treated through a common supertype/interface reference while each responds to the same call in its own way. Java has two kinds:<ul><li><strong>Compile-time (static)</strong> — method overloading; the compiler picks the exact method based on argument types.</li><li><strong>Runtime (dynamic)</strong> — method overriding; the JVM dispatches to the actual object's implementation via the virtual method table, decided only at runtime.</li></ul></li><li><strong>Inheritance</strong> establishes an IS-A relationship — a subclass (<code>extends</code>) reuses and can override the fields/methods of a superclass, and gains access to inherited <code>protected</code>/<code>public</code> members.</li><li><strong>Java restriction</strong> — single inheritance of classes only (one <code>extends</code>), but multiple interface implementation, avoiding the classic diamond-of-state problem.</li><li><strong>super</strong> keyword accesses the immediate superclass's constructor (<code>super(...)</code>, must be first statement) or an overridden method's original implementation (<code>super.method()</code>).</li><li><strong>Relationship between the two</strong> — inheritance is the structural mechanism; runtime polymorphism is the behavior it enables, since a variable of the supertype can hold any subtype instance and dispatch correctly.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to explain <em>why</em> a subclass reference stored in a supertype variable still calls the overridden method — it's because dispatch is based on the object's actual runtime type, not the reference's compile-time type.</p>",
            referenceLinks: [{ title: "Oracle: Inheritance", url: "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html" }],
            tags: ["polymorphism", "inheritance", "oop", "overriding", "super"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Inheritance enabling runtime polymorphism",
                code: "class Shape {\n    double area() { return 0; }\n}\n\nclass Circle extends Shape {\n    private final double r;\n    Circle(double r) { this.r = r; }\n    @Override double area() { return Math.PI * r * r; }\n}\n\nclass Square extends Shape {\n    private final double side;\n    Square(double side) { this.side = side; }\n    @Override double area() { return side * side; }\n}\n\nList<Shape> shapes = List.of(new Circle(2), new Square(3));\nfor (Shape s : shapes) {\n    System.out.println(s.area()); // dispatch resolved per actual object at runtime\n}"
            }],
            subsection: "oop"
        },
        {
            id: "arrays-vs-arraylists",
            question: "Arrays vs ArrayLists",
            answer: "<p><strong>🔑 Fixed-size raw storage vs a resizable, generic collection</strong></p><table><thead><tr><th>Aspect</th><th>Array</th><th>ArrayList</th></tr></thead><tbody><tr><td>Size</td><td>Fixed at creation, cannot grow/shrink</td><td>Dynamically resizes (backing array doubles-ish on growth)</td></tr><tr><td>Type</td><td>Can hold primitives directly (<code>int[]</code>)</td><td>Only holds objects — primitives are autoboxed (<code>Integer</code>)</td></tr><tr><td>API</td><td>Minimal — <code>.length</code>, indexing</td><td>Rich — <code>add</code>, <code>remove</code>, <code>contains</code>, streams, etc. via <code>List</code></td></tr><tr><td>Performance</td><td>Slightly faster, less memory overhead (no boxing, no capacity slack)</td><td>Small overhead per element (object header + boxing) and occasional resize cost</td></tr><tr><td>Multi-dimensional</td><td>Native support (<code>int[][]</code>)</td><td>Simulated via nested <code>List&lt;List&lt;T&gt;&gt;</code></td></tr></tbody></table><ul><li><strong>Under the hood</strong> — <code>ArrayList</code> is backed by an <code>Object[]</code> that's reallocated and copied (~1.5x growth) whenever capacity is exceeded, so <code>add()</code> is amortized O(1) but occasionally O(n).</li><li><strong>Random access</strong> — both are O(1) by index; that's the main reason to prefer either over a <code>LinkedList</code>.</li><li>Use a raw array when size is known and fixed and you want to avoid boxing overhead (e.g. numeric buffers); use <code>ArrayList</code> for everything else needing dynamic growth and the Collections API.</li></ul>",
            referenceLinks: [{ title: "Oracle: ArrayList (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html" }],
            tags: ["array", "arraylist", "collections", "generics", "autoboxing"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Array vs ArrayList",
                code: "int[] fixed = new int[3];       // fixed size, primitives, no boxing\nfixed[0] = 10;\n\nList<Integer> dynamic = new ArrayList<>(); // resizable, boxed Integers\ndynamic.add(10);\ndynamic.add(20);\ndynamic.remove(Integer.valueOf(10)); // remove by value, not index\nSystem.out.println(dynamic.size());"
            }],
            subsection: "collections-generics"
        },
        {
            id: "hashset-vs-treeset",
            question: "HashSet vs TreeSet",
            answer: "<p><strong>🔑 Unordered O(1) lookups vs sorted O(log n) lookups</strong></p><table><thead><tr><th>Aspect</th><th>HashSet</th><th>TreeSet</th></tr></thead><tbody><tr><td>Backing structure</td><td><code>HashMap</code> (buckets + hashing)</td><td>Red-black tree (<code>TreeMap</code> under the hood)</td></tr><tr><td>Ordering</td><td>No guaranteed order</td><td>Sorted — natural order or a supplied <code>Comparator</code></td></tr><tr><td>add/remove/contains</td><td>O(1) average</td><td>O(log n)</td></tr><tr><td>null elements</td><td>One <code>null</code> allowed</td><td>Not allowed (NPE on natural ordering comparison)</td></tr><tr><td>Requires</td><td>Correct <code>hashCode()</code>/<code>equals()</code></td><td><code>Comparable</code> elements or a <code>Comparator</code></td></tr><tr><td>Extra API</td><td>None beyond <code>Set</code></td><td><code>first()</code>, <code>last()</code>, <code>headSet()</code>, <code>ceiling()</code>, <code>floor()</code> (via <code>NavigableSet</code>)</td></tr></tbody></table><ul><li><strong>LinkedHashSet</strong> sits between them — O(1) like <code>HashSet</code> but preserves insertion order via an internal doubly-linked list.</li><li>Pick <code>TreeSet</code> when you need sorted iteration or range queries; pick <code>HashSet</code> when you only need fast membership testing and order doesn't matter.</li></ul>",
            referenceLinks: [{ title: "Oracle: TreeSet (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TreeSet.html" }],
            tags: ["hashset", "treeset", "collections", "sets", "comparator"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "collections-generics"
        },
        {
            id: "hashmap-vs-set",
            question: "HashMap vs Set",
            answer: "<p><strong>🔑 Key-value pairs vs unique elements — and a Set is literally built on a Map</strong></p><ul><li><strong>HashMap&lt;K, V&gt;</strong> stores <strong>key-value associations</strong>; you look up a value by key. Keys are unique, values can repeat.</li><li><strong>HashSet&lt;E&gt;</strong> stores <strong>unique elements only</strong>, no associated value — and internally it <em>is</em> a <code>HashMap&lt;E, Object&gt;</code>, where every element becomes a map key and all values point to a single shared dummy sentinel object (historically named <code>PRESENT</code>).</li><li>Because of that, <code>HashSet.add(e)</code> is implemented as <code>map.put(e, PRESENT) == null</code> — it reuses all of <code>HashMap</code>'s hashing, bucket, and treeification logic.</li><li>Use a <code>Map</code> when you need to associate data with a key (e.g. <code>userId -&gt; User</code>); use a <code>Set</code> when you only care about membership/uniqueness (e.g. &quot;have I seen this ID before?&quot;).</li><li>Both rely on a correct <code>hashCode()</code>/<code>equals()</code> contract on the key/element type for correct bucket placement and lookup.</li></ul><p><strong>🎯 Interview tip:</strong> knowing that <code>HashSet</code> is a thin wrapper around <code>HashMap</code> is a strong signal you understand the collections framework's internal design, not just its public API.</p>",
            referenceLinks: [{ title: "Oracle: HashMap (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html" }],
            tags: ["hashmap", "hashset", "collections", "hashing", "map-vs-set"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "HashSet backed by HashMap",
                code: "// Conceptually, java.util.HashSet does this internally:\nclass MyHashSet<E> {\n    private static final Object PRESENT = new Object();\n    private final HashMap<E, Object> map = new HashMap<>();\n\n    boolean add(E e) {\n        return map.put(e, PRESENT) == null; // null return means key was new\n    }\n\n    boolean contains(E e) {\n        return map.containsKey(e);\n    }\n}"
            }],
            subsection: "collections-generics"
        },
        {
            id: "generics-in-java",
            question: "Explain Generics in Java",
            answer: "<p><strong>🔑 Compile-time type safety for classes, interfaces and methods</strong></p><ul><li><strong>Generics</strong> let you parameterize a type (e.g. <code>List&lt;String&gt;</code>) so the compiler enforces type correctness at compile time instead of relying on unchecked casts at runtime.</li><li><strong>Type erasure</strong> — the JVM has no idea about generics at runtime; the compiler erases <code>List&lt;String&gt;</code> down to raw <code>List</code> and inserts the necessary casts, which is why you can't do <code>new T[]</code> or check <code>obj instanceof List&lt;String&gt;</code>.</li><li><strong>Bounded type parameters</strong> — <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> restricts <code>T</code> to types implementing <code>Comparable</code>, letting you call <code>compareTo</code> inside a generic method.</li><li><strong>Wildcards</strong> — <code>? extends T</code> (upper bound, read-only &quot;producer&quot;) and <code>? super T</code> (lower bound, write-only &quot;consumer&quot;) implement the PECS rule (Producer Extends, Consumer Super) for flexible API design.</li><li><strong>Generic methods</strong> can declare their own type parameter independent of the enclosing class, e.g. <code>static &lt;T&gt; List&lt;T&gt; singletonList(T item)</code>.</li><li><strong>Benefit</strong> — eliminates <code>ClassCastException</code> at runtime by catching type mismatches at compile time, and removes the need for manual casting when reading from collections.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to explain why <code>List&lt;Object&gt;</code> is not a supertype of <code>List&lt;String&gt;</code> (generics are invariant) and how wildcards work around that.</p>",
            referenceLinks: [{ title: "Oracle: Generics", url: "https://docs.oracle.com/javase/tutorial/java/generics/index.html" }],
            tags: ["generics", "type-erasure", "wildcards", "bounded-types", "pecs"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Bounded types and PECS wildcards",
                code: "// Bounded type parameter\nstatic <T extends Comparable<T>> T max(List<T> list) {\n    T result = list.get(0);\n    for (T item : list) if (item.compareTo(result) > 0) result = item;\n    return result;\n}\n\n// PECS: Producer Extends, Consumer Super\nstatic void copy(List<? extends Number> source, List<? super Integer> dest) {\n    for (Number n : source) {   // source only produces values\n        dest.add(n.intValue()); // dest only consumes values\n    }\n}"
            }],
            subsection: "collections-generics"
        },
        {
            id: "string-class-implementation-immutability",
            question: "How is String class implemented? Why was it made immutable?",
            answer: "<p><strong>🔑 A final class wrapping an internal char/byte array, immutable by design</strong></p><ul><li><strong>Implementation</strong> — <code>String</code> is declared <code>final</code> (cannot be subclassed) and internally wraps a <code>private final</code> array (<code>char[]</code> pre-Java 9, a compact <code>byte[]</code> with a coder flag from Java 9+ for Latin-1/UTF-16 storage). No public method ever mutates that array; operations like <code>substring()</code> or <code>concat()</code> return a <strong>new</strong> <code>String</code>.</li><li><strong>Security</strong> — strings are used for class names, file paths, network hosts, DB credentials; immutability prevents a downstream method from mutating a string after a security check (e.g. a class-loader or file-permission check) has validated it.</li><li><strong>String pool safety</strong> — pooling/interning is only correct if the shared instance can never change; a mutable pooled string would corrupt every other reference sharing it.</li><li><strong>Thread safety</strong> — immutable objects are inherently safe to share across threads without synchronization, since there's no mutable state to race on.</li><li><strong>Hashcode caching</strong> — because content can never change, <code>String</code> caches its <code>hashCode()</code> after first computation, making it a fast, safe key for <code>HashMap</code>/<code>HashSet</code>.</li><li><strong>Trade-off</strong> — heavy string concatenation in a loop creates many intermediate objects; use <code>StringBuilder</code> for that case instead.</li></ul><p><strong>🎯 Interview tip:</strong> tie immutability to three concrete payoffs — pool safety, thread safety, and safe hashcode caching — interviewers want the &quot;why&quot;, not just the &quot;what&quot;.</p>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html" }],
            tags: ["string", "immutability", "string-pool", "thread-safety", "hashcode"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Every String operation returns a new object",
                code: "String original = \"hello\";\nString upper = original.toUpperCase(); // new object\nSystem.out.println(original); // still \"hello\" — unchanged\nSystem.out.println(upper);    // \"HELLO\"\nSystem.out.println(original == upper); // false — different objects"
            }],
            subsection: "objects-primitives"
        },
        {
            id: "string-immutability-meaning",
            question: "What does it mean to say that a String is immutable?",
            answer: "<p><strong>🔑 Once created, a String's content can never change</strong></p><ul><li><strong>Immutable</strong> means no method on <code>String</code> can modify the character data of an existing instance — every apparent &quot;modification&quot; (<code>concat</code>, <code>replace</code>, <code>toUpperCase</code>, <code>trim</code>...) allocates and returns a <strong>brand-new</strong> <code>String</code> object.</li><li><strong>Common beginner bug</strong> — calling <code>str.toUpperCase();</code> without reassigning (<code>str = str.toUpperCase();</code>) discards the result; <code>str</code> itself never changed.</li><li><strong>Consequence for loops</strong> — repeated concatenation (<code>result += item</code>) in a loop creates a new object on every iteration, which is O(n²) overall; <code>StringBuilder.append()</code> mutates a resizable internal buffer instead and is O(n) overall.</li><li><strong>Reference vs content</strong> — a <code>final String</code> reference still can't be reassigned, but even a non-<code>final</code> <code>String</code> variable can only be pointed at a <em>different</em> object, never mutate the object it currently points to.</li></ul>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html" }],
            tags: ["string", "immutability", "stringbuilder", "performance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Immutability trap",
                code: "String s = \"abc\";\ns.toUpperCase();     // return value discarded — bug!\nSystem.out.println(s); // still \"abc\"\n\ns = s.toUpperCase(); // correct — reassign the reference\nSystem.out.println(s); // \"ABC\""
            }],
            subsection: "objects-primitives"
        },
        {
            id: "eight-primitive-types",
            question: "List the 8 primitive types in Java.",
            answer: "<p><strong>🔑 Java has exactly 8 built-in, non-object primitive types</strong></p><table><thead><tr><th>Type</th><th>Size</th><th>Default</th><th>Wrapper class</th></tr></thead><tbody><tr><td><code>byte</code></td><td>8-bit</td><td>0</td><td><code>Byte</code></td></tr><tr><td><code>short</code></td><td>16-bit</td><td>0</td><td><code>Short</code></td></tr><tr><td><code>int</code></td><td>32-bit</td><td>0</td><td><code>Integer</code></td></tr><tr><td><code>long</code></td><td>64-bit</td><td>0L</td><td><code>Long</code></td></tr><tr><td><code>float</code></td><td>32-bit IEEE 754</td><td>0.0f</td><td><code>Float</code></td></tr><tr><td><code>double</code></td><td>64-bit IEEE 754</td><td>0.0d</td><td><code>Double</code></td></tr><tr><td><code>char</code></td><td>16-bit unsigned (UTF-16 code unit)</td><td>'\\u0000'</td><td><code>Character</code></td></tr><tr><td><code>boolean</code></td><td>JVM-dependent (not precisely specified)</td><td>false</td><td><code>Boolean</code></td></tr></tbody></table><ul><li>Primitives are stored <strong>by value</strong>, live on the stack when local (or inline in an object's memory layout when fields), and are <strong>not</strong> objects — they have no methods and cannot be <code>null</code>.</li><li>Each has a corresponding <strong>wrapper class</strong> in <code>java.lang</code> enabling use in generics/collections (which require objects) via autoboxing.</li></ul>",
            referenceLinks: [{ title: "Oracle: Primitive Data Types", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html" }],
            tags: ["primitives", "wrapper-classes", "data-types", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "objects-primitives"
        },
        {
            id: "integer-vs-int",
            question: "What is the difference between Integer and int?",
            answer: "<p><strong>🔑 A primitive value vs a heap-allocated wrapper object</strong></p><table><thead><tr><th>Aspect</th><th>int</th><th>Integer</th></tr></thead><tbody><tr><td>Kind</td><td>Primitive type</td><td>Object (wraps an <code>int</code> field)</td></tr><tr><td>Default value</td><td>0</td><td><code>null</code></td></tr><tr><td>Storage</td><td>Stack (local var) / inline in object</td><td>Heap-allocated object with header overhead</td></tr><tr><td>Nullability</td><td>Cannot be <code>null</code></td><td>Can be <code>null</code> → risk of <code>NullPointerException</code> on unboxing</td></tr><tr><td>Usable in generics/collections</td><td>No (<code>List&lt;int&gt;</code> is illegal)</td><td>Yes (<code>List&lt;Integer&gt;</code>)</td></tr><tr><td>Comparison with <code>==</code></td><td>Compares value</td><td>Compares reference identity (except cached -128..127 via Integer cache)</td></tr><tr><td>Extra API</td><td>None</td><td><code>Integer.parseInt()</code>, <code>compareTo()</code>, <code>MAX_VALUE</code>, etc.</td></tr></tbody></table><ul><li><strong>Autoboxing/unboxing</strong> converts silently between them, but unboxing a <code>null Integer</code> (e.g. in an <code>if (someInteger == 5)</code> or arithmetic context) throws <code>NullPointerException</code>.</li><li>Prefer primitive <code>int</code> for local computation (cheaper, no boxing overhead); use <code>Integer</code> only where an object is required, such as generic collections or when representing &quot;no value&quot; via <code>null</code>.</li></ul>",
            referenceLinks: [{ title: "Oracle: Integer (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html" }],
            tags: ["integer", "int", "autoboxing", "wrapper-classes", "primitives"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Unboxing NullPointerException trap",
                code: "Integer boxed = null;\nint primitive;\ntry {\n    primitive = boxed; // auto-unboxing attempts boxed.intValue() -> NPE\n} catch (NullPointerException e) {\n    System.out.println(\"Unboxing null throws NPE\");\n}\n\nMap<String, Integer> scores = new HashMap<>();\nint score = scores.getOrDefault(\"missing\", 0); // safe default avoids the trap"
            }],
            subsection: "objects-primitives"
        },
        {
            id: "pass-by-reference-or-value",
            question: "Do objects get passed by reference or value in Java?",
            answer: "<p><strong>🔑 Java is always pass-by-value — even for objects</strong></p><ul><li>Java has <strong>no pass-by-reference</strong>. Every argument — primitive or object — is passed by <strong>copying its value</strong> into the method's parameter.</li><li>For an object argument, the <em>value being copied is the reference itself</em> (essentially a memory address/handle) — so the method receives a copy of the reference that points to the <strong>same</strong> underlying object.</li><li><strong>Consequence 1</strong> — mutating the object's internal state through the copied reference (e.g. <code>list.add(x)</code>, <code>obj.setName(...)</code>) <strong>is visible</strong> to the caller, because both references point at the same heap object.</li><li><strong>Consequence 2</strong> — reassigning the parameter itself (<code>param = new Foo()</code>) inside the method only repoints the local copy of the reference; the caller's original reference still points at the original object, unaffected.</li><li>This is why the precise phrasing matters: Java passes <strong>&quot;a copy of the reference&quot;</strong> by value, not the object by reference — true pass-by-reference (as in C++ <code>&amp;</code> parameters) would let the callee reassign the caller's variable itself.</li></ul><p><strong>🎯 Interview tip:</strong> give the classic demo — a method that does <code>person.setName(\"new\")</code> changes the caller's object, but a method that does <code>person = new Person(...)</code> does not — that single example proves the pass-by-value model.</p>",
            referenceLinks: [{ title: "Oracle: Passing Information to a Method or a Constructor", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html" }],
            tags: ["pass-by-value", "references", "method-arguments", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Pass-by-value with reference semantics",
                code: "class Box { String label; }\n\nstatic void mutate(Box b) {\n    b.label = \"mutated\"; // visible to caller — same object\n}\n\nstatic void reassign(Box b) {\n    b = new Box();        // only repoints the local copy\n    b.label = \"invisible\";\n}\n\nBox box = new Box();\nbox.label = \"original\";\nmutate(box);\nSystem.out.println(box.label);   // \"mutated\"\nreassign(box);\nSystem.out.println(box.label);   // still \"mutated\" — reassign had no external effect"
            }],
            subsection: "objects-primitives"
        },
        {
            id: "garbage-collector",
            question: "What is garbage collector? How does it work?",
            answer: "<p><strong>🔑 Automatic reclamation of heap memory no longer reachable</strong></p><ul><li>The <strong>Garbage Collector (GC)</strong> is a JVM subsystem that automatically frees heap memory occupied by objects that are no longer <strong>reachable</strong> from any GC root (local variables on the stack, static fields, active threads, JNI references) — the programmer never manually <code>free()</code>s memory.</li><li><strong>Generational hypothesis</strong> — most objects die young, so the heap is split into a small <strong>Young Generation</strong> (Eden + two Survivor spaces) collected frequently and cheaply (Minor GC), and an <strong>Old Generation</strong> for long-lived objects promoted after surviving several minor GCs, collected less often but more expensively (Major/Full GC).</li><li><strong>Basic algorithm</strong> — mark reachable objects from GC roots, sweep (reclaim) unreachable ones, and optionally compact (slide surviving objects together to eliminate fragmentation).</li><li><strong>Stop-the-world</strong> — most GC phases pause all application threads briefly to safely traverse the object graph; modern collectors minimize this pause.</li><li><strong>Collectors available</strong> — <code>Serial</code> (single-threaded, small heaps), <code>Parallel</code> (throughput-focused, multi-threaded), <code>G1</code> (default since Java 9, region-based, balances throughput/pause time), <code>ZGC</code>/<code>Shenandoah</code> (very low pause, sub-millisecond, for huge heaps).</li><li><strong>What it does NOT do</strong> — it does not manage the stack (frames pop automatically on method return) and cannot collect objects still reachable but never used (a lingering static reference is a classic memory leak GC can't fix).</li></ul><p><strong>🎯 Interview tip:</strong> mention that <code>System.gc()</code> is only a <em>hint</em> to the JVM, not a guaranteed immediate collection.</p>",
            referenceLinks: [{ title: "Oracle: Garbage Collection Tuning Guide", url: "https://docs.oracle.com/en/java/javase/17/gctuning/introduction-garbage-collection-tuning.html" }],
            tags: ["garbage-collection", "gc", "heap", "jvm", "memory-management"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "JVM Memory & GC Flow",
                columns: 3,
                nodes: [
                    { label: "Stack (per thread)", type: "terminal" },
                    { label: "Heap: Young Gen (Eden+Survivor)" },
                    { label: "Object survives GC?", type: "decision" },
                    { label: "Metaspace", type: "terminal" },
                    { label: "Heap: Old Gen" },
                    { label: "Reclaimed (Minor/Major GC)", type: "terminal" }
                ],
                connections: [
                    { from: 1, to: 2 },
                    { from: 2, to: 4, label: "yes, promoted" },
                    { from: 2, to: 5, label: "no" },
                    { from: 4, to: 5, label: "Full GC" }
                ]
            },
            codeSnippets: [],
            subsection: "java-memory-model"
        },
        {
            id: "synchronized-keyword",
            question: "What does the keyword synchronized mean?",
            answer: "<p><strong>🔑 Mutual exclusion via an intrinsic monitor lock</strong></p><ul><li><code>synchronized</code> ensures that <strong>only one thread at a time</strong> can execute a block or method guarded by a given object's <strong>intrinsic lock (monitor)</strong> — every Java object has one built in.</li><li><strong>Synchronized method</strong> — <code>synchronized void foo()</code> locks on <code>this</code> for instance methods, or on the <code>Class</code> object for <code>static synchronized</code> methods.</li><li><strong>Synchronized block</strong> — <code>synchronized(lockObject) { ... }</code> locks on an explicit object, giving finer-grained control than locking the whole method and letting you protect only the critical section.</li><li><strong>Guarantees two things</strong> — <strong>mutual exclusion</strong> (no two threads run the block concurrently for the same lock) and <strong>visibility</strong> (changes made inside a synchronized block by one thread are guaranteed visible to the next thread that acquires the same lock, via the happens-before relationship).</li><li><strong>Reentrant</strong> — a thread already holding a lock can re-enter another synchronized block guarded by the same lock without deadlocking itself.</li><li><strong>Cost</strong> — contention causes threads to block (not spin), which can hurt throughput; <code>java.util.concurrent</code> locks (<code>ReentrantLock</code>) offer more flexibility (tryLock, fairness, interruptible waits) at the cost of manual unlock in a <code>finally</code> block.</li></ul><p><strong>🎯 Interview tip:</strong> always pair a discussion of <code>synchronized</code> with <code>volatile</code> — <code>synchronized</code> gives both atomicity and visibility, <code>volatile</code> gives only visibility.</p>",
            referenceLinks: [{ title: "Oracle: Synchronized Methods", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/syncmeth.html" }],
            tags: ["synchronized", "concurrency", "locks", "monitor", "thread-safety"],
            hasDiagram: true,
            diagramType: "sequence",
            diagramConfig: {
                title: "Two threads contending a monitor",
                actors: ["Thread-1", "Monitor", "Thread-2"],
                messages: [
                    { from: 0, to: 1, label: "acquire lock" },
                    { from: 2, to: 1, label: "request lock" },
                    { from: 1, to: 2, label: "blocked", dashed: true },
                    { from: 0, to: 1, label: "release lock" },
                    { from: 1, to: 2, label: "lock granted" }
                ]
            },
            codeSnippets: [{
                language: "java",
                title: "Synchronized method vs synchronized block",
                code: "class Counter {\n    private int count = 0;\n    private final Object lock = new Object();\n\n    synchronized void incrementWhole() { // locks on 'this'\n        count++;\n    }\n\n    void incrementBlock() {\n        // non-critical work here runs unsynchronized\n        synchronized (lock) { // finer-grained critical section\n            count++;\n        }\n    }\n\n    synchronized int get() { return count; }\n}"
            }],
            subsection: "concurrency"
        },
        {
            id: "threadpoolexecutor",
            question: "What is a ThreadPoolExecutor?",
            answer: "<p><strong>🔑 A configurable, reusable pool of worker threads</strong></p><ul><li><strong>ThreadPoolExecutor</strong> is the core implementation behind <code>Executors</code> factory methods — it manages a pool of worker threads that pull <code>Runnable</code>/<code>Callable</code> tasks off a work queue, avoiding the cost of creating a new OS thread per task.</li><li><strong>Key sizing parameters</strong> — <code>corePoolSize</code> (threads kept alive even when idle), <code>maximumPoolSize</code> (hard cap), <code>keepAliveTime</code> (how long idle threads beyond core size survive), and a <code>BlockingQueue</code> for pending tasks.</li><li><strong>Submission algorithm</strong> — if fewer than <code>corePoolSize</code> threads exist, start a new one; else queue the task; if the queue is full, start a new thread up to <code>maximumPoolSize</code>; if that's also maxed out, invoke the <code>RejectedExecutionHandler</code> (default <code>AbortPolicy</code> throws).</li><li><strong>Sizing rule of thumb</strong> — for <strong>CPU-bound</strong> work, size the pool near <code>Runtime.getRuntime().availableProcessors()</code>; for <strong>I/O-bound</strong> work (blocking on network/disk), a larger pool pays off since threads spend most time waiting, not computing.</li><li><strong>Android relevance</strong> — <code>AsyncTask</code>'s internal pool and custom executors for background work are built on this; modern Android code generally prefers Kotlin coroutines with dispatchers instead of managing an executor directly.</li><li><strong>Shutdown</strong> — always call <code>shutdown()</code> (finish queued tasks, reject new ones) or <code>shutdownNow()</code> (attempt to cancel running tasks) to release threads; a leaked pool keeps the JVM alive.</li></ul><p><strong>🎯 Interview tip:</strong> know the four rejection policies — <code>AbortPolicy</code>, <code>CallerRunsPolicy</code>, <code>DiscardPolicy</code>, <code>DiscardOldestPolicy</code> — interviewers often ask what happens when the queue and pool are both full.</p>",
            referenceLinks: [{ title: "Oracle: ThreadPoolExecutor (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html" }],
            tags: ["threadpoolexecutor", "concurrency", "executors", "thread-pool", "java-util-concurrent"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Task submission flow",
                columns: 2,
                nodes: [
                    { label: "Task submitted", type: "terminal" },
                    { label: "Below corePoolSize?", type: "decision" },
                    { label: "Start core thread" },
                    { label: "Queue full?", type: "decision" },
                    { label: "Enqueue task" },
                    { label: "Below maxPoolSize?", type: "decision" },
                    { label: "Start extra thread" },
                    { label: "RejectedExecutionHandler", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2, label: "yes" },
                    { from: 1, to: 3, label: "no" },
                    { from: 3, to: 4, label: "no" },
                    { from: 3, to: 5, label: "yes" },
                    { from: 5, to: 6, label: "yes" },
                    { from: 5, to: 7, label: "no" }
                ]
            },
            codeSnippets: [{
                language: "java",
                title: "Custom ThreadPoolExecutor",
                code: "ThreadPoolExecutor executor = new ThreadPoolExecutor(\n    4,                              // corePoolSize\n    8,                              // maximumPoolSize\n    30, TimeUnit.SECONDS,           // keepAliveTime for extra threads\n    new LinkedBlockingQueue<>(100), // work queue\n    new ThreadPoolExecutor.CallerRunsPolicy() // backpressure instead of throwing\n);\n\nexecutor.submit(() -> processTask());\nexecutor.shutdown(); // stop accepting new tasks, finish queued ones"
            }],
            subsection: "concurrency"
        },
        {
            id: "volatile-modifier",
            question: "What is the volatile modifier?",
            answer: "<p><strong>🔑 Guarantees visibility and ordering, not atomicity</strong></p><ul><li><code>volatile</code> tells the JVM that a field's value can be modified by multiple threads — every read goes directly to main memory (not a cached/CPU-register copy) and every write is immediately flushed to main memory.</li><li><strong>Happens-before</strong> — a write to a <code>volatile</code> field happens-before every subsequent read of that same field by any thread, establishing a memory-ordering guarantee (per the Java Memory Model, JLS §17.4) that also makes all writes made <em>before</em> the volatile write visible to the reader.</li><li><strong>What it does NOT give you</strong> — <strong>atomicity</strong> for compound actions. <code>volatile int counter; counter++;</code> is still a read-modify-write race, because <code>++</code> is three separate operations (read, add, write) that can interleave across threads.</li><li><strong>vs synchronized</strong> — <code>synchronized</code> gives mutual exclusion + visibility (and can protect multi-step invariants); <code>volatile</code> gives only visibility/ordering for a single field, with no locking overhead.</li><li><strong>Typical use case</strong> — a boolean flag read by one thread and set by another to signal shutdown/cancellation (e.g. <code>private volatile boolean running = true;</code>), where no compound state update is involved.</li><li>For compound atomic operations without full locking, prefer <code>java.util.concurrent.atomic</code> classes (<code>AtomicInteger</code>, etc.), which use CAS instructions.</li></ul><p><strong>🎯 Interview tip:</strong> the sharpest one-liner — &quot;volatile makes reads/writes visible across threads, it does not make compound operations atomic.&quot;</p>",
            referenceLinks: [{ title: "Oracle: JLS 17.4 Memory Model", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.4" }],
            tags: ["volatile", "concurrency", "memory-model", "happens-before", "visibility"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "volatile flag vs non-atomic counter",
                code: "class Worker {\n    private volatile boolean running = true; // safe: single flag, no compound op\n    private volatile int counter = 0;         // UNSAFE for counter++\n\n    void stop() { running = false; } // write visible to reading thread immediately\n\n    void run() {\n        while (running) {\n            counter++; // read-modify-write RACE despite volatile\n        }\n    }\n}"
            }],
            subsection: "concurrency"
        },
        {
            id: "object-level-vs-class-level-lock",
            question: "Object Level Lock vs Class Level Lock in Java",
            answer: "<p><strong>🔑 Locking a single instance's monitor vs locking the shared Class object's monitor</strong></p><table><thead><tr><th>Aspect</th><th>Object-level lock</th><th>Class-level lock</th></tr></thead><tbody><tr><td>Acquired via</td><td><code>synchronized</code> instance method, or <code>synchronized(this)</code></td><td><code>static synchronized</code> method, or <code>synchronized(MyClass.class)</code></td></tr><tr><td>Lock held on</td><td>The specific object instance</td><td>The single <code>Class</code> object (one per class, shared JVM-wide)</td></tr><tr><td>Scope</td><td>Per-instance — two threads on <em>different</em> instances don't block each other</td><td>Global to the class — blocks across <strong>all</strong> instances and threads</td></tr><tr><td>Typical use</td><td>Protecting instance state (e.g. a bank account balance)</td><td>Protecting static/shared state (e.g. a singleton counter, static cache)</td></tr></tbody></table><ul><li>They are <strong>independent locks</strong> — a thread holding the class-level lock does not block another thread from acquiring an object-level lock on some instance, and vice versa.</li><li><strong>Common bug</strong> — mixing an instance method's <code>synchronized(this)</code> with a static method's <code>synchronized(MyClass.class)</code> when both guard the <em>same</em> shared static field gives no real protection, since they're different locks.</li></ul>",
            referenceLinks: [{ title: "Oracle: Intrinsic Locks and Synchronization", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html" }],
            tags: ["synchronized", "locks", "concurrency", "static", "monitor"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Object-level vs class-level locks are independent",
                code: "class Account {\n    private double balance;\n    private static int totalAccounts = 0;\n\n    synchronized void withdraw(double amt) { // locks 'this' (object-level)\n        balance -= amt;\n    }\n\n    static synchronized void registerAccount() { // locks Account.class (class-level)\n        totalAccounts++;\n    }\n}\n\n// Thread A calling acc1.withdraw() and Thread B calling acc2.withdraw()\n// run concurrently -- different object locks. Thread C calling\n// Account.registerAccount() blocks any other thread calling it too."
            }],
            subsection: "concurrency"
        },
        {
            id: "concurrency-vs-parallelism",
            question: "Concurrency vs Parallelism",
            answer: "<p><strong>🔑 Dealing with many things at once vs doing many things at once</strong></p><table><thead><tr><th>Aspect</th><th>Concurrency</th><th>Parallelism</th></tr></thead><tbody><tr><td>Definition</td><td>Structuring a program to handle multiple tasks that make progress in overlapping time periods</td><td>Actually executing multiple tasks at the exact same instant</td></tr><tr><td>Requires multiple cores?</td><td>No — achievable via time-slicing on a single core</td><td>Yes — needs multiple CPU cores/processors</td></tr><tr><td>Goal</td><td>Responsiveness, structure, resource utilization</td><td>Raw throughput / speed via simultaneous work</td></tr><tr><td>Java example</td><td>A single-threaded event loop juggling multiple async callbacks</td><td>A <code>ForkJoinPool</code> splitting an array sum across 8 cores</td></tr></tbody></table><ul><li><strong>Analogy</strong> — concurrency is one barista handling three orders by switching between them; parallelism is three baristas each making one order simultaneously.</li><li><strong>They're independent axes</strong> — you can have concurrency without parallelism (single core, context-switched threads) and, less commonly discussed, parallelism is normally built on top of concurrent task decomposition.</li><li><strong>In Java</strong> — <code>java.util.concurrent</code> provides concurrency primitives (executors, locks, queues); parallel streams (<code>list.parallelStream()</code>) and <code>ForkJoinPool</code> provide true parallelism by splitting work across cores.</li></ul>",
            referenceLinks: [{ title: "Oracle: Processes and Threads", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html" }],
            tags: ["concurrency", "parallelism", "multithreading", "forkjoinpool"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "concurrency"
        },
        {
            id: "atomic-operations",
            question: "Describe atomic operations: get, set, lazySet, compareAndSet, weakCompareAndSet.",
            answer: "<p><strong>🔑 Lock-free, hardware-backed operations on java.util.concurrent.atomic classes</strong></p><ul><li>Classes like <code>AtomicInteger</code>, <code>AtomicLong</code>, <code>AtomicReference</code> provide operations that complete as a <strong>single indivisible step</strong> using CPU-level CAS (compare-and-swap) instructions instead of locks, avoiding blocking/contention overhead.</li><li><strong>get()</strong> — reads the current value with <code>volatile</code> read semantics (guaranteed to see the latest write from any thread).</li><li><strong>set(v)</strong> — writes a new value with <code>volatile</code> write semantics, immediately visible to other threads.</li><li><strong>lazySet(v)</strong> — writes eventually, without the immediate cross-thread visibility guarantee or a full memory fence — cheaper than <code>set()</code>, useful when you know no other thread needs to observe the value right away (e.g. nulling a reference before it becomes unreachable, to help GC).</li><li><strong>compareAndSet(expected, update)</strong> — atomically sets to <code>update</code> only if the current value equals <code>expected</code>; returns <code>true</code>/<code>false</code>. This is the building block of lock-free algorithms (retry loops).</li><li><strong>weakCompareAndSet</strong> (renamed <code>weakCompareAndSetPlain</code> in newer JDKs) — like <code>compareAndSet</code> but may <strong>spuriously fail</strong> even when the expected value matches, and provides weaker memory-ordering guarantees; it's allowed to be faster on some hardware, so it's meant to be used inside a retry loop, never for a one-shot check.</li></ul><p><strong>🎯 Interview tip:</strong> the classic CAS retry-loop pattern (<code>do { current = get(); } while (!compareAndSet(current, current + 1));</code>) is exactly how <code>AtomicInteger.incrementAndGet()</code> is implemented internally.</p>",
            referenceLinks: [{ title: "Oracle: AtomicInteger (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html" }],
            tags: ["atomic", "compareAndSet", "cas", "concurrency", "lock-free"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "CAS retry loop equivalent to incrementAndGet()",
                code: "AtomicInteger counter = new AtomicInteger(0);\n\n// What incrementAndGet() does internally, roughly:\nint prev, next;\ndo {\n    prev = counter.get();\n    next = prev + 1;\n} while (!counter.compareAndSet(prev, next)); // retries on contention\n\ncounter.lazySet(0); // reset without immediate cross-thread visibility guarantee"
            }],
            subsection: "concurrency"
        },
        {
            id: "try-catch-finally",
            question: "How does try, catch, finally work?",
            answer: "<p><strong>🔑 Structured exception handling with a guaranteed cleanup block</strong></p><ul><li><strong>try</strong> wraps code that might throw; if an exception occurs, execution jumps immediately to the first matching <strong>catch</strong> block (matched by exception type, checked top-to-bottom).</li><li><strong>catch(ExceptionType e)</strong> handles the exception — you can have multiple catch blocks for different types, or a multi-catch <code>catch (IOException | SQLException e)</code> (Java 7+) when handling is identical.</li><li><strong>finally</strong> runs <strong>no matter what</strong> — whether the try block completes normally, an exception was caught, an exception propagates uncaught, or the try block hits a <code>return</code>/<code>break</code>/<code>continue</code>. It's the standard place for cleanup (closing streams, releasing locks).</li><li><strong>Edge case</strong> — if <code>finally</code> itself contains a <code>return</code>, it <strong>silently overrides</strong> any return value or exception from the try/catch block — a well-known pitfall to avoid.</li><li><strong>try-with-resources</strong> (Java 7+) — for anything implementing <code>AutoCloseable</code>, the compiler automatically generates the equivalent of a <code>finally</code> block calling <code>close()</code>, in reverse declaration order, cleaner and less error-prone than manual <code>finally</code>.</li><li>The only case <code>finally</code> is skipped — the JVM exits via <code>System.exit()</code>, or the thread is killed, during the try/catch.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to trace through a snippet where <code>finally</code> has a <code>return</code> — it's a favorite &quot;what does this print&quot; interview trap.</p>",
            referenceLinks: [{ title: "Oracle: The try-with-resources Statement", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html" }],
            tags: ["try-catch-finally", "exceptions", "try-with-resources", "cleanup", "error-handling"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "try-catch-finally control flow",
                columns: 3,
                nodes: [
                    { label: "try block runs", type: "terminal" },
                    { label: "Exception thrown?", type: "decision" },
                    { label: "Matching catch runs" },
                    { label: "finally block runs", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2, label: "yes" },
                    { from: 1, to: 3, label: "no" },
                    { from: 2, to: 3 }
                ]
            },
            codeSnippets: [{
                language: "java",
                title: "try-with-resources vs manual finally",
                code: "// Manual cleanup\nFileInputStream fis = null;\ntry {\n    fis = new FileInputStream(\"data.txt\");\n    fis.read();\n} catch (IOException e) {\n    log(e);\n} finally {\n    if (fis != null) {\n        try { fis.close(); } catch (IOException ignored) {}\n    }\n}\n\n// try-with-resources: close() called automatically\ntry (FileInputStream in = new FileInputStream(\"data.txt\")) {\n    in.read();\n} catch (IOException e) {\n    log(e);\n}"
            }],
            subsection: "exceptions"
        },
        {
            id: "checked-vs-unchecked-exceptions",
            question: "What is the difference between Checked and Unchecked Exceptions?",
            answer: "<p><strong>🔑 Compiler-enforced recovery vs programmer-error signals</strong></p><table><thead><tr><th>Aspect</th><th>Checked</th><th>Unchecked</th></tr></thead><tbody><tr><td>Base class</td><td><code>Exception</code> (excluding <code>RuntimeException</code>)</td><td><code>RuntimeException</code> and <code>Error</code></td></tr><tr><td>Compiler enforcement</td><td>Must be caught or declared with <code>throws</code></td><td>No compiler requirement</td></tr><tr><td>Represents</td><td>Recoverable conditions outside program control (file missing, network down)</td><td>Programming errors / bugs (null deref, bad index, invalid argument)</td></tr><tr><td>Examples</td><td><code>IOException</code>, <code>SQLException</code>, <code>ParseException</code></td><td><code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>IllegalArgumentException</code></td></tr><tr><td>Typical handling</td><td>Caller genuinely expected to catch/recover</td><td>Usually indicates a bug to fix, not catch</td></tr></tbody></table><ul><li><strong>Errors</strong> (<code>OutOfMemoryError</code>, <code>StackOverflowError</code>) are a third category — serious JVM-level problems applications generally should not try to catch or recover from.</li><li><strong>Design debate</strong> — checked exceptions force explicit handling but can lead to boilerplate (empty catch blocks, exception wrapping); many modern APIs (Spring, most of <code>java.util.concurrent</code>) favor unchecked exceptions for this reason.</li></ul>",
            referenceLinks: [{ title: "Oracle: Unchecked Exceptions — The Controversy", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/runtime.html" }],
            tags: ["exceptions", "checked-exceptions", "unchecked-exceptions", "runtimeexception", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Checked requires handling, unchecked does not",
                code: "// Checked: must catch or declare throws\nvoid readFile(String path) throws IOException {\n    Files.readAllLines(Paths.get(path));\n}\n\n// Unchecked: compiler doesn't force anything\nvoid divide(int a, int b) {\n    int result = a / b; // may throw ArithmeticException, uncaught by compiler\n}"
            }],
            subsection: "exceptions"
        },
        {
            id: "shallow-vs-deep-copy",
            question: "Shallow vs Deep Copy in Java",
            answer: "<p><strong>🔑 Copy the top-level object only, or recursively copy everything it references</strong></p><table><thead><tr><th>Aspect</th><th>Shallow copy</th><th>Deep copy</th></tr></thead><tbody><tr><td>What's copied</td><td>The object itself; reference fields still point to the <strong>same</strong> nested objects</td><td>The object and a fresh, independent copy of every object it references, recursively</td></tr><tr><td>Default <code>Object.clone()</code></td><td>Shallow by default</td><td>Must override <code>clone()</code> (or use serialization/copy constructors) to go deep</td></tr><tr><td>Mutation risk</td><td>Mutating a nested object through the copy affects the original too</td><td>Fully independent — mutating the copy never affects the original</td></tr><tr><td>Cost</td><td>Cheap — just copies references</td><td>More expensive — allocates new objects for the whole graph</td></tr></tbody></table><ul><li><strong>Immutable nested fields</strong> (like <code>String</code>) make shallow copying safe for those fields specifically, since they can't be mutated in place anyway.</li><li><strong>Common deep-copy techniques</strong> — manually copy each mutable field recursively, use a copy constructor, or serialize/deserialize the object graph (slow but simple for complex graphs).</li></ul>",
            referenceLinks: [{ title: "Oracle: Object.clone() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#clone()" }],
            tags: ["shallow-copy", "deep-copy", "clone", "object-copying"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Shallow clone vs manual deep copy",
                code: "class Address { String city; }\nclass Person implements Cloneable {\n    String name;\n    Address address;\n\n    @Override\n    protected Person clone() throws CloneNotSupportedException {\n        return (Person) super.clone(); // shallow: address is SHARED\n    }\n\n    Person deepCopy() {\n        Person copy = new Person();\n        copy.name = this.name;\n        copy.address = new Address();\n        copy.address.city = this.address.city; // independent nested object\n        return copy;\n    }\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "serialization-deserialization",
            question: "Explain Serialization and Deserialization",
            answer: "<p><strong>🔑 Converting an object graph to bytes and back</strong></p><ul><li><strong>Serialization</strong> converts an object's state into a byte stream (via <code>ObjectOutputStream.writeObject()</code>) so it can be persisted to disk, sent over a network, or cached — the class must implement the marker interface <code>Serializable</code>.</li><li><strong>Deserialization</strong> reconstructs the object from that byte stream (<code>ObjectInputStream.readObject()</code>), <strong>without calling any constructor</strong> of the class — fields are restored directly from the stream.</li><li><strong>serialVersionUID</strong> — a version identifier that should be declared explicitly; if the sender's and receiver's class versions have mismatched UIDs, deserialization throws <code>InvalidClassException</code>, protecting against silently loading incompatible data.</li><li><strong>transient</strong> fields are skipped during serialization (see next question) — useful for derived data, caches, or non-serializable resources like <code>Thread</code> or file handles.</li><li><strong>Security concern</strong> — deserializing untrusted input is a well-known attack vector (arbitrary code execution via gadget chains), so modern guidance favors safer formats (JSON via Jackson/Gson, Protocol Buffers) over native Java serialization for external data.</li></ul><p><strong>🎯 Interview tip:</strong> mention that <code>Serializable</code> is a marker interface with zero methods — the actual work is done by the JVM via reflection over the object's fields.</p>",
            referenceLinks: [{ title: "Oracle: Java Object Serialization Specification", url: "https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/index.html" }],
            tags: ["serialization", "deserialization", "serializable", "transient", "java-io"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Serializing and deserializing an object",
                code: "class User implements Serializable {\n    private static final long serialVersionUID = 1L;\n    String name;\n    transient String sessionToken; // excluded from the stream\n\n    User(String name, String token) { this.name = name; this.sessionToken = token; }\n}\n\n// Write\ntry (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(\"user.ser\"))) {\n    out.writeObject(new User(\"Alice\", \"secret-token\"));\n}\n\n// Read\ntry (ObjectInputStream in = new ObjectInputStream(new FileInputStream(\"user.ser\"))) {\n    User u = (User) in.readObject();\n    System.out.println(u.sessionToken); // null -- transient was skipped\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "transient-modifier",
            question: "What is the transient modifier?",
            answer: "<p><strong>🔑 Excludes a field from default serialization</strong></p><ul><li><code>transient</code> marks an instance field to be <strong>skipped</strong> by the default Java serialization mechanism — when the object is deserialized, that field is reset to its type's default value (<code>null</code>, <code>0</code>, <code>false</code>).</li><li><strong>Typical use cases</strong> — sensitive data that shouldn't be persisted (passwords, tokens), derived/cacheable fields that can be recomputed, and non-serializable resource handles (<code>Thread</code>, <code>Socket</code>, <code>FileInputStream</code>) that would otherwise throw <code>NotSerializableException</code>.</li><li><strong>Only affects the built-in Java serialization mechanism</strong> — it has no effect on JSON libraries like Jackson or Gson unless those libraries are explicitly configured to respect it.</li><li>Can be combined with custom <code>writeObject()</code>/<code>readObject()</code> methods to manually serialize a transient field in a controlled or encrypted form instead of skipping it entirely.</li></ul>",
            referenceLinks: [{ title: "Oracle: Java Object Serialization Specification", url: "https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/index.html" }],
            tags: ["transient", "serialization", "keywords", "java-io"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "others-java"
        },
        {
            id: "anonymous-classes",
            question: "What are anonymous classes?",
            answer: "<p><strong>🔑 A one-off class declared and instantiated inline, with no name</strong></p><ul><li>An <strong>anonymous class</strong> lets you define a class body and create a single instance of it in one expression — useful when you need a one-time implementation of an interface or a small override of an abstract/concrete class, without a separate named top-level or nested class.</li><li><strong>Syntax</strong> — <code>new SomeType() { ... method overrides ... }</code>; it implicitly extends <code>SomeType</code> (class or interface) and can override its methods or add new ones (though new members aren't accessible outside the anonymous class itself).</li><li><strong>Captures enclosing variables</strong> — can access local variables from the enclosing scope only if they are <code>final</code> or <em>effectively final</em> (never reassigned after initialization).</li><li><strong>Compiled artifact</strong> — the compiler generates a separate class file named like <code>Outer$1.class</code> for each anonymous class in a source file.</li><li><strong>Largely superseded</strong> for single-abstract-method (SAM) interfaces by <strong>lambda expressions</strong> (Java 8+), which are more concise and don't create a new <code>this</code> scope — but anonymous classes are still needed when overriding multiple methods or extending a concrete/abstract class.</li></ul><p><strong>🎯 Interview tip:</strong> know the difference in <code>this</code> binding — inside an anonymous class, <code>this</code> refers to the anonymous instance; inside a lambda, <code>this</code> refers to the enclosing instance.</p>",
            referenceLinks: [{ title: "Oracle: Anonymous Classes", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/anonymousclasses.html" }],
            tags: ["anonymous-classes", "lambdas", "oop", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Anonymous class vs lambda",
                code: "// Anonymous class implementing an interface\nComparator<String> byLength = new Comparator<String>() {\n    @Override\n    public int compare(String a, String b) {\n        return a.length() - b.length();\n    }\n};\n\n// Equivalent lambda (Java 8+, SAM interface only)\nComparator<String> byLengthLambda = (a, b) -> a.length() - b.length();\n\nbutton.setOnClickListener(new View.OnClickListener() { // still common in older Android code\n    @Override public void onClick(View v) { System.out.println(\"clicked\"); }\n});"
            }],
            subsection: "others-java"
        },
        {
            id: "equals-vs-double-equals",
            question: "What is the difference between == and .equals()?",
            answer: "<p><strong>🔑 Reference identity vs logical content equality</strong></p><table><thead><tr><th>Aspect</th><th><code>==</code></th><th><code>.equals()</code></th></tr></thead><tbody><tr><td>For primitives</td><td>Compares actual values</td><td>N/A (not applicable to primitives)</td></tr><tr><td>For objects</td><td>Compares <strong>reference identity</strong> — do both variables point to the exact same object in memory?</td><td>Compares whatever the class defines as <strong>logical equality</strong> (content)</td></tr><tr><td>Default behavior</td><td>N/A</td><td><code>Object.equals()</code> defaults to <code>==</code> unless overridden</td></tr><tr><td>Overridable?</td><td>No, fixed language operator</td><td>Yes — classes like <code>String</code>, <code>Integer</code>, and your own classes commonly override it</td></tr></tbody></table><ul><li><strong>Strings specifically</strong> — <code>==</code> on two <code>String</code> objects only returns <code>true</code> if they're the same pooled/interned instance; <code>.equals()</code> always compares character content correctly, which is why string comparisons should always use <code>.equals()</code>.</li><li>If you override <code>equals()</code>, you are contractually required to also override <code>hashCode()</code> consistently (see the next question) or break hash-based collections.</li></ul>",
            referenceLinks: [{ title: "Oracle: Object.equals() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)" }],
            tags: ["equals", "double-equals", "reference-equality", "strings", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "== vs equals() on Strings and custom objects",
                code: "String a = new String(\"hi\");\nString b = new String(\"hi\");\nSystem.out.println(a == b);       // false: different objects\nSystem.out.println(a.equals(b));  // true: same content\n\nclass Point {\n    int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n    @Override public boolean equals(Object o) {\n        if (!(o instanceof Point)) return false;\n        Point p = (Point) o;\n        return x == p.x && y == p.y;\n    }\n}\nSystem.out.println(new Point(1,2).equals(new Point(1,2))); // true, content compared"
            }],
            subsection: "others-java"
        },
        {
            id: "hashcode-and-equals",
            question: "What is hashCode() and equals() used for?",
            answer: "<p><strong>🔑 Together they define logical equality and let objects work correctly as hash-based keys</strong></p><ul><li><strong>equals()</strong> defines when two objects are considered logically equal; <strong>hashCode()</strong> returns an <code>int</code> used to place an object into a bucket in hash-based collections (<code>HashMap</code>, <code>HashSet</code>, <code>Hashtable</code>).</li><li><strong>The contract (must hold)</strong>: (1) if <code>a.equals(b)</code> is <code>true</code>, then <code>a.hashCode() == b.hashCode()</code> must also be <code>true</code>; (2) equal hash codes do <strong>not</strong> imply equal objects (hash collisions are expected and handled); (3) both methods must be <strong>consistent</strong> across calls as long as the object's relevant fields don't change.</li><li><strong>Why it matters</strong> — a <code>HashMap</code> first uses <code>hashCode()</code> to jump to the right bucket, then uses <code>equals()</code> to find the exact matching key within that bucket. Overriding one without the other breaks lookups: two &quot;equal&quot; objects could land in different buckets and never be found.</li><li><strong>Best practice</strong> — use <code>Objects.equals()</code> and <code>Objects.hash()</code> (or an IDE/Lombok-generated implementation, or a Kotlin <code>data class</code>) to derive both consistently from the same set of significant fields.</li><li><strong>Immutability tip</strong> — avoid using mutable fields in <code>hashCode()</code> for objects stored as <code>HashMap</code> keys; mutating the field after insertion can make the entry unfindable (it hashes to a different bucket than where it was stored).</li></ul><p><strong>🎯 Interview tip:</strong> this pairs perfectly with the previous question — always mention the equals/hashCode contract when discussing either one.</p>",
            referenceLinks: [{ title: "Oracle: Object.hashCode() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#hashCode()" }],
            tags: ["hashcode", "equals", "hashmap", "contract", "collections"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Consistent equals/hashCode implementation",
                code: "import java.util.Objects;\n\nclass Point {\n    final int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof Point)) return false;\n        Point p = (Point) o;\n        return x == p.x && y == p.y;\n    }\n\n    @Override public int hashCode() {\n        return Objects.hash(x, y); // derived from the same fields as equals()\n    }\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "final-finally-finalize",
            question: "What are final, finally, and finalize?",
            answer: "<p><strong>🔑 Three unrelated keywords/methods that share a name prefix, not a purpose</strong></p><table><thead><tr><th></th><th><code>final</code></th><th><code>finally</code></th><th><code>finalize()</code></th></tr></thead><tbody><tr><td>Kind</td><td>Modifier keyword</td><td>Block in try/catch</td><td>Method on <code>Object</code></td></tr><tr><td>Applies to</td><td>Classes, methods, variables</td><td>Exception handling blocks</td><td>Any object, before GC reclaims it</td></tr><tr><td>Meaning</td><td>Class: can't be subclassed. Method: can't be overridden. Variable: can't be reassigned after init</td><td>Code that always runs after try/catch, for cleanup</td><td>Called by GC before reclaiming an unreachable object — historically for last-chance cleanup</td></tr><tr><td>Status</td><td>Actively used</td><td>Actively used (though try-with-resources often preferred)</td><td><strong>Deprecated since Java 9</strong>, should not be used</td></tr></tbody></table><ul><li><code>final</code> on a variable makes the <em>reference</em> unreassignable, not the referenced object immutable — <code>final List&lt;String&gt; list = ...</code> still allows <code>list.add(...)</code>.</li><li><code>finalize()</code> is unreliable — the JVM gives no guarantee it will ever run promptly (or at all), it can hurt GC performance, and it's deprecated in favor of <code>try-with-resources</code> and <code>java.lang.ref.Cleaner</code>.</li></ul>",
            referenceLinks: [{ title: "Oracle: Object.finalize() (Java SE 17, deprecated)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#finalize()" }],
            tags: ["final", "finally", "finalize", "keywords", "gc"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: "others-java"
        },
        {
            id: "static-keyword",
            question: "What does the static keyword mean in Java?",
            answer: "<p><strong>🔑 Belongs to the class itself, not to any instance</strong></p><ul><li><strong>static field</strong> — a single shared copy exists per class (not per instance), stored in the class's runtime area and initialized once when the class is loaded.</li><li><strong>static method</strong> — callable via the class name without creating an instance (<code>MyClass.method()</code>); cannot access instance (non-static) fields/methods directly since there's no implicit <code>this</code>.</li><li><strong>static block</strong> — runs once, in source order, when the class is first loaded by the JVM classloader; used for one-time static field initialization that needs more than a simple expression.</li><li><strong>static nested class</strong> — a nested class that doesn't hold an implicit reference to an outer instance, unlike a non-static inner class; can be instantiated without an outer instance (<code>new Outer.Nested()</code>).</li><li><strong>static import</strong> — imports static members so they can be used unqualified (e.g. <code>import static java.lang.Math.PI;</code>).</li><li>Common uses — constants (<code>public static final</code>), utility/helper methods (<code>Math.max()</code>, <code>Collections.sort()</code>), and factory methods.</li></ul>",
            referenceLinks: [{ title: "Oracle: Understanding Class Members", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html" }],
            tags: ["static", "keywords", "class-members", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "static field, method, block and nested class",
                code: "class Config {\n    static final String APP_NAME; // shared across all instances\n\n    static { // runs once at class-load time\n        APP_NAME = loadFromManifest();\n    }\n\n    static String loadFromManifest() { return \"DroidDeck\"; } // no 'this' available\n\n    static class Builder { // static nested class -- no outer instance needed\n        Config build() { return new Config(); }\n    }\n}\n\nnew Config.Builder().build();"
            }],
            subsection: "others-java"
        },
        {
            id: "reflection-in-java",
            question: "Explain Reflection in Java",
            answer: "<p><strong>🔑 Inspecting and manipulating classes, methods and fields at runtime</strong></p><ul><li><strong>Reflection</strong> (<code>java.lang.reflect</code>) lets code examine and modify the structure and behavior of classes, interfaces, fields, and methods <strong>at runtime</strong>, even without compile-time knowledge of the exact type — starting from a <code>Class&lt;?&gt;</code> object obtained via <code>obj.getClass()</code>, <code>MyClass.class</code>, or <code>Class.forName(name)</code>.</li><li><strong>Capabilities</strong> — enumerate a class's methods/fields/constructors, invoke a method by name (<code>Method.invoke()</code>), read/write a field even if <code>private</code> (via <code>setAccessible(true)</code>), and instantiate objects dynamically.</li><li><strong>Real-world uses</strong> — dependency injection frameworks (Spring, Dagger's annotation processing has largely replaced runtime reflection but earlier DI relied on it), ORMs mapping database columns to fields (Hibernate), JSON libraries (Gson/Jackson) populating POJOs, JUnit discovering <code>@Test</code> methods, and IDE auto-complete/debuggers.</li><li><strong>Trade-offs</strong> — reflective calls are significantly <strong>slower</strong> than direct calls (no JIT inlining, extra security checks), bypass compile-time type safety, and can break encapsulation by accessing <code>private</code> members, which is a security and maintainability concern.</li><li><strong>Android specifics</strong> — heavy reflection use is discouraged since it defeats R8/ProGuard optimization and code shrinking unless explicit keep rules are added, and it's slower on resource-constrained devices.</li></ul><p><strong>🎯 Interview tip:</strong> know a concrete example — Gson using reflection to read a POJO's fields and construct JSON, or JUnit scanning for <code>@Test</code>-annotated methods.</p>",
            referenceLinks: [{ title: "Oracle: The Reflection API", url: "https://docs.oracle.com/javase/tutorial/reflect/index.html" }],
            tags: ["reflection", "runtime", "annotations", "frameworks"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Inspecting and invoking via reflection",
                code: "Class<?> clazz = Class.forName(\"com.example.User\");\nObject user = clazz.getDeclaredConstructor().newInstance();\n\nField nameField = clazz.getDeclaredField(\"name\");\nnameField.setAccessible(true); // bypass private access\nnameField.set(user, \"Alice\");\n\nMethod greet = clazz.getMethod(\"greet\");\nString result = (String) greet.invoke(user); // dynamic invocation"
            }],
            subsection: "others-java"
        },
        {
            id: "stringbuffer-vs-stringbuilder",
            question: "What is the difference between StringBuffer and StringBuilder?",
            answer: "<p><strong>🔑 Same mutable-string API, different thread-safety guarantees</strong></p><table><thead><tr><th>Aspect</th><th>StringBuffer</th><th>StringBuilder</th></tr></thead><tbody><tr><td>Thread safety</td><td>Thread-safe — methods are <code>synchronized</code></td><td>Not thread-safe — no synchronization</td></tr><tr><td>Performance</td><td>Slower due to lock acquisition overhead</td><td>Faster — no locking cost</td></tr><tr><td>Introduced</td><td>Java 1.0</td><td>Java 1.5, added as the unsynchronized alternative</td></tr><tr><td>API</td><td>Identical (<code>append</code>, <code>insert</code>, <code>delete</code>, <code>reverse</code>, <code>toString</code>)</td><td>Identical</td></tr><tr><td>When to use</td><td>Shared mutable string built across multiple threads</td><td>Single-threaded string building (the vast majority of cases, e.g. loop concatenation)</td></tr></tbody></table><ul><li>Both are <strong>mutable</strong>, unlike <code>String</code> — <code>append()</code> modifies an internal resizable <code>char[]</code>/<code>byte[]</code> buffer in place instead of allocating a new object each time, making them efficient for repeated concatenation.</li><li><strong>Default choice</strong> — use <code>StringBuilder</code> unless you specifically need cross-thread safety on the same buffer instance; that's rare enough that <code>StringBuffer</code> is largely legacy today.</li></ul>",
            referenceLinks: [{ title: "Oracle: StringBuilder (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StringBuilder.html" }],
            tags: ["stringbuffer", "stringbuilder", "strings", "thread-safety", "mutability"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Efficient string building with StringBuilder",
                code: "StringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 1000; i++) {\n    sb.append(i).append(\",\"); // mutates one buffer, O(n) overall\n}\nString result = sb.toString();\n\n// vs the O(n^2) anti-pattern:\nString bad = \"\";\nfor (int i = 0; i < 1000; i++) {\n    bad += i + \",\"; // allocates a new String every iteration\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "dependency-injection-in-java",
            question: "What is Dependency Injection?",
            answer: "<p><strong>🔑 Supplying an object's dependencies from outside instead of letting it construct them itself</strong></p><ul><li><strong>Dependency Injection (DI)</strong> is a technique implementing the Dependency Inversion Principle — a class declares what it needs (via constructor, field, or setter parameters) and an external party (caller, framework/IoC container) supplies concrete implementations, instead of the class instantiating its own dependencies with <code>new</code>.</li><li><strong>Three common forms</strong> — <strong>constructor injection</strong> (preferred — dependencies are required and immutable, enables <code>final</code> fields), <strong>setter injection</strong> (optional/reconfigurable dependencies), and <strong>field injection</strong> (least testable — hides dependencies, common in older annotation-based frameworks).</li><li><strong>Frameworks</strong> — on Android, <strong>Dagger</strong>/<strong>Hilt</strong> generate DI wiring at compile time (no runtime reflection cost); Spring in backend Java typically wires beans via reflection/annotations at startup.</li><li><strong>Benefit</strong> — swapping a real <code>UserRepository</code> for a fake/mock in unit tests becomes trivial, since the class never hardcodes which implementation it uses.</li><li><strong>DI vs Service Locator</strong> — DI pushes dependencies <em>in</em> explicitly; a Service Locator has the class pull dependencies <em>out</em> of a global registry, which is generally considered an anti-pattern since dependencies become hidden.</li></ul><p><strong>🎯 Interview tip:</strong> tie this back to SOLID — DI is the standard mechanism for satisfying the Dependency Inversion Principle in real code.</p>",
            referenceLinks: [{ title: "Android Developers: Dependency injection", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["dependency-injection", "di", "dagger", "hilt", "solid"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Constructor injection vs self-instantiation",
                code: "// Without DI: hard to test, tightly coupled\nclass UserServiceBad {\n    private final UserRepository repo = new MySqlUserRepository(); // hardcoded\n}\n\n// With DI: dependency supplied from outside\nclass UserService {\n    private final UserRepository repo;\n    UserService(UserRepository repo) { this.repo = repo; } // injected\n}\n\n// In tests:\nUserService service = new UserService(new FakeUserRepository());"
            }],
            subsection: "others-java"
        },
        {
            id: "marker-interface-in-java",
            question: "What is a marker interface in Java?",
            answer: "<p><strong>🔑 An empty interface used purely as a runtime type tag</strong></p><ul><li>A <strong>marker interface</strong> declares <strong>no methods or fields</strong> — its only purpose is to mark implementing classes with a piece of metadata that code can check via <code>instanceof</code> at runtime.</li><li><strong>Standard JDK examples</strong> — <code>Serializable</code> (tells the JVM this object may be serialized), <code>Cloneable</code> (enables <code>Object.clone()</code> to work instead of throwing <code>CloneNotSupportedException</code>), <code>RandomAccess</code> (tells algorithms a <code>List</code> supports fast random-access indexing, e.g. <code>ArrayList</code> vs <code>LinkedList</code>).</li><li><strong>How it's used</strong> — framework code does <code>if (obj instanceof Serializable)</code> to decide whether to allow an operation, since there's no method to call — the type itself is the signal.</li><li><strong>Modern alternative</strong> — since Java 5, <strong>annotations</strong> (e.g. a custom <code>@Entity</code>) are generally preferred over marker interfaces because they can carry additional metadata (parameters) and be applied to more targets (fields, methods), not just types.</li></ul>",
            referenceLinks: [{ title: "Oracle: Serializable (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Serializable.html" }],
            tags: ["marker-interface", "serializable", "cloneable", "annotations", "interfaces"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Marker interface check via instanceof",
                code: "class Report implements Serializable { /* no methods added */ }\n\nvoid persist(Object obj) {\n    if (obj instanceof Serializable) {\n        // safe to hand off to ObjectOutputStream\n    } else {\n        throw new IllegalArgumentException(\"Not serializable\");\n    }\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "comparable-vs-comparator",
            question: "What is the difference between Comparable and Comparator?",
            answer: "<p><strong>🔑 One natural ordering defined by the class itself vs unlimited external orderings</strong></p><table><thead><tr><th>Aspect</th><th>Comparable</th><th>Comparator</th></tr></thead><tbody><tr><td>Package</td><td><code>java.lang</code></td><td><code>java.util</code></td></tr><tr><td>Method</td><td><code>int compareTo(T other)</code></td><td><code>int compare(T a, T b)</code></td></tr><tr><td>Implemented by</td><td>The class being compared, defining its own natural order</td><td>A separate class/lambda, external to the type being compared</td></tr><tr><td>How many orderings</td><td>Exactly one — the &quot;natural order&quot;</td><td>Unlimited — define as many comparators as needed (by name, by age, reversed, ...)</td></tr><tr><td>Used by</td><td><code>Collections.sort(list)</code>, <code>TreeSet</code>/<code>TreeMap</code> with no explicit comparator</td><td><code>Collections.sort(list, comparator)</code>, <code>list.sort(comparator)</code>, <code>Stream.sorted(comparator)</code></td></tr></tbody></table><ul><li>Implement <code>Comparable</code> when there's one obvious default ordering for a type (e.g. <code>Integer</code> sorts numerically); use <code>Comparator</code> for alternate or ad-hoc orderings without modifying the class.</li><li>Java 8+ makes building comparators concise via <code>Comparator.comparing(...)</code>, chainable with <code>.thenComparing(...)</code> and <code>.reversed()</code>.</li></ul>",
            referenceLinks: [{ title: "Oracle: Comparator (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Comparator.html" }],
            tags: ["comparable", "comparator", "sorting", "collections"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Comparable natural order vs Comparator custom order",
                code: "class Person implements Comparable<Person> {\n    String name;\n    int age;\n    Person(String name, int age) { this.name = name; this.age = age; }\n\n    @Override public int compareTo(Person other) { // natural order: by age\n        return Integer.compare(this.age, other.age);\n    }\n}\n\nList<Person> people = new ArrayList<>();\nCollections.sort(people); // uses Comparable (age)\n\npeople.sort(Comparator.comparing((Person p) -> p.name) // Comparator: by name\n                       .thenComparing(p -> p.age));"
            }],
            subsection: "others-java"
        },
        {
            id: "enum-in-java",
            question: "What is an enum in Java?",
            answer: "<p><strong>🔑 A type-safe, fixed set of named constants that is really a special class</strong></p><ul><li>An <strong>enum</strong> defines a fixed set of constant instances of a type — declared with <code>enum</code> instead of <code>class</code> — giving compile-time type safety that plain <code>int</code> or <code>String</code> constants don't (the compiler rejects any value outside the defined set).</li><li><strong>It's a real class under the hood</strong> — implicitly extends <code>java.lang.Enum</code>, can have fields, constructors (implicitly <code>private</code>), methods, and even <strong>per-constant method bodies</strong> for constant-specific behavior.</li><li><strong>Built-in capabilities</strong> — <code>values()</code> returns all constants in declaration order, <code>valueOf(String)</code> parses a constant by name (throws <code>IllegalArgumentException</code> if not found), <code>ordinal()</code> gives its declaration-order index, and enums work naturally in a <code>switch</code> statement.</li><li><strong>Collections support</strong> — <code>EnumMap</code> and <code>EnumSet</code> are highly optimized (array-backed) collections designed specifically for enum keys/elements.</li><li><strong>Singleton pattern</strong> — a single-constant enum (<code>enum Singleton { INSTANCE; }</code>) is considered the safest way to implement a Singleton in Java, since it's inherently serialization-safe and reflection-attack-resistant.</li></ul><p><strong>🎯 Interview tip:</strong> mention the single-constant-enum singleton trick — it's a favorite &quot;did you know&quot; follow-up.</p>",
            referenceLinks: [{ title: "Oracle: Enum Types", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html" }],
            tags: ["enum", "type-safety", "constants", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Enum with fields, constructor and per-constant behavior",
                code: "enum Operation {\n    ADD { public int apply(int a, int b) { return a + b; } },\n    SUBTRACT { public int apply(int a, int b) { return a - b; } };\n\n    public abstract int apply(int a, int b);\n}\n\nenum Planet {\n    MERCURY(3.3e23), EARTH(5.9e24);\n\n    private final double mass; // fields allowed\n    Planet(double mass) { this.mass = mass; } // implicitly private constructor\n    double getMass() { return mass; }\n}\n\nSystem.out.println(Operation.ADD.apply(2, 3)); // 5"
            }],
            subsection: "others-java"
        },
        {
            id: "autoboxing-and-unboxing",
            question: "What is Autoboxing and Unboxing in Java?",
            answer: "<p><strong>🔑 Automatic conversion between primitives and their wrapper objects</strong></p><ul><li><strong>Autoboxing</strong> — the compiler automatically converts a primitive value into its corresponding wrapper object where an object is required, e.g. assigning an <code>int</code> to an <code>Integer</code> variable, or adding an <code>int</code> to a <code>List&lt;Integer&gt;</code>.</li><li><strong>Unboxing</strong> — the reverse: automatically extracting the primitive value from a wrapper object, e.g. using an <code>Integer</code> in an arithmetic expression or an <code>if</code> condition expecting a <code>boolean</code>.</li><li><strong>Why it exists</strong> — generics and collections only work with objects (<code>List&lt;int&gt;</code> is illegal), so autoboxing lets you write natural-looking code like <code>list.add(5)</code> without manually calling <code>Integer.valueOf(5)</code>.</li><li><strong>Performance pitfall</strong> — boxing/unboxing inside tight loops (e.g. <code>Long sum = 0L; for (...) sum += i;</code>) creates a new wrapper object on every iteration, which is far slower than using the primitive directly.</li><li><strong>NPE pitfall</strong> — unboxing a <code>null</code> wrapper (e.g. a <code>Map</code> lookup that returned <code>null</code>, then used in arithmetic) throws <code>NullPointerException</code> at the unboxing point, which can be non-obvious in generated bytecode.</li><li><strong>Integer caching interacts with this</strong> — autoboxed values in the range -128..127 reuse cached <code>Integer</code> instances (see the Integer caching question), which affects <code>==</code> comparisons.</li></ul>",
            referenceLinks: [{ title: "Oracle: Autoboxing and Unboxing", url: "https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html" }],
            tags: ["autoboxing", "unboxing", "wrapper-classes", "primitives", "performance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Autoboxing performance pitfall",
                code: "// Autoboxing/unboxing happening implicitly\nList<Integer> list = new ArrayList<>();\nlist.add(5); // autobox: int -> Integer\nint x = list.get(0); // unbox: Integer -> int\n\n// Performance trap: boxing on every iteration\nLong sum = 0L;\nfor (long i = 0; i < 1_000_000; i++) {\n    sum += i; // unboxes sum, adds, reboxes -- allocates each time\n}\n\n// Fix: use the primitive directly\nlong fastSum = 0L;\nfor (long i = 0; i < 1_000_000; i++) {\n    fastSum += i; // no boxing\n}"
            }],
            subsection: "others-java"
        },
        {
            id: "varargs-in-java",
            question: "What are varargs in Java?",
            answer: "<p><strong>🔑 A method parameter that accepts zero or more arguments as an array</strong></p><ul><li><strong>Varargs</strong> (<code>Type... name</code>) let a method accept a variable number of arguments of the same type without the caller having to wrap them in an explicit array — introduced in Java 5.</li><li><strong>Under the hood</strong> — the compiler treats a varargs parameter as an array (<code>Type[]</code>); callers can pass individual arguments (<code>sum(1, 2, 3)</code>), an existing array (<code>sum(new int[]{1,2,3})</code>), or nothing at all (<code>sum()</code>, which passes a zero-length array).</li><li><strong>Rules</strong> — a method can have at most one varargs parameter, and it must be the <strong>last</strong> parameter in the signature.</li><li><strong>Overload resolution</strong> — the compiler prefers an exact-match non-varargs overload over a varargs one if both are applicable, and prefers a more specific varargs match over a boxing/widening one.</li><li><strong>Well-known JDK examples</strong> — <code>String.format(String fmt, Object... args)</code>, <code>List.of(E... elements)</code>, <code>Arrays.asList(T... a)</code>.</li><li><strong>Pitfall</strong> — mixing generics with varargs (<code>List&lt;String&gt;... lists</code>) can produce &quot;heap pollution&quot; compiler warnings, since arrays and generics interact unsafely due to type erasure.</li></ul>",
            referenceLinks: [{ title: "Oracle: Arbitrary Number of Arguments", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html#varargs" }],
            tags: ["varargs", "methods", "arrays", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Varargs method definition and calls",
                code: "static int sum(int... numbers) { // compiled as int[] numbers\n    int total = 0;\n    for (int n : numbers) total += n;\n    return total;\n}\n\nsum();          // 0 -- empty array\nsum(1, 2, 3);   // 6 -- individual args\nsum(new int[]{4, 5}); // 9 -- existing array passed directly"
            }],
            subsection: "others-java"
        },
        {
            id: "integer-caching-wrapper-classes",
            question: "Why does Java cache Integer values from -128 to 127 (Integer caching)?",
            answer: "<p><strong>🔑 A memory/performance optimization for the most commonly used small values</strong></p><ul><li><strong>Integer caching</strong> — <code>Integer.valueOf(int)</code> (which autoboxing calls internally) maintains a private static cache of <code>Integer</code> objects for values <strong>-128 to 127</strong> and returns a <strong>shared cached instance</strong> for values in that range instead of allocating a new object every time.</li><li><strong>Why this range</strong> — small integers are used extremely frequently (loop counters, small collection sizes), so reusing them avoids a huge number of redundant tiny object allocations; -128..127 was chosen as a reasonable default and is <strong>guaranteed</strong> by the JVM spec, though the upper bound can be raised via <code>-XX:AutoBoxCacheMax</code>.</li><li><strong>Other wrapper classes</strong> cache similarly — <code>Byte</code>, <code>Short</code>, <code>Long</code> cache -128..127; <code>Character</code> caches 0..127; <code>Boolean</code> caches both <code>TRUE</code>/<code>FALSE</code>.</li><li><strong>The == trap</strong> — because of caching, <code>Integer a = 100; Integer b = 100; a == b</code> is <code>true</code> (same cached object), but <code>Integer a = 200; Integer b = 200; a == b</code> is <code>false</code> (outside the cache, two distinct objects) — a classic interview gotcha showing why <code>==</code> should never be used to compare wrapper objects.</li><li><code>new Integer(100)</code> always bypasses the cache and allocates a fresh object (this constructor is deprecated since Java 9 for exactly this reason).</li></ul><p><strong>🎯 Interview tip:</strong> this question is almost always paired with a &quot;what does this code print&quot; snippet comparing two boxed values with <code>==</code> just outside and just inside the cache range.</p>",
            referenceLinks: [{ title: "Oracle: Integer.valueOf() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html#valueOf(int)" }],
            tags: ["integer-caching", "wrapper-classes", "autoboxing", "equals-vs-double-equals"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Integer cache boundary trap",
                code: "Integer a = 100;\nInteger b = 100;\nSystem.out.println(a == b); // true -- both from the -128..127 cache\n\nInteger c = 200;\nInteger d = 200;\nSystem.out.println(c == d); // false -- outside cache, distinct objects\nSystem.out.println(c.equals(d)); // true -- always compare wrappers with equals()"
            }],
            subsection: "others-java"
        },
        {
            id: "diamond-problem-default-methods",
            question: "How does Java resolve the Diamond Problem with default methods in interfaces?",
            answer: "<p><strong>🔑 The most specific interface wins; true ties must be resolved explicitly</strong></p><ul><li>Since Java 8, interfaces can have <code>default</code> methods with a body — if a class implements two interfaces that each declare a <strong>default method with the same signature</strong>, the compiler must decide which one applies (the classic &quot;diamond problem&quot;).</li><li><strong>Rule 1 — most specific interface wins</strong> — if one interface extends the other, the more specific (sub-)interface's default implementation is used automatically, no ambiguity.</li><li><strong>Rule 2 — unrelated interfaces cause a compile error</strong> — if two <strong>unrelated</strong> interfaces both declare the same default method, the implementing class gets a <strong>compile-time error</strong> (not a silent runtime choice) and must override the method itself to resolve the conflict.</li><li><strong>Resolving explicitly</strong> — inside the override, you can pick a specific parent's implementation using <code>InterfaceName.super.methodName()</code> syntax, or provide entirely new logic.</li><li><strong>Why this is safer than C++</strong> — because Java interfaces (still) carry no instance state, the ambiguity is limited to behavior, not duplicated data fields, and the compiler forces the developer to make the choice explicit rather than picking silently.</li></ul>",
            referenceLinks: [{ title: "Oracle: Default Methods", url: "https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html" }],
            tags: ["diamond-problem", "default-methods", "interfaces", "java8"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Resolving a default method conflict explicitly",
                code: "interface A {\n    default String greet() { return \"Hello from A\"; }\n}\n\ninterface B {\n    default String greet() { return \"Hello from B\"; }\n}\n\nclass C implements A, B {\n    @Override\n    public String greet() { // required -- compiler can't choose for you\n        return A.super.greet() + \" and \" + B.super.greet();\n    }\n}"
            }],
            subsection: "others-java"
        }
    ]
};
