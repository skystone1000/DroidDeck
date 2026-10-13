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
            importance: "must-know",
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
                code: "class User {\n    final String email;\n    User(String email) { this.email = email; }\n}\n\n// Before: one class with three unrelated reasons to change.\nclass UserManagerBad {\n    void handle(User u) {\n        System.out.println(\"UserManagerBad: validating, saving and emailing \" + u.email);\n    }\n}\n\n// After: each class has exactly one reason to change.\nclass UserValidator {\n    boolean isValid(User u) {\n        return u.email != null && u.email.contains(\"@\");\n    }\n}\n\nclass UserRepository {\n    void save(User u) { System.out.println(\"UserRepository: saved \" + u.email); }\n}\n\nclass WelcomeEmailSender {\n    void send(User u) { System.out.println(\"WelcomeEmailSender: emailed \" + u.email); }\n}\n\npublic class SingleResponsibility {\n    public static void main(String[] args) {\n        UserValidator validator = new UserValidator();\n        UserRepository repository = new UserRepository();\n        WelcomeEmailSender mailer = new WelcomeEmailSender();\n\n        for (User u : new User[] { new User(\"aditya@example.com\"), new User(\"not-an-email\") }) {\n            if (!validator.isValid(u)) {\n                System.out.println(\"rejected: \" + u.email);\n                continue;\n            }\n            repository.save(u);\n            mailer.send(u);\n        }\n\n        new UserManagerBad().handle(new User(\"aditya@example.com\"));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "UserRepository: saved aditya@example.com",
                        "WelcomeEmailSender: emailed aditya@example.com",
                        "rejected: not-an-email",
                        "UserManagerBad: validating, saving and emailing aditya@example.com"
                    ],
                    explain: "<p>The split version does the same work as the last line does on its own — the output is not the argument here, the shape is. Three classes ran, each doing one thing, and the calling code decided the order.</p><p>The value shows up when something changes. A new validation rule touches <code>UserValidator</code> only. Swapping SMTP for a queue touches <code>WelcomeEmailSender</code> only. In <code>UserManagerBad</code> all three changes land in the same class, and each one risks the other two — which is what \"one reason to change\" actually means.</p>"
                }
            }],
            subsection: "solid-principles"
        },
        {
            id: "open-closed-principle",
            importance: "should-know",
            question: "O in SOLID: Open/Closed Principle",
            answer: "<p><strong>🔑 Open for extension, closed for modification</strong></p><ul><li>A well-designed module should let you <strong>add new behavior without editing existing, tested code</strong> — you extend it, you don't patch it.</li><li><strong>Achieved through abstraction</strong> — depend on an interface or abstract base class, then add new behavior by writing a new implementation, not by inserting new <code>if</code>/<code>switch</code> branches into a shared method.</li><li><strong>Classic example</strong> — an <code>AreaCalculator</code> that takes a <code>Shape</code> interface with <code>area()</code>. Adding a <code>Triangle</code> means writing a new class, not touching <code>AreaCalculator</code> or existing shape classes.</li><li><strong>Why it matters</strong> — untouched code carries no regression risk; every class that already passed QA stays passed.</li><li><strong>Common enabler</strong> — the Strategy or Template Method design pattern, and dependency injection of interfaces rather than concrete types.</li></ul><p><strong>🎯 Interview tip:</strong> if you keep adding <code>else if</code> blocks to handle a new type, that code violates OCP — polymorphism should be doing that dispatch instead.</p>",
            referenceLinks: [{ title: "Oracle: Interfaces and Inheritance", url: "https://docs.oracle.com/javase/tutorial/java/IandI/index.html" }],
            tags: ["solid", "open-closed", "ocp", "polymorphism", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Adding a shape without touching AreaCalculator",
                code: "import java.util.List;\n\ninterface Shape {\n    double area();\n}\n\nclass Circle implements Shape {\n    private final double radius;\n    Circle(double radius) { this.radius = radius; }\n    public double area() { return Math.PI * radius * radius; }\n}\n\nclass Rectangle implements Shape {\n    private final double w, h;\n    Rectangle(double w, double h) { this.w = w; this.h = h; }\n    public double area() { return w * h; }\n}\n\nclass Triangle implements Shape {          // new type, zero edits elsewhere\n    private final double base, height;\n    Triangle(double base, double height) { this.base = base; this.height = height; }\n    public double area() { return 0.5 * base * height; }\n}\n\nclass AreaCalculator {                     // closed for modification\n    double total(List<Shape> shapes) {\n        return shapes.stream().mapToDouble(Shape::area).sum();\n    }\n}\n\npublic class OpenClosed {\n    public static void main(String[] args) {\n        AreaCalculator calculator = new AreaCalculator();\n\n        List<Shape> shapes = List.of(new Circle(1), new Rectangle(2, 3));\n        System.out.println(\"two shapes   = \" + calculator.total(shapes));\n\n        // Extending the system means adding a class, not editing AreaCalculator.\n        List<Shape> more = List.of(new Circle(1), new Rectangle(2, 3), new Triangle(4, 5));\n        System.out.println(\"three shapes = \" + calculator.total(more));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "two shapes   = 9.141592653589793",
                        "three shapes = 19.141592653589793"
                    ],
                    explain: "<p>The second total includes a <code>Triangle</code>, and <code>AreaCalculator</code> was not edited to make that happen — it was not even recompiled against the new type. It calls <code>area()</code> on whatever it is handed, and each shape supplies its own.</p><p>That is what \"open for extension, closed for modification\" buys: a new requirement becomes a new file rather than a new branch in an existing <code>if</code>. The version this replaces would have needed a fresh <code>instanceof</code> arm inside the calculator, which is a change to code that already worked.</p>"
                }
            }],
            subsection: "solid-principles"
        },
        {
            id: "liskov-substitution-principle",
            importance: "should-know",
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
            importance: "should-know",
            question: "I in SOLID: Interface Segregation Principle",
            answer: "<p><strong>🔑 Many small, role-specific interfaces beat one fat interface</strong></p><ul><li><strong>ISP</strong> says <strong>clients should not be forced to depend on methods they never use</strong> — a class implementing an interface shouldn't have to provide dummy or exception-throwing implementations for methods irrelevant to it.</li><li><strong>Classic violation</strong> — a single <code>Worker</code> interface with <code>work()</code> and <code>eat()</code>. A <code>RobotWorker</code> implementing it is forced to write a meaningless <code>eat()</code> method.</li><li><strong>Fix</strong> — split into narrower interfaces, <code>Workable</code> and <code>Eatable</code>; <code>HumanWorker</code> implements both, <code>RobotWorker</code> implements only <code>Workable</code>.</li><li><strong>Java 8+ nuance</strong> — <code>default</code> methods let you add behavior to an interface without breaking existing implementers, but that's an implementation-compatibility tool, not a substitute for good interface design; ISP is still about keeping the <em>contract</em> role-specific.</li><li><strong>Benefit</strong> — smaller interfaces are easier to mock in tests and make dependencies explicit at the type level.</li></ul>",
            referenceLinks: [{ title: "Oracle: Creating Interfaces", url: "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html" }],
            tags: ["solid", "interface-segregation", "isp", "interfaces", "design-principles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Splitting a fat interface so nobody implements what they cannot do",
                code: "// Before: one fat interface forces every implementer to have both\ninterface Worker {\n    void work();\n    void eat();\n}\n\n// After: role-specific interfaces\ninterface Workable { void work(); }\ninterface Eatable  { void eat(); }\n\nclass HumanWorker implements Workable, Eatable {\n    public void work() { System.out.println(\"HumanWorker: working\"); }\n    public void eat()  { System.out.println(\"HumanWorker: eating lunch\"); }\n}\n\nclass RobotWorker implements Workable {       // no forced, meaningless eat()\n    public void work() { System.out.println(\"RobotWorker: welding\"); }\n}\n\npublic class InterfaceSegregation {\n    static void runShift(Workable w) { w.work(); }\n    static void lunchBreak(Eatable e) { e.eat(); }\n\n    public static void main(String[] args) {\n        HumanWorker human = new HumanWorker();\n        RobotWorker robot = new RobotWorker();\n\n        runShift(human);\n        runShift(robot);      // the robot qualifies for this\n        lunchBreak(human);    // and is not even eligible for this\n\n        System.out.println(\"robot is Workable? \" + (robot instanceof Workable));\n        System.out.println(\"robot is Eatable?  \" + (robot instanceof Eatable));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "HumanWorker: working",
                        "RobotWorker: welding",
                        "HumanWorker: eating lunch",
                        "robot is Workable? true",
                        "robot is Eatable?  false"
                    ],
                    explain: "<p>The last two lines are the result worth having. <code>RobotWorker</code> is a <code>Workable</code> and is <em>not</em> an <code>Eatable</code>, so <code>lunchBreak(robot)</code> is not a runtime failure or an empty method — it does not compile.</p><p>Under the original fat <code>Worker</code> interface the robot would have been forced to supply an <code>eat()</code> it could only implement by throwing or doing nothing, and the mistake would have surfaced at runtime instead. Splitting the interface moved the error to the compiler.</p>"
                }
            }],
            subsection: "solid-principles"
        },
        {
            id: "dependency-inversion-principle",
            importance: "must-know",
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
                title: "High-level policy depending on an abstraction",
                code: "class User {\n    final String id;\n    User(String id) { this.id = id; }\n}\n\n// The abstraction the high-level policy depends on.\ninterface UserRepository {\n    User findById(String id);\n}\n\nclass MySqlUserRepository implements UserRepository {\n    public User findById(String id) {\n        System.out.println(\"  MySqlUserRepository: SELECT ... WHERE id=\" + id);\n        return new User(id);\n    }\n}\n\nclass InMemoryUserRepository implements UserRepository {\n    public User findById(String id) {\n        System.out.println(\"  InMemoryUserRepository: map lookup for \" + id);\n        return new User(id);\n    }\n}\n\nclass UserService {                       // high-level policy\n    private final UserRepository repository;\n\n    UserService(UserRepository repository) {   // depends on the interface only\n        this.repository = repository;\n    }\n\n    User getUser(String id) { return repository.findById(id); }\n}\n\npublic class DependencyInversion {\n    public static void main(String[] args) {\n        System.out.println(\"with MySQL:\");\n        UserService production = new UserService(new MySqlUserRepository());\n        System.out.println(\"  got user \" + production.getUser(\"42\").id);\n\n        System.out.println(\"with in-memory:\");\n        UserService test = new UserService(new InMemoryUserRepository());\n        System.out.println(\"  got user \" + test.getUser(\"42\").id);\n\n        System.out.println(\"UserService source changed between those runs? false\");\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "with MySQL:",
                        "  MySqlUserRepository: SELECT ... WHERE id=42",
                        "  got user 42",
                        "with in-memory:",
                        "  InMemoryUserRepository: map lookup for 42",
                        "  got user 42",
                        "UserService source changed between those runs? false"
                    ],
                    explain: "<p>Two completely different storage mechanisms ran through the same <code>UserService</code>, which was not modified, recompiled or told which one it had. It names only the <code>UserRepository</code> interface.</p><p>That is the inversion. Ordinarily the high-level class would reach down and construct <code>MySqlUserRepository</code>, making the policy depend on the detail. Here both depend on the interface, and the interface belongs with the policy — so the arrow that used to point down now points up from the database code.</p>"
                }
            }],
            subsection: "solid-principles"
        },
        {
            id: "explain-oop-concepts",
            importance: "must-know",
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
            importance: "must-know",
            question: "What are the differences between abstract classes and interfaces?",
            answer: "<p><strong>🔑 Both enable abstraction, but with different rules</strong></p><table><thead><tr><th>Aspect</th><th>Abstract class</th><th>Interface</th></tr></thead><tbody><tr><td>Inheritance</td><td>A class can extend only one abstract class</td><td>A class can implement many interfaces</td></tr><tr><td>State</td><td>Can hold instance fields with any access modifier</td><td>Fields are implicitly <code>public static final</code> (constants only)</td></tr><tr><td>Constructors</td><td>Can have constructors, called via subclass <code>super()</code></td><td>No constructors</td></tr><tr><td>Method bodies</td><td>Can mix abstract and fully implemented methods</td><td>Can have <code>default</code> and <code>static</code> methods (Java 8+) plus abstract ones</td></tr><tr><td>Access modifiers</td><td>Methods can be <code>public</code>, <code>protected</code>, <code>private</code></td><td>Methods are implicitly <code>public</code> (unless <code>private</code> helper, Java 9+)</td></tr><tr><td>Use case</td><td>Share common state/code among closely related types</td><td>Define a capability/contract unrelated types can adopt</td></tr></tbody></table><ul><li><strong>Diamond problem</strong> — Java forbids multiple class inheritance to avoid ambiguous state, but multiple interface implementation is fine since (pre-default-methods) interfaces carried no state; default method conflicts must be resolved explicitly by the implementing class.</li><li><strong>Rule of thumb</strong> — use an abstract class when subclasses share implementation and an IS-A relationship; use an interface when unrelated classes share a capability (CAN-DO relationship), e.g. <code>Comparable</code>, <code>Serializable</code>.</li></ul><p><strong>🎯 Interview tip:</strong> since Java 8's <code>default</code> methods, the line has blurred — the sharpest remaining distinction is that interfaces still cannot hold instance state.</p>",
            referenceLinks: [{ title: "Oracle: Abstract Methods and Classes", url: "https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html" }],
            tags: ["abstract-class", "interface", "oop", "abstraction", "default-methods"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Shared state and implementation, versus a capability contract",
                code: "abstract class Animal {                 // shares state and partial implementation\n    protected final String name;\n    Animal(String name) { this.name = name; }\n    void breathe() { System.out.println(name + \" breathes\"); }   // concrete, inherited\n    abstract void makeSound();                                   // must be implemented\n}\n\ninterface Flyable {                     // a capability, with no state of its own\n    void fly();\n    default void land() { System.out.println(\"landing\"); }       // Java 8+\n}\n\nclass Eagle extends Animal implements Flyable {\n    Eagle(String name) { super(name); }\n    void makeSound() { System.out.println(name + \" screeches\"); }\n    public void fly() { System.out.println(name + \" soars\"); }\n}\n\nclass Penguin extends Animal {          // same base class, no flying\n    Penguin(String name) { super(name); }\n    void makeSound() { System.out.println(name + \" brays\"); }\n}\n\npublic class AbstractVsInterface {\n    public static void main(String[] args) {\n        Eagle eagle = new Eagle(\"Eagle\");\n        Penguin penguin = new Penguin(\"Penguin\");\n\n        eagle.breathe();      // inherited implementation, not reimplemented\n        eagle.makeSound();\n        eagle.fly();\n        eagle.land();         // default method, never written in Eagle\n\n        penguin.breathe();\n        penguin.makeSound();\n\n        System.out.println(\"penguin is Animal? \" + (penguin instanceof Animal));\n        System.out.println(\"penguin is Flyable? \" + (penguin instanceof Flyable));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Eagle breathes",
                        "Eagle screeches",
                        "Eagle soars",
                        "landing",
                        "Penguin breathes",
                        "Penguin brays",
                        "penguin is Animal? true",
                        "penguin is Flyable? false"
                    ],
                    explain: "<p><code>Eagle</code> never wrote <code>breathe()</code> or <code>land()</code> and both ran. They come from opposite places, and that difference is the answer to this question.</p><p><code>breathe()</code> is inherited from the abstract class, and it uses <code>name</code> — <strong>state the base class owns</strong>. An interface could not have done that; interfaces hold no instance fields. <code>land()</code> is a default method on the interface: shared behaviour with nothing to remember.</p><p><code>Penguin</code> is the reason the two are separate at all. It is every bit an <code>Animal</code> and not a <code>Flyable</code>. A class has exactly one superclass, so the abstract class models <em>what a thing is</em>; it can implement any number of interfaces, so those model <em>what it can do</em>.</p>"
                }
            }],
            subsection: "oop"
        },
        {
            id: "method-overloading-vs-overriding",
            importance: "must-know",
            question: "What is the difference between method overloading and overriding?",
            answer: "<p><strong>🔑 Compile-time choice vs runtime dispatch</strong></p><table><thead><tr><th>Aspect</th><th>Overloading</th><th>Overriding</th></tr></thead><tbody><tr><td>Where</td><td>Same class (or subclass adding new signatures)</td><td>Subclass redefines a superclass/interface method</td></tr><tr><td>Signature</td><td>Same name, different parameter list</td><td>Same name and same parameter list</td></tr><tr><td>Binding</td><td>Resolved at compile time (static binding)</td><td>Resolved at runtime via dynamic dispatch (vtable lookup)</td></tr><tr><td>Return type</td><td>Can differ freely</td><td>Must be same or a covariant subtype</td></tr><tr><td>Access modifier</td><td>No restriction</td><td>Cannot be more restrictive than the overridden method</td></tr><tr><td>Exceptions</td><td>No restriction</td><td>Cannot throw new/broader checked exceptions</td></tr><tr><td>Annotation</td><td>None required</td><td><code>@Override</code> (recommended, catches signature mistakes at compile time)</td></tr></tbody></table><ul><li><strong>Overloading</strong> is also called compile-time / static polymorphism because the compiler picks the exact method to call based on argument types at the call site.</li><li><strong>Overriding</strong> is runtime / dynamic polymorphism — the JVM looks up the actual object's class at runtime to decide which method body runs.</li><li><code>static</code>, <code>private</code>, and <code>final</code> methods cannot be overridden (they're resolved statically), but they can still be overloaded.</li></ul><p><strong>🎯 Interview tip:</strong> a common trap question is calling an overloaded method with <code>null</code> — the compiler picks the most specific applicable overload, which can surprise people.</p>",
            referenceLinks: [{ title: "Oracle: Overriding and Hiding Methods", url: "https://docs.oracle.com/javase/tutorial/java/IandI/override.html" }],
            tags: ["overloading", "overriding", "polymorphism", "static-binding", "dynamic-dispatch"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Overloads chosen at compile time, overrides at runtime",
                code: "class Printer {\n    void print(String s) { System.out.println(\"String overload: \" + s); }   // overload 1\n    void print(int i)    { System.out.println(\"int overload: \" + i); }      // overload 2\n    void print(Object o) { System.out.println(\"Object overload: \" + o); }   // overload 3\n}\n\nclass Animal {\n    void speak() { System.out.println(\"...\"); }\n}\n\nclass Dog extends Animal {\n    @Override\n    void speak() { System.out.println(\"Woof\"); }   // same signature, runtime dispatch\n}\n\npublic class OverloadingVsOverriding {\n    public static void main(String[] args) {\n        Printer p = new Printer();\n        p.print(\"hello\");   // picks the String overload\n        p.print(42);        // picks the int overload\n        p.print(3.14);      // no double overload, so it boxes and picks Object\n\n        Animal a = new Dog();\n        a.speak();          // overriding: decided by the object, at runtime\n\n        Object o = \"I am really a String\";\n        p.print(o);         // overloading: decided by the variable, at compile time\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "String overload: hello",
                        "int overload: 42",
                        "Object overload: 3.14",
                        "Woof",
                        "Object overload: I am really a String"
                    ],
                    explain: "<p>The last two lines are the whole distinction, and they point opposite ways.</p><p><code>a.speak()</code> printed <strong>Woof</strong> even though <code>a</code> is declared <code>Animal</code> — <strong>overriding is resolved at runtime, by the object</strong>. Then <code>p.print(o)</code> chose the <code>Object</code> overload even though <code>o</code> holds a <code>String</code> — <strong>overloading is resolved at compile time, by the declared type</strong>. The compiler picked that method before the program ever ran, and nothing at runtime revisits it.</p><p>Line three is the same rule with a different cause: there is no <code>print(double)</code>, so <code>3.14</code> was boxed to <code>Double</code> and matched <code>Object</code>.</p>"
                }
            }],
            subsection: "oop"
        },
        {
            id: "string-pool-in-java",
            importance: "should-know",
            question: "Explain String Pool in Java",
            answer: "<p><strong>🔑 A cache of interned String literals</strong></p><ul><li>The <strong>String Pool</strong> (intern pool) is a special memory region — part of the heap since Java 7 (previously in PermGen) — where the JVM stores <strong>one canonical copy</strong> of each distinct string literal.</li><li><strong>How literals get pooled</strong> — writing <code>String s = \"hello\";</code> makes the JVM check the pool first; if <code>\"hello\"</code> already exists it reuses that reference instead of allocating a new object.</li><li><code>new String(\"hello\")</code> <strong>bypasses the pool</strong> — it always allocates a fresh object on the heap, even though the literal <code>\"hello\"</code> inside it is still pooled separately.</li><li><code>String.intern()</code> manually adds a string to the pool (or returns the existing pooled reference if already present), letting you opt a heap-allocated string back into pooling.</li><li><strong>Why it's safe</strong> — pooling relies entirely on <strong>String immutability</strong>; if strings were mutable, one holder mutating a shared pooled instance would corrupt every other reference to it.</li><li><strong>Consequence</strong> — <code>==</code> between two pooled literals is <code>true</code> (same reference), but between a literal and a <code>new String(...)</code> it's <code>false</code> even though <code>.equals()</code> is <code>true</code>.</li></ul><p><strong>🎯 Interview tip:</strong> the pool is a memory optimization, not a correctness guarantee — always compare string <em>content</em> with <code>.equals()</code>, never <code>==</code>.</p>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html#intern()" }],
            tags: ["string-pool", "intern", "immutability", "heap", "strings"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "The string pool, ==, and intern()",
                code: "public class StringPool {\n    public static void main(String[] args) {\n        String a = \"hello\";\n        String b = \"hello\";\n        System.out.println(\"a == b            \" + (a == b));  // pooled literal, same object\n\n        String c = new String(\"hello\");\n        System.out.println(\"a == c            \" + (a == c));       // distinct heap object\n        System.out.println(\"a.equals(c)       \" + a.equals(c));    // same content\n\n        String d = c.intern();   // find (or place) this content in the pool\n        System.out.println(\"a == c.intern()   \" + (a == d));\n\n        // Concatenating constants is done by the compiler, so this is pooled too.\n        String e = \"hel\" + \"lo\";\n        System.out.println(\"a == \\\"hel\\\"+\\\"lo\\\"    \" + (a == e));\n\n        // Concatenating a variable is not, so this one is built at runtime.\n        String part = \"hel\";\n        String f = part + \"lo\";\n        System.out.println(\"a == part+\\\"lo\\\"    \" + (a == f));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "a == b            true",
                        "a == c            false",
                        "a.equals(c)       true",
                        "a == c.intern()   true",
                        "a == \"hel\"+\"lo\"    true",
                        "a == part+\"lo\"    false"
                    ],
                    explain: "<p>Identical literals are the same object because the compiler puts one copy in the pool and points both names at it. <code>new String(\"hello\")</code> is an explicit instruction to allocate anyway, so it is a different object holding the same characters — hence <code>==</code> false, <code>equals</code> true.</p><p>The last two lines are the ones that catch people out. <code>\"hel\" + \"lo\"</code> is folded by the <em>compiler</em> into the literal <code>\"hello\"</code>, so it is pooled and <code>==</code> succeeds. Put one half in a variable and the concatenation has to happen at runtime, which builds a fresh object and <code>==</code> fails. Same characters, same expression shape, different answer — which is the argument for never using <code>==</code> on strings.</p>"
                }
            }],
            subsection: "oop"
        },
        {
            id: "access-modifiers-in-java",
            importance: "should-know",
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
            importance: "should-know",
            question: "Can an Interface implement another Interface?",
            answer: "<p><strong>🔑 No — interfaces extend, they don't implement</strong></p><ul><li>An interface <strong>cannot implement</strong> another interface in Java; only a <code>class</code> uses the <code>implements</code> keyword.</li><li>An interface can, however, <strong>extend one or more other interfaces</strong> using <code>extends</code> — this is Java's form of multiple inheritance of type (contracts only, no state).</li><li>A class that <code>implements</code> a child interface must provide implementations for <strong>every abstract method</strong> declared in it and all of its parent interfaces.</li><li><strong>Why the terminology matters</strong> — <code>implements</code> implies providing a concrete method body, which interfaces (before <code>default</code> methods) never did; <code>extends</code> implies inheriting/adding to a contract.</li></ul><p><strong>🎯 Interview tip:</strong> this is a quick terminology check interviewers use to see if you understand that Java interfaces model contracts, not behavior, at the type level.</p>",
            referenceLinks: [{ title: "Oracle: Creating Interfaces", url: "https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html" }],
            tags: ["interfaces", "extends", "implements", "multiple-inheritance", "oop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "An interface extends interfaces; a class implements them",
                code: "interface Readable {\n    String read();\n}\n\ninterface Writable {\n    void write(String data);\n}\n\n// An interface EXTENDS other interfaces — it never implements them.\ninterface ReadWritable extends Readable, Writable {\n    default boolean isEmpty() { return read().isEmpty(); }\n}\n\nclass MemoryChannel implements ReadWritable {   // a class IMPLEMENTS\n    private String buffer = \"\";\n    public String read() { return buffer; }\n    public void write(String data) { buffer = data; }\n}\n\npublic class InterfaceExtends {\n    public static void main(String[] args) {\n        MemoryChannel channel = new MemoryChannel();\n        System.out.println(\"empty at first?  \" + channel.isEmpty());\n\n        channel.write(\"payload\");\n        System.out.println(\"read()           \" + channel.read());\n        System.out.println(\"empty now?       \" + channel.isEmpty());\n\n        // One object satisfies all three interfaces at once.\n        System.out.println(\"is Readable?     \" + (channel instanceof Readable));\n        System.out.println(\"is Writable?     \" + (channel instanceof Writable));\n        System.out.println(\"is ReadWritable? \" + (channel instanceof ReadWritable));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "empty at first?  true",
                        "read()           payload",
                        "empty now?       false",
                        "is Readable?     true",
                        "is Writable?     true",
                        "is ReadWritable? true"
                    ],
                    explain: "<p><code>ReadWritable</code> uses <code>extends</code>, not <code>implements</code> — an interface has nothing to implement, only a contract to widen. It can extend several at once, which is the multiple inheritance Java allows because no state comes along with it.</p><p>The last three lines show what <code>MemoryChannel</code> got for one <code>implements</code>: it satisfies all three types. And <code>isEmpty()</code> is a default method calling <code>read()</code>, an abstract method it has no implementation for — an interface may build on its own contract.</p>"
                }
            }],
            subsection: "oop"
        },
        {
            id: "polymorphism-and-inheritance",
            importance: "should-know",
            question: "What is Polymorphism? What about Inheritance?",
            answer: "<p><strong>🔑 &quot;Many forms&quot; through shared type, specialization through extension</strong></p><ul><li><strong>Polymorphism</strong> lets objects of different classes be treated through a common supertype/interface reference while each responds to the same call in its own way. Java has two kinds:<ul><li><strong>Compile-time (static)</strong> — method overloading; the compiler picks the exact method based on argument types.</li><li><strong>Runtime (dynamic)</strong> — method overriding; the JVM dispatches to the actual object's implementation via the virtual method table, decided only at runtime.</li></ul></li><li><strong>Inheritance</strong> establishes an IS-A relationship — a subclass (<code>extends</code>) reuses and can override the fields/methods of a superclass, and gains access to inherited <code>protected</code>/<code>public</code> members.</li><li><strong>Java restriction</strong> — single inheritance of classes only (one <code>extends</code>), but multiple interface implementation, avoiding the classic diamond-of-state problem.</li><li><strong>super</strong> keyword accesses the immediate superclass's constructor (<code>super(...)</code>, must be first statement) or an overridden method's original implementation (<code>super.method()</code>).</li><li><strong>Relationship between the two</strong> — inheritance is the structural mechanism; runtime polymorphism is the behavior it enables, since a variable of the supertype can hold any subtype instance and dispatch correctly.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to explain <em>why</em> a subclass reference stored in a supertype variable still calls the overridden method — it's because dispatch is based on the object's actual runtime type, not the reference's compile-time type.</p>",
            referenceLinks: [{ title: "Oracle: Inheritance", url: "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html" }],
            tags: ["polymorphism", "inheritance", "oop", "overriding", "super"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "One call site, three method bodies",
                code: "import java.util.List;\n\nclass Shape {\n    double area() { return 0; }\n}\n\nclass Circle extends Shape {\n    private final double r;\n    Circle(double r) { this.r = r; }\n    @Override double area() { return Math.PI * r * r; }\n}\n\nclass Square extends Shape {\n    private final double side;\n    Square(double side) { this.side = side; }\n    @Override double area() { return side * side; }\n}\n\npublic class Polymorphism {\n    public static void main(String[] args) {\n        List<Shape> shapes = List.of(new Shape(), new Circle(2), new Square(3));\n\n        for (Shape s : shapes) {\n            // One call site, three different method bodies — chosen by the object.\n            System.out.println(s.getClass().getSimpleName() + \".area() = \" + s.area());\n        }\n\n        // The variable is a Shape. The object is a Circle. The object wins.\n        Shape declaredAsShape = new Circle(2);\n        System.out.println(\"declared Shape, runtime \" + declaredAsShape.getClass().getSimpleName());\n        System.out.println(\"area() gives            \" + declaredAsShape.area());\n        System.out.println(\"Shape's own area() is   \" + new Shape().area());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Shape.area() = 0.0",
                        "Circle.area() = 12.566370614359172",
                        "Square.area() = 9.0",
                        "declared Shape, runtime Circle",
                        "area() gives            12.566370614359172",
                        "Shape's own area() is   0.0"
                    ],
                    explain: "<p>The loop has one <code>s.area()</code> in it and three different methods ran. Nothing in the loop knows which types exist, so adding a fourth shape would not change it.</p><p>The last three lines separate the two things people conflate. The <em>variable</em> is a <code>Shape</code>; the <em>object</em> is a <code>Circle</code>. Java calls the object's method, not the variable's — <code>12.57</code>, not the <code>0.0</code> that <code>Shape.area()</code> would have returned. That is dynamic dispatch, and it is decided fresh on every call.</p>"
                }
            }],
            subsection: "oop"
        },
        {
            id: "arrays-vs-arraylists",
            importance: "must-know",
            question: "Arrays vs ArrayLists",
            answer: "<p><strong>🔑 Fixed-size raw storage vs a resizable, generic collection</strong></p><table><thead><tr><th>Aspect</th><th>Array</th><th>ArrayList</th></tr></thead><tbody><tr><td>Size</td><td>Fixed at creation, cannot grow/shrink</td><td>Dynamically resizes (backing array doubles-ish on growth)</td></tr><tr><td>Type</td><td>Can hold primitives directly (<code>int[]</code>)</td><td>Only holds objects — primitives are autoboxed (<code>Integer</code>)</td></tr><tr><td>API</td><td>Minimal — <code>.length</code>, indexing</td><td>Rich — <code>add</code>, <code>remove</code>, <code>contains</code>, streams, etc. via <code>List</code></td></tr><tr><td>Performance</td><td>Slightly faster, less memory overhead (no boxing, no capacity slack)</td><td>Small overhead per element (object header + boxing) and occasional resize cost</td></tr><tr><td>Multi-dimensional</td><td>Native support (<code>int[][]</code>)</td><td>Simulated via nested <code>List&lt;List&lt;T&gt;&gt;</code></td></tr></tbody></table><ul><li><strong>Under the hood</strong> — <code>ArrayList</code> is backed by an <code>Object[]</code> that's reallocated and copied (~1.5x growth) whenever capacity is exceeded, so <code>add()</code> is amortized O(1) but occasionally O(n).</li><li><strong>Random access</strong> — both are O(1) by index; that's the main reason to prefer either over a <code>LinkedList</code>.</li><li>Use a raw array when size is known and fixed and you want to avoid boxing overhead (e.g. numeric buffers); use <code>ArrayList</code> for everything else needing dynamic growth and the Collections API.</li></ul>",
            referenceLinks: [{ title: "Oracle: ArrayList (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html" }],
            tags: ["array", "arraylist", "collections", "generics", "autoboxing"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Fixed array against a growing list",
                code: "import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;\n\npublic class ArraysVsArrayList {\n    public static void main(String[] args) {\n        int[] fixed = new int[3];        // fixed size, primitives, no boxing\n        fixed[0] = 10;\n        System.out.println(\"array          = \" + Arrays.toString(fixed));\n        System.out.println(\"array length   = \" + fixed.length);\n\n        try {\n            fixed[3] = 40;               // no room, and no growing\n        } catch (ArrayIndexOutOfBoundsException e) {\n            System.out.println(\"fixed[3] = 40  -> \" + e.getClass().getSimpleName());\n        }\n\n        List<Integer> dynamic = new ArrayList<>();   // resizable, boxed Integers\n        dynamic.add(10);\n        dynamic.add(20);\n        dynamic.add(30);\n        System.out.println(\"list           = \" + dynamic);\n        System.out.println(\"list size      = \" + dynamic.size());\n\n        dynamic.remove(Integer.valueOf(10));   // by value\n        System.out.println(\"remove value 10 = \" + dynamic);\n\n        dynamic.remove(0);                     // by index\n        System.out.println(\"remove index 0  = \" + dynamic);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "array          = [10, 0, 0]",
                        "array length   = 3",
                        "fixed[3] = 40  -> ArrayIndexOutOfBoundsException",
                        "list           = [10, 20, 30]",
                        "list size      = 3",
                        "remove value 10 = [20, 30]",
                        "remove index 0  = [30]"
                    ],
                    explain: "<p>The first line shows something an <code>ArrayList</code> has no equivalent for: <code>new int[3]</code> already holds three <code>0</code>s. A primitive array is allocated full of default values and has a fixed <code>length</code>; the third line is what happens when you want a fourth slot.</p><p>The last two lines are the trap worth carrying away. <code>remove(Integer.valueOf(10))</code> removes the <strong>value</strong> and <code>remove(0)</code> removes the element at <strong>index</strong> 0. Both compile, they read almost identically, and they call different methods.</p>"
                }
            }],
            subsection: "collections-generics"
        },
        {
            id: "hashset-vs-treeset",
            importance: "should-know",
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
            importance: "should-know",
            question: "HashMap vs Set",
            answer: "<p><strong>🔑 Key-value pairs vs unique elements — and a Set is literally built on a Map</strong></p><ul><li><strong>HashMap&lt;K, V&gt;</strong> stores <strong>key-value associations</strong>; you look up a value by key. Keys are unique, values can repeat.</li><li><strong>HashSet&lt;E&gt;</strong> stores <strong>unique elements only</strong>, no associated value — and internally it <em>is</em> a <code>HashMap&lt;E, Object&gt;</code>, where every element becomes a map key and all values point to a single shared dummy sentinel object (historically named <code>PRESENT</code>).</li><li>Because of that, <code>HashSet.add(e)</code> is implemented as <code>map.put(e, PRESENT) == null</code> — it reuses all of <code>HashMap</code>'s hashing, bucket, and treeification logic.</li><li>Use a <code>Map</code> when you need to associate data with a key (e.g. <code>userId -&gt; User</code>); use a <code>Set</code> when you only care about membership/uniqueness (e.g. &quot;have I seen this ID before?&quot;).</li><li>Both rely on a correct <code>hashCode()</code>/<code>equals()</code> contract on the key/element type for correct bucket placement and lookup.</li></ul><p><strong>🎯 Interview tip:</strong> knowing that <code>HashSet</code> is a thin wrapper around <code>HashMap</code> is a strong signal you understand the collections framework's internal design, not just its public API.</p>",
            referenceLinks: [{ title: "Oracle: HashMap (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html" }],
            tags: ["hashmap", "hashset", "collections", "hashing", "map-vs-set"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "A HashSet is a HashMap with the values thrown away",
                code: "import java.util.HashMap;\nimport java.util.HashSet;\nimport java.util.Set;\n\n// Conceptually, java.util.HashSet does exactly this internally.\nclass MyHashSet<E> {\n    private static final Object PRESENT = new Object();\n    private final HashMap<E, Object> map = new HashMap<>();\n\n    boolean add(E e) {\n        return map.put(e, PRESENT) == null;   // null return means the key was new\n    }\n\n    boolean contains(E e) { return map.containsKey(e); }\n\n    int size() { return map.size(); }\n}\n\npublic class HashSetBackedByMap {\n    public static void main(String[] args) {\n        MyHashSet<String> mine = new MyHashSet<>();\n        System.out.println(\"add(\\\"a\\\") first time  \" + mine.add(\"a\"));\n        System.out.println(\"add(\\\"a\\\") again       \" + mine.add(\"a\"));\n        System.out.println(\"contains(\\\"a\\\")        \" + mine.contains(\"a\"));\n        System.out.println(\"size                 \" + mine.size());\n\n        // The real HashSet behaves identically, for the same reason.\n        Set<String> real = new HashSet<>();\n        System.out.println(\"HashSet add first    \" + real.add(\"a\"));\n        System.out.println(\"HashSet add again    \" + real.add(\"a\"));\n        System.out.println(\"HashSet size         \" + real.size());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "add(\"a\") first time  true",
                        "add(\"a\") again       false",
                        "contains(\"a\")        true",
                        "size                 1",
                        "HashSet add first    true",
                        "HashSet add again    false",
                        "HashSet size         1"
                    ],
                    explain: "<p>The hand-written set and the real <code>java.util.HashSet</code> print the same thing, because they are the same thing. A <code>HashSet</code> holds a <code>HashMap</code> and files every element as a <em>key</em>, with one shared dummy object as the value.</p><p>That is where <code>add</code>'s return value comes from: <code>map.put</code> returns the previous value for the key, so a <code>null</code> means nobody was there and the element is new. It also explains the properties people memorise separately — a set has no duplicates because a map has no duplicate keys, and lookup is <code>O(1)</code> for exactly the same reason.</p>"
                }
            }],
            subsection: "collections-generics"
        },
        {
            id: "generics-in-java",
            importance: "should-know",
            question: "Explain Generics in Java",
            answer: "<p><strong>🔑 Compile-time type safety for classes, interfaces and methods</strong></p><ul><li><strong>Generics</strong> let you parameterize a type (e.g. <code>List&lt;String&gt;</code>) so the compiler enforces type correctness at compile time instead of relying on unchecked casts at runtime.</li><li><strong>Type erasure</strong> — the JVM has no idea about generics at runtime; the compiler erases <code>List&lt;String&gt;</code> down to raw <code>List</code> and inserts the necessary casts, which is why you can't do <code>new T[]</code> or check <code>obj instanceof List&lt;String&gt;</code>.</li><li><strong>Bounded type parameters</strong> — <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> restricts <code>T</code> to types implementing <code>Comparable</code>, letting you call <code>compareTo</code> inside a generic method.</li><li><strong>Wildcards</strong> — <code>? extends T</code> (upper bound, read-only &quot;producer&quot;) and <code>? super T</code> (lower bound, write-only &quot;consumer&quot;) implement the PECS rule (Producer Extends, Consumer Super) for flexible API design.</li><li><strong>Generic methods</strong> can declare their own type parameter independent of the enclosing class, e.g. <code>static &lt;T&gt; List&lt;T&gt; singletonList(T item)</code>.</li><li><strong>Benefit</strong> — eliminates <code>ClassCastException</code> at runtime by catching type mismatches at compile time, and removes the need for manual casting when reading from collections.</li></ul><p><strong>🎯 Interview tip:</strong> be ready to explain why <code>List&lt;Object&gt;</code> is not a supertype of <code>List&lt;String&gt;</code> (generics are invariant) and how wildcards work around that.</p>",
            referenceLinks: [{ title: "Oracle: Generics", url: "https://docs.oracle.com/javase/tutorial/java/generics/index.html" }],
            tags: ["generics", "type-erasure", "wildcards", "bounded-types", "pecs"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Bounded types, PECS wildcards, and erasure",
                code: "import java.util.ArrayList;\nimport java.util.List;\n\npublic class GenericsInJava {\n\n    // Bounded type parameter: T must be comparable with itself.\n    static <T extends Comparable<T>> T max(List<T> list) {\n        T result = list.get(0);\n        for (T item : list) if (item.compareTo(result) > 0) result = item;\n        return result;\n    }\n\n    // PECS: Producer Extends, Consumer Super.\n    static void copy(List<? extends Number> source, List<? super Integer> dest) {\n        for (Number n : source) {      // source only produces\n            dest.add(n.intValue());    // dest only consumes\n        }\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"max of ints    = \" + max(List.of(3, 9, 2)));\n        System.out.println(\"max of strings = \" + max(List.of(\"pear\", \"apple\", \"fig\")));\n\n        List<Object> destination = new ArrayList<>();\n        copy(List.of(1.9, 2.5, 3.1), destination);   // List<Double> into List<Object>\n        System.out.println(\"copied         = \" + destination);\n\n        // Erasure: the type argument is gone by runtime.\n        List<String> strings = new ArrayList<>();\n        List<Integer> ints = new ArrayList<>();\n        System.out.println(\"same class?    \" + (strings.getClass() == ints.getClass()));\n        System.out.println(\"class is       \" + strings.getClass().getName());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "max of ints    = 9",
                        "max of strings = pear",
                        "copied         = [1, 2, 3]",
                        "same class?    true",
                        "class is       java.util.ArrayList"
                    ],
                    explain: "<p>One <code>max</code> served both <code>Integer</code> and <code>String</code>. The bound <code>T extends Comparable&lt;T&gt;</code> is what lets the method call <code>compareTo</code> at all — without it <code>T</code> is only an <code>Object</code> and the code does not compile.</p><p><code>copy</code> moved <code>Double</code>s into a <code>List&lt;Object&gt;</code>, which is PECS working: the source is <code>? extends Number</code> so it can be read from, the destination is <code>? super Integer</code> so it can be written to. The values print as <code>1, 2, 3</code> because <code>intValue()</code> truncates.</p><p>The last two lines are <strong>erasure</strong>. <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> are the same class at runtime — the type argument exists only for the compiler, which is why you cannot write <code>new T[]</code> or ask <code>instanceof List&lt;String&gt;</code>.</p>"
                }
            }],
            subsection: "collections-generics"
        },
        {
            id: "string-class-implementation-immutability",
            importance: "should-know",
            question: "How is String class implemented? Why was it made immutable?",
            answer: "<p><strong>🔑 A final class wrapping an internal char/byte array, immutable by design</strong></p><ul><li><strong>Implementation</strong> — <code>String</code> is declared <code>final</code> (cannot be subclassed) and internally wraps a <code>private final</code> array (<code>char[]</code> pre-Java 9, a compact <code>byte[]</code> with a coder flag from Java 9+ for Latin-1/UTF-16 storage). No public method ever mutates that array; operations like <code>substring()</code> or <code>concat()</code> return a <strong>new</strong> <code>String</code>.</li><li><strong>Security</strong> — strings are used for class names, file paths, network hosts, DB credentials; immutability prevents a downstream method from mutating a string after a security check (e.g. a class-loader or file-permission check) has validated it.</li><li><strong>String pool safety</strong> — pooling/interning is only correct if the shared instance can never change; a mutable pooled string would corrupt every other reference sharing it.</li><li><strong>Thread safety</strong> — immutable objects are inherently safe to share across threads without synchronization, since there's no mutable state to race on.</li><li><strong>Hashcode caching</strong> — because content can never change, <code>String</code> caches its <code>hashCode()</code> after first computation, making it a fast, safe key for <code>HashMap</code>/<code>HashSet</code>.</li><li><strong>Trade-off</strong> — heavy string concatenation in a loop creates many intermediate objects; use <code>StringBuilder</code> for that case instead.</li></ul><p><strong>🎯 Interview tip:</strong> tie immutability to three concrete payoffs — pool safety, thread safety, and safe hashcode caching — interviewers want the &quot;why&quot;, not just the &quot;what&quot;.</p>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html" }],
            tags: ["string", "immutability", "string-pool", "thread-safety", "hashcode"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Every String method returns a new object",
                code: "public class StringImmutability {\n    public static void main(String[] args) {\n        String original = \"hello\";\n        String upper = original.toUpperCase();   // returns a NEW object\n\n        System.out.println(\"original       \" + original);   // untouched\n        System.out.println(\"upper          \" + upper);\n        System.out.println(\"original==upper \" + (original == upper));\n\n        // Every \"modifying\" method is really a factory.\n        System.out.println(\"replace        \" + original.replace('l', 'L'));\n        System.out.println(\"substring      \" + original.substring(1, 3));\n        System.out.println(\"concat         \" + original.concat(\" there\"));\n        System.out.println(\"original still \" + original);\n\n        // Immutability is why a String is safe as a HashMap key: its hash\n        // cannot change after it has been filed under one.\n        System.out.println(\"hash before    \" + original.hashCode());\n        original.toUpperCase();\n        System.out.println(\"hash after     \" + original.hashCode());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "original       hello",
                        "upper          HELLO",
                        "original==upper false",
                        "replace        heLLo",
                        "substring      el",
                        "concat         hello there",
                        "original still hello",
                        "hash before    99162322",
                        "hash after     99162322"
                    ],
                    explain: "<p>Four different operations ran against <code>original</code> and it still says <code>hello</code>. None of these methods modifies anything — each builds and returns a new <code>String</code>, which is why the results have to be captured to be useful.</p><p>The last two lines are the payoff for putting up with that. Because the characters can never change, the hash code can never change either, so a <code>String</code> filed as a <code>HashMap</code> key stays findable forever. A mutable key that changed after insertion would be lost in the map — still there, unreachable.</p>"
                }
            }],
            subsection: "objects-primitives"
        },
        {
            id: "string-immutability-meaning",
            importance: "good-to-know",
            question: "What does it mean to say that a String is immutable?",
            answer: "<p><strong>🔑 Once created, a String's content can never change</strong></p><ul><li><strong>Immutable</strong> means no method on <code>String</code> can modify the character data of an existing instance — every apparent &quot;modification&quot; (<code>concat</code>, <code>replace</code>, <code>toUpperCase</code>, <code>trim</code>...) allocates and returns a <strong>brand-new</strong> <code>String</code> object.</li><li><strong>Common beginner bug</strong> — calling <code>str.toUpperCase();</code> without reassigning (<code>str = str.toUpperCase();</code>) discards the result; <code>str</code> itself never changed.</li><li><strong>Consequence for loops</strong> — repeated concatenation (<code>result += item</code>) in a loop creates a new object on every iteration, which is O(n²) overall; <code>StringBuilder.append()</code> mutates a resizable internal buffer instead and is O(n) overall.</li><li><strong>Reference vs content</strong> — a <code>final String</code> reference still can't be reassigned, but even a non-<code>final</code> <code>String</code> variable can only be pointed at a <em>different</em> object, never mutate the object it currently points to.</li></ul>",
            referenceLinks: [{ title: "Oracle: String (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html" }],
            tags: ["string", "immutability", "stringbuilder", "performance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "The discarded return value",
                code: "public class ImmutabilityTrap {\n    public static void main(String[] args) {\n        String s = \"abc\";\n\n        s.toUpperCase();                 // return value discarded — this is the bug\n        System.out.println(\"after s.toUpperCase();      \" + s);\n\n        s = s.toUpperCase();             // correct: reassign the reference\n        System.out.println(\"after s = s.toUpperCase();  \" + s);\n\n        // The same mistake, one step further along.\n        String padded = \"  trim me  \";\n        padded.trim();\n        System.out.println(\"after padded.trim();        [\" + padded + \"]\");\n        System.out.println(\"after padded = padded.trim()[\" + padded.trim() + \"]\");\n\n        // A StringBuilder does mutate, which is exactly the difference.\n        StringBuilder sb = new StringBuilder(\"abc\");\n        sb.append(\"def\");                // return value ignored, and it still worked\n        System.out.println(\"StringBuilder after append  \" + sb);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "after s.toUpperCase();      abc",
                        "after s = s.toUpperCase();  ABC",
                        "after padded.trim();        [  trim me  ]",
                        "after padded = padded.trim()[trim me]",
                        "StringBuilder after append  abcdef"
                    ],
                    explain: "<p><code>s.toUpperCase();</code> on its own line looks like a command and is not one. It computed <code>\"ABC\"</code>, returned it, and the value went nowhere. The variable never changed, the compiler had nothing to complain about, and the bug is invisible until something downstream reads the wrong value.</p><p>The last line is the contrast that makes it stick. <code>sb.append(\"def\")</code> also had its return value ignored and the <code>StringBuilder</code> changed anyway — because a <code>StringBuilder</code> really does mutate. Same-looking statement, opposite outcome, and the only difference is whether the type is immutable.</p>"
                }
            }],
            subsection: "objects-primitives"
        },
        {
            id: "eight-primitive-types",
            importance: "good-to-know",
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
            importance: "should-know",
            question: "What is the difference between Integer and int?",
            answer: "<p><strong>🔑 A primitive value vs a heap-allocated wrapper object</strong></p><table><thead><tr><th>Aspect</th><th>int</th><th>Integer</th></tr></thead><tbody><tr><td>Kind</td><td>Primitive type</td><td>Object (wraps an <code>int</code> field)</td></tr><tr><td>Default value</td><td>0</td><td><code>null</code></td></tr><tr><td>Storage</td><td>Stack (local var) / inline in object</td><td>Heap-allocated object with header overhead</td></tr><tr><td>Nullability</td><td>Cannot be <code>null</code></td><td>Can be <code>null</code> → risk of <code>NullPointerException</code> on unboxing</td></tr><tr><td>Usable in generics/collections</td><td>No (<code>List&lt;int&gt;</code> is illegal)</td><td>Yes (<code>List&lt;Integer&gt;</code>)</td></tr><tr><td>Comparison with <code>==</code></td><td>Compares value</td><td>Compares reference identity (except cached -128..127 via Integer cache)</td></tr><tr><td>Extra API</td><td>None</td><td><code>Integer.parseInt()</code>, <code>compareTo()</code>, <code>MAX_VALUE</code>, etc.</td></tr></tbody></table><ul><li><strong>Autoboxing/unboxing</strong> converts silently between them, but unboxing a <code>null Integer</code> (e.g. in an <code>if (someInteger == 5)</code> or arithmetic context) throws <code>NullPointerException</code>.</li><li>Prefer primitive <code>int</code> for local computation (cheaper, no boxing overhead); use <code>Integer</code> only where an object is required, such as generic collections or when representing &quot;no value&quot; via <code>null</code>.</li></ul>",
            referenceLinks: [{ title: "Oracle: Integer (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html" }],
            tags: ["integer", "int", "autoboxing", "wrapper-classes", "primitives"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Where Integer and int actually differ",
                code: "import java.util.HashMap;\nimport java.util.Map;\n\npublic class IntegerVsInt {\n    public static void main(String[] args) {\n        Integer boxed = null;          // a wrapper can be null\n        // int primitive = null;       // a primitive cannot — this would not compile\n\n        try {\n            int primitive = boxed;     // auto-unboxing calls boxed.intValue()\n            System.out.println(primitive);\n        } catch (NullPointerException e) {\n            System.out.println(\"unboxing null threw \" + e.getClass().getSimpleName());\n        }\n\n        Map<String, Integer> scores = new HashMap<>();\n        System.out.println(\"get(\\\"missing\\\")           = \" + scores.get(\"missing\"));\n\n        // The usual source of the NPE above: a map miss unboxed straight into an int.\n        int safe = scores.getOrDefault(\"missing\", 0);\n        System.out.println(\"getOrDefault(\\\"missing\\\",0) = \" + safe);\n\n        // The same difference shows up in array defaults.\n        int[] primitives = new int[1];\n        Integer[] wrappers = new Integer[1];\n        System.out.println(\"int[] default     = \" + primitives[0]);\n        System.out.println(\"Integer[] default = \" + wrappers[0]);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "unboxing null threw NullPointerException",
                        "get(\"missing\")           = null",
                        "getOrDefault(\"missing\",0) = 0",
                        "int[] default     = 0",
                        "Integer[] default = null"
                    ],
                    explain: "<p>Everything here follows from one fact: <code>Integer</code> is an object and can be <code>null</code>, <code>int</code> is a value and cannot.</p><p>The first line is the failure that fact causes in real code. Assigning a <code>null Integer</code> to an <code>int</code> compiles cleanly — the compiler quietly inserts <code>.intValue()</code> — and then throws at runtime. It is a <code>NullPointerException</code> on a line with no visible method call on it, which is why it is so often misread.</p><p>The map lines show where the <code>null</code> usually comes from: a lookup that missed. <code>getOrDefault</code> is the fix, because it never hands you a <code>null</code> to unbox.</p>"
                }
            }],
            subsection: "objects-primitives"
        },
        {
            id: "pass-by-reference-or-value",
            importance: "must-know",
            question: "Do objects get passed by reference or value in Java?",
            answer: "<p><strong>🔑 Java is always pass-by-value — even for objects</strong></p><ul><li>Java has <strong>no pass-by-reference</strong>. Every argument — primitive or object — is passed by <strong>copying its value</strong> into the method's parameter.</li><li>For an object argument, the <em>value being copied is the reference itself</em> (essentially a memory address/handle) — so the method receives a copy of the reference that points to the <strong>same</strong> underlying object.</li><li><strong>Consequence 1</strong> — mutating the object's internal state through the copied reference (e.g. <code>list.add(x)</code>, <code>obj.setName(...)</code>) <strong>is visible</strong> to the caller, because both references point at the same heap object.</li><li><strong>Consequence 2</strong> — reassigning the parameter itself (<code>param = new Foo()</code>) inside the method only repoints the local copy of the reference; the caller's original reference still points at the original object, unaffected.</li><li>This is why the precise phrasing matters: Java passes <strong>&quot;a copy of the reference&quot;</strong> by value, not the object by reference — true pass-by-reference (as in C++ <code>&amp;</code> parameters) would let the callee reassign the caller's variable itself.</li></ul><p><strong>🎯 Interview tip:</strong> give the classic demo — a method that does <code>person.setName(\"new\")</code> changes the caller's object, but a method that does <code>person = new Person(...)</code> does not — that single example proves the pass-by-value model.</p>",
            referenceLinks: [{ title: "Oracle: Passing Information to a Method or a Constructor", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html" }],
            tags: ["pass-by-value", "references", "method-arguments", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Java passes references by value",
                code: "class Box {\n    String label;\n}\n\npublic class PassByValue {\n\n    static void mutate(Box b) {\n        b.label = \"mutated\";      // follows the reference — the caller sees this\n    }\n\n    static void reassign(Box b) {\n        b = new Box();            // repoints this method's own copy of the reference\n        b.label = \"invisible\";    // and so the caller never sees it\n    }\n\n    static void bump(int n) {\n        n = n + 1;                // same story for primitives\n    }\n\n    public static void main(String[] args) {\n        Box box = new Box();\n        box.label = \"original\";\n\n        mutate(box);\n        System.out.println(\"after mutate(box)   : \" + box.label);\n\n        reassign(box);\n        System.out.println(\"after reassign(box) : \" + box.label);\n\n        int count = 1;\n        bump(count);\n        System.out.println(\"after bump(count)   : \" + count);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "after mutate(box)   : mutated",
                        "after reassign(box) : mutated",
                        "after bump(count)   : 1"
                    ],
                    explain: "<p>This settles a thirty-year argument in three lines. <code>mutate</code> changed the caller's object, so it looks like pass-by-reference. <code>reassign</code> then pointed its parameter at a brand-new <code>Box</code> and the caller saw nothing — so it is not.</p><p>Both are the same rule. The method receives a <strong>copy of the reference</strong>. Following that copy to the object and changing a field affects the one object both names point at. Assigning to the copy only changes the copy, and the caller's reference still points where it did. <code>bump</code> is the same thing with a primitive, where there is no object to reach through at all.</p><p>Java is pass-by-value, always. What gets passed by value is sometimes a reference.</p>"
                }
            }],
            subsection: "objects-primitives"
        },
        {
            id: "garbage-collector",
            importance: "must-know",
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
            importance: "must-know",
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
                title: "Synchronized method, synchronized block, and no lock at all",
                code: "class Counter {\n    private int count = 0;\n    private final Object lock = new Object();\n\n    synchronized void incrementWhole() {   // locks on 'this' for the whole method\n        count++;\n    }\n\n    void incrementBlock() {\n        // any non-critical work here runs without holding the lock\n        synchronized (lock) {              // a narrower critical section\n            count++;\n        }\n    }\n\n    synchronized int get() { return count; }\n}\n\nclass UnsafeCounter {\n    int count = 0;\n    void increment() { count++; }          // read, add, write — three steps, no lock\n}\n\npublic class SynchronizedKeyword {\n\n    static void hammer(Runnable task) throws InterruptedException {\n        Thread a = new Thread(task);\n        Thread b = new Thread(task);\n        a.start(); b.start();\n        a.join();  b.join();\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        final int perThread = 50_000;\n        final int expected = perThread * 2;\n\n        Counter method = new Counter();\n        hammer(() -> { for (int i = 0; i < perThread; i++) method.incrementWhole(); });\n        System.out.println(\"synchronized method = \" + method.get() + \" (expected \" + expected + \")\");\n\n        Counter block = new Counter();\n        hammer(() -> { for (int i = 0; i < perThread; i++) block.incrementBlock(); });\n        System.out.println(\"synchronized block  = \" + block.get() + \" (expected \" + expected + \")\");\n\n        UnsafeCounter unsafe = new UnsafeCounter();\n        hammer(() -> { for (int i = 0; i < perThread; i++) unsafe.increment(); });\n        System.out.println(\"no lock: total at most \" + expected + \"? \" + (unsafe.count <= expected));\n        System.out.println(\"  a lost update can only lose, never invent — and the exact\");\n        System.out.println(\"  number differs from run to run, which is the whole problem\");\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "synchronized method = 100000 (expected 100000)",
                        "synchronized block  = 100000 (expected 100000)",
                        "no lock: total at most 100000? true",
                        "  a lost update can only lose, never invent — and the exact",
                        "  number differs from run to run, which is the whole problem"
                    ],
                    explain: "<p>Two threads, fifty thousand increments each, and both locked versions land on exactly 100000 every time. That reproducibility <em>is</em> the guarantee <code>synchronized</code> provides.</p><p>The unsynchronized counter is the reason the recorded output stops at \"at most\". <code>count++</code> is three operations — read, add, write — and two threads can read the same value, both add one, and both write the same result, losing an increment. The total is therefore some number at or below 100000, and it is a different number on every run and every machine. A test that asserted an exact figure here would be asserting a coincidence.</p><p>The two locked variants differ only in scope: <code>synchronized</code> on the method holds the lock on <code>this</code> for the whole body, while the block holds a private lock for the two lines that need it and lets everything else run free.</p>"
                }
            }],
            subsection: "concurrency"
        },
        {
            id: "threadpoolexecutor",
            importance: "should-know",
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
                code: "ThreadPoolExecutor executor = new ThreadPoolExecutor(\n    4,                              // corePoolSize\n    8,                              // maximumPoolSize\n    30, TimeUnit.SECONDS,           // keepAliveTime for extra threads\n    new LinkedBlockingQueue<>(100), // work queue\n    new ThreadPoolExecutor.CallerRunsPolicy() // backpressure instead of throwing\n);\n\nexecutor.submit(() -> processTask());\nexecutor.shutdown(); // stop accepting new tasks, finish queued ones",
                output: {
                    kind: "trace",
                    lines: [
                        "Tasks 1–4 arrive. The pool starts a new thread for each one, up to corePoolSize, even if an earlier thread has already gone idle.",
                        "Tasks 5 onwards go into the LinkedBlockingQueue, which holds 100. The pool does NOT grow while the queue has room — this surprises people.",
                        "Once 100 tasks are queued and all 4 core threads are busy, the pool finally creates more threads, up to maximumPoolSize of 8.",
                        "Task 109 arrives with 8 threads busy and the queue full. The rejection policy runs.",
                        "CallerRunsPolicy executes that task on the submitting thread instead of throwing. The producer is now doing the work, so it stops submitting — backpressure rather than failure.",
                        "When the load falls away, the 4 threads above corePoolSize sit idle for keepAliveTime (30 seconds) and then exit. The core 4 stay.",
                        "shutdown() refuses new submissions and lets the queue drain. shutdownNow() interrupts running tasks and returns the ones never started."
                    ],
                    explain: "<p>Step two is the behaviour worth memorising, because it is the opposite of what most people assume: a pool configured 4-to-8 will <strong>not</strong> use more than 4 threads until the queue is completely full. With an unbounded queue it never reaches step three at all, and <code>maximumPoolSize</code> becomes decoration — which is exactly what <code>Executors.newFixedThreadPool</code> does.</p><p>There is no console output here because thread scheduling decides the order and the thread names, and neither is the same twice.</p>"
                }
            }],
            subsection: "concurrency"
        },
        {
            id: "volatile-modifier",
            importance: "should-know",
            question: "What is the volatile modifier?",
            answer: "<p><strong>🔑 Guarantees visibility and ordering, not atomicity</strong></p><ul><li><code>volatile</code> tells the JVM that a field's value can be modified by multiple threads — every read goes directly to main memory (not a cached/CPU-register copy) and every write is immediately flushed to main memory.</li><li><strong>Happens-before</strong> — a write to a <code>volatile</code> field happens-before every subsequent read of that same field by any thread, establishing a memory-ordering guarantee (per the Java Memory Model, JLS §17.4) that also makes all writes made <em>before</em> the volatile write visible to the reader.</li><li><strong>What it does NOT give you</strong> — <strong>atomicity</strong> for compound actions. <code>volatile int counter; counter++;</code> is still a read-modify-write race, because <code>++</code> is three separate operations (read, add, write) that can interleave across threads.</li><li><strong>vs synchronized</strong> — <code>synchronized</code> gives mutual exclusion + visibility (and can protect multi-step invariants); <code>volatile</code> gives only visibility/ordering for a single field, with no locking overhead.</li><li><strong>Typical use case</strong> — a boolean flag read by one thread and set by another to signal shutdown/cancellation (e.g. <code>private volatile boolean running = true;</code>), where no compound state update is involved.</li><li>For compound atomic operations without full locking, prefer <code>java.util.concurrent.atomic</code> classes (<code>AtomicInteger</code>, etc.), which use CAS instructions.</li></ul><p><strong>🎯 Interview tip:</strong> the sharpest one-liner — &quot;volatile makes reads/writes visible across threads, it does not make compound operations atomic.&quot;</p>",
            referenceLinks: [{ title: "Oracle: JLS 17.4 Memory Model", url: "https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.4" }],
            tags: ["volatile", "concurrency", "memory-model", "happens-before", "visibility"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "What volatile guarantees, and what it does not",
                code: "class Worker {\n    private volatile boolean running = true; // safe: single flag, no compound op\n    private volatile int counter = 0;         // UNSAFE for counter++\n\n    void stop() { running = false; } // write visible to reading thread immediately\n\n    void run() {\n        while (running) {\n            counter++; // read-modify-write RACE despite volatile\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Thread A calls stop(), writing running = false.",
                        "Because running is volatile, that write goes straight to main memory and cannot be reordered around.",
                        "Thread B, spinning in while (running), sees the new value on its next read and exits the loop.",
                        "Without volatile, the compiler may hoist the read out of the loop into a register, and thread B can spin forever on a stale copy.",
                        "Meanwhile counter++ inside the loop is three operations: read counter, add one, write it back.",
                        "volatile makes each of those three steps immediately visible to other threads.",
                        "It does not make the three of them one step. Two threads can read the same value, both add one, and both write the same result.",
                        "One increment is silently lost. Only AtomicInteger or a lock closes that gap."
                    ],
                    explain: "<p>The split between steps 6 and 7 is the entire question. <code>volatile</code> is a <strong>visibility</strong> guarantee, not an <strong>atomicity</strong> one, and the two get conflated constantly.</p><p>That makes it exactly right for the <code>running</code> flag, where one thread writes and others only read, and exactly wrong for <code>counter++</code>, where a read-modify-write has to be indivisible. Declaring a counter <code>volatile</code> looks like it fixes the race and does not.</p><p>No output, because the failure only appears under real thread interleaving and does not appear every time even then.</p>"
                }
            }],
            subsection: "concurrency"
        },
        {
            id: "object-level-vs-class-level-lock",
            importance: "should-know",
            question: "Object Level Lock vs Class Level Lock in Java",
            answer: "<p><strong>🔑 Locking a single instance's monitor vs locking the shared Class object's monitor</strong></p><table><thead><tr><th>Aspect</th><th>Object-level lock</th><th>Class-level lock</th></tr></thead><tbody><tr><td>Acquired via</td><td><code>synchronized</code> instance method, or <code>synchronized(this)</code></td><td><code>static synchronized</code> method, or <code>synchronized(MyClass.class)</code></td></tr><tr><td>Lock held on</td><td>The specific object instance</td><td>The single <code>Class</code> object (one per class, shared JVM-wide)</td></tr><tr><td>Scope</td><td>Per-instance — two threads on <em>different</em> instances don't block each other</td><td>Global to the class — blocks across <strong>all</strong> instances and threads</td></tr><tr><td>Typical use</td><td>Protecting instance state (e.g. a bank account balance)</td><td>Protecting static/shared state (e.g. a singleton counter, static cache)</td></tr></tbody></table><ul><li>They are <strong>independent locks</strong> — a thread holding the class-level lock does not block another thread from acquiring an object-level lock on some instance, and vice versa.</li><li><strong>Common bug</strong> — mixing an instance method's <code>synchronized(this)</code> with a static method's <code>synchronized(MyClass.class)</code> when both guard the <em>same</em> shared static field gives no real protection, since they're different locks.</li></ul>",
            referenceLinks: [{ title: "Oracle: Intrinsic Locks and Synchronization", url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html" }],
            tags: ["synchronized", "locks", "concurrency", "static", "monitor"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Object locks and class locks are independent",
                code: "class Account {\n    private double balance;\n    private static int totalAccounts = 0;\n\n    synchronized void withdraw(double amt) { // locks 'this' (object-level)\n        balance -= amt;\n    }\n\n    static synchronized void registerAccount() { // locks Account.class (class-level)\n        totalAccounts++;\n    }\n}\n\n// Thread A calling acc1.withdraw() and Thread B calling acc2.withdraw()\n// run concurrently -- different object locks. Thread C calling\n// Account.registerAccount() blocks any other thread calling it too.",
                output: {
                    kind: "trace",
                    lines: [
                        "Thread A calls acc1.withdraw() and acquires the lock on the acc1 object.",
                        "Thread B calls acc2.withdraw() at the same moment, acquires acc2's own lock, and runs concurrently. Instance locks are per object.",
                        "Thread C calls acc1.withdraw() and blocks, because A holds that particular lock.",
                        "Thread D calls Account.registerAccount(), a static synchronized method, which locks the Account.class object.",
                        "That lock has nothing to do with any instance lock, so D runs immediately — it neither blocks nor is blocked by A, B or C.",
                        "A second thread calling registerAccount() does have to wait for D, because there is only one Account.class object.",
                        "So a static field guarded only by instance locks is not guarded at all: every instance has a different lock, and the field is shared by all of them."
                    ],
                    explain: "<p>Step 5 is the trap. It is natural to read <code>synchronized</code> as \"one thread at a time\", but the question is always <em>one thread at a time holding which lock</em>. An instance method locks <code>this</code>; a static method locks the <code>Class</code>. They are separate monitors and give each other no protection.</p><p>Step 7 is how that becomes a bug: shared mutable static state protected by instance-level synchronisation, which looks locked and is not.</p><p>Nothing is printed because the interleaving is the subject, and it differs on every run.</p>"
                }
            }],
            subsection: "concurrency"
        },
        {
            id: "concurrency-vs-parallelism",
            importance: "should-know",
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
            importance: "should-know",
            question: "Describe atomic operations: get, set, lazySet, compareAndSet, weakCompareAndSet.",
            answer: "<p><strong>🔑 Lock-free, hardware-backed operations on java.util.concurrent.atomic classes</strong></p><ul><li>Classes like <code>AtomicInteger</code>, <code>AtomicLong</code>, <code>AtomicReference</code> provide operations that complete as a <strong>single indivisible step</strong> using CPU-level CAS (compare-and-swap) instructions instead of locks, avoiding blocking/contention overhead.</li><li><strong>get()</strong> — reads the current value with <code>volatile</code> read semantics (guaranteed to see the latest write from any thread).</li><li><strong>set(v)</strong> — writes a new value with <code>volatile</code> write semantics, immediately visible to other threads.</li><li><strong>lazySet(v)</strong> — writes eventually, without the immediate cross-thread visibility guarantee or a full memory fence — cheaper than <code>set()</code>, useful when you know no other thread needs to observe the value right away (e.g. nulling a reference before it becomes unreachable, to help GC).</li><li><strong>compareAndSet(expected, update)</strong> — atomically sets to <code>update</code> only if the current value equals <code>expected</code>; returns <code>true</code>/<code>false</code>. This is the building block of lock-free algorithms (retry loops).</li><li><strong>weakCompareAndSet</strong> (renamed <code>weakCompareAndSetPlain</code> in newer JDKs) — like <code>compareAndSet</code> but may <strong>spuriously fail</strong> even when the expected value matches, and provides weaker memory-ordering guarantees; it's allowed to be faster on some hardware, so it's meant to be used inside a retry loop, never for a one-shot check.</li></ul><p><strong>🎯 Interview tip:</strong> the classic CAS retry-loop pattern (<code>do { current = get(); } while (!compareAndSet(current, current + 1));</code>) is exactly how <code>AtomicInteger.incrementAndGet()</code> is implemented internally.</p>",
            referenceLinks: [{ title: "Oracle: AtomicInteger (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html" }],
            tags: ["atomic", "compareAndSet", "cas", "concurrency", "lock-free"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "compareAndSet, and the CAS loop underneath incrementAndGet",
                code: "import java.util.concurrent.atomic.AtomicInteger;\n\npublic class AtomicOperations {\n    public static void main(String[] args) throws InterruptedException {\n        AtomicInteger counter = new AtomicInteger(0);\n\n        // What incrementAndGet() does internally, roughly:\n        int prev, next;\n        do {\n            prev = counter.get();\n            next = prev + 1;\n        } while (!counter.compareAndSet(prev, next));   // retries if another thread won\n        System.out.println(\"after one manual CAS      = \" + counter.get());\n\n        // compareAndSet only succeeds when the value is what you expected.\n        System.out.println(\"CAS from 1 to 99 succeeds \" + counter.compareAndSet(1, 99));\n        System.out.println(\"CAS from 1 to 42 succeeds \" + counter.compareAndSet(1, 42));\n        System.out.println(\"value now                 = \" + counter.get());\n\n        // The real thing, hammered from two threads.\n        counter.set(0);\n        final int perThread = 50_000;\n        Runnable task = () -> { for (int i = 0; i < perThread; i++) counter.incrementAndGet(); };\n        Thread a = new Thread(task), b = new Thread(task);\n        a.start(); b.start();\n        a.join();  b.join();\n        System.out.println(\"two threads, 50k each     = \" + counter.get());\n\n        System.out.println(\"getAndIncrement returns   = \" + counter.getAndIncrement());\n        System.out.println(\"incrementAndGet returns   = \" + counter.incrementAndGet());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "after one manual CAS      = 1",
                        "CAS from 1 to 99 succeeds true",
                        "CAS from 1 to 42 succeeds false",
                        "value now                 = 99",
                        "two threads, 50k each     = 100000",
                        "getAndIncrement returns   = 100000",
                        "incrementAndGet returns   = 100002"
                    ],
                    explain: "<p>Lines two and three are compare-and-swap in one pair. The first succeeded because the value really was 1; the second failed because the first had already changed it to 99. CAS never blocks — it checks and reports, and the caller decides whether to retry.</p><p>That is the loop at the top: read, compute, attempt, and go round again if someone else got there first. <code>incrementAndGet</code> is that loop in the JDK, compiled to a single CPU instruction, which is why two threads reach exactly 100000 with no lock anywhere.</p><p>The last two lines are the naming, which is easy to get backwards. <code>getAndIncrement</code> returns the value <em>before</em> the change; <code>incrementAndGet</code> returns the value <em>after</em>.</p>"
                }
            }],
            subsection: "concurrency"
        },
        {
            id: "try-catch-finally",
            importance: "should-know",
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
                title: "What runs, and in what order",
                code: "public class TryCatchFinally {\n\n    // finally runs after the return value is computed but before the caller sees it.\n    static String order() {\n        try {\n            System.out.println(\"1. try\");\n            throw new IllegalStateException(\"boom\");\n        } catch (IllegalStateException e) {\n            System.out.println(\"2. catch: \" + e.getMessage());\n            return \"3. returning from catch\";\n        } finally {\n            System.out.println(\"   finally runs before that return lands\");\n        }\n    }\n\n    // A return inside finally silently discards the try's return value.\n    @SuppressWarnings(\"finally\")\n    static int finallyWins() {\n        try {\n            return 1;\n        } finally {\n            return 2;\n        }\n    }\n\n    static class Resource implements AutoCloseable {\n        private final String name;\n        Resource(String name) {\n            this.name = name;\n            System.out.println(\"   open  \" + name);\n        }\n        @Override public void close() {\n            System.out.println(\"   close \" + name);\n        }\n    }\n\n    public static void main(String[] args) {\n        System.out.println(order());\n\n        System.out.println(\"finallyWins() = \" + finallyWins());\n\n        // try-with-resources closes in reverse order, and needs no finally at all.\n        System.out.println(\"try-with-resources:\");\n        try (Resource a = new Resource(\"a\"); Resource b = new Resource(\"b\")) {\n            System.out.println(\"   body\");\n        }\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "1. try",
                        "2. catch: boom",
                        "   finally runs before that return lands",
                        "3. returning from catch",
                        "finallyWins() = 2",
                        "try-with-resources:",
                        "   open  a",
                        "   open  b",
                        "   body",
                        "   close b",
                        "   close a"
                    ],
                    explain: "<p>Read the first four lines in order. The <code>return</code> in the catch block computed its value, then <code>finally</code> ran, and only then did the method actually return. <code>finally</code> is not \"code after the try\" — it runs between the return being evaluated and the caller receiving it.</p><p><code>finallyWins()</code> returns <strong>2</strong>. The <code>try</code> block's <code>return 1</code> was fully evaluated and then thrown away, silently, because <code>finally</code> returned as well. This is why a <code>return</code> inside <code>finally</code> is a compiler warning and, in practice, a bug.</p><p>The resources close in <strong>reverse order</strong> — <code>b</code> then <code>a</code> — which matters when the second resource was built from the first. try-with-resources gets this right for free; a hand-written <code>finally</code> has to remember it.</p>"
                }
            }],
            subsection: "exceptions"
        },
        {
            id: "checked-vs-unchecked-exceptions",
            importance: "should-know",
            question: "What is the difference between Checked and Unchecked Exceptions?",
            answer: "<p><strong>🔑 Compiler-enforced recovery vs programmer-error signals</strong></p><table><thead><tr><th>Aspect</th><th>Checked</th><th>Unchecked</th></tr></thead><tbody><tr><td>Base class</td><td><code>Exception</code> (excluding <code>RuntimeException</code>)</td><td><code>RuntimeException</code> and <code>Error</code></td></tr><tr><td>Compiler enforcement</td><td>Must be caught or declared with <code>throws</code></td><td>No compiler requirement</td></tr><tr><td>Represents</td><td>Recoverable conditions outside program control (file missing, network down)</td><td>Programming errors / bugs (null deref, bad index, invalid argument)</td></tr><tr><td>Examples</td><td><code>IOException</code>, <code>SQLException</code>, <code>ParseException</code></td><td><code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>IllegalArgumentException</code></td></tr><tr><td>Typical handling</td><td>Caller genuinely expected to catch/recover</td><td>Usually indicates a bug to fix, not catch</td></tr></tbody></table><ul><li><strong>Errors</strong> (<code>OutOfMemoryError</code>, <code>StackOverflowError</code>) are a third category — serious JVM-level problems applications generally should not try to catch or recover from.</li><li><strong>Design debate</strong> — checked exceptions force explicit handling but can lead to boilerplate (empty catch blocks, exception wrapping); many modern APIs (Spring, most of <code>java.util.concurrent</code>) favor unchecked exceptions for this reason.</li></ul>",
            referenceLinks: [{ title: "Oracle: Unchecked Exceptions — The Controversy", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/runtime.html" }],
            tags: ["exceptions", "checked-exceptions", "unchecked-exceptions", "runtimeexception", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "What the compiler forces, and what it ignores",
                code: "import java.io.IOException;\n\npublic class CheckedVsUnchecked {\n\n    // Checked: the compiler forces every caller to catch this or declare it.\n    static void readConfig(String path) throws IOException {\n        throw new IOException(\"no such file: \" + path);\n    }\n\n    // Unchecked: the compiler says nothing, and callers need not react.\n    static int divide(int a, int b) {\n        return a / b;\n    }\n\n    public static void main(String[] args) {\n        try {\n            readConfig(\"app.properties\");\n        } catch (IOException e) {          // omitting this would not compile\n            System.out.println(\"checked   : caught \" + e.getClass().getSimpleName() + \" - \" + e.getMessage());\n        }\n\n        try {\n            divide(1, 0);                  // no try/catch required by the compiler\n        } catch (ArithmeticException e) {\n            System.out.println(\"unchecked : caught \" + e.getClass().getSimpleName() + \" - \" + e.getMessage());\n        }\n\n        // The dividing line is the class hierarchy, not the severity.\n        System.out.println(\"IOException is checked?          \"\n            + !RuntimeException.class.isAssignableFrom(IOException.class));\n        System.out.println(\"ArithmeticException is checked?  \"\n            + !RuntimeException.class.isAssignableFrom(ArithmeticException.class));\n        System.out.println(\"NullPointerException is checked? \"\n            + !RuntimeException.class.isAssignableFrom(NullPointerException.class));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "checked   : caught IOException - no such file: app.properties",
                        "unchecked : caught ArithmeticException - / by zero",
                        "IOException is checked?          true",
                        "ArithmeticException is checked?  false",
                        "NullPointerException is checked? false"
                    ],
                    explain: "<p>Both exceptions were caught the same way, so at runtime there is no difference at all. The difference is entirely at compile time: removing the first <code>catch</code> stops the program compiling, and removing the second changes nothing.</p><p>The last three lines show where that line is actually drawn — not by severity, but by ancestry. Anything under <code>RuntimeException</code> is unchecked; everything else under <code>Exception</code> is checked. That is why <code>NullPointerException</code>, easily the most common failure in Java, is one the compiler never mentions.</p>"
                }
            }],
            subsection: "exceptions"
        },
        {
            id: "shallow-vs-deep-copy",
            importance: "should-know",
            question: "Shallow vs Deep Copy in Java",
            answer: "<p><strong>🔑 Copy the top-level object only, or recursively copy everything it references</strong></p><table><thead><tr><th>Aspect</th><th>Shallow copy</th><th>Deep copy</th></tr></thead><tbody><tr><td>What's copied</td><td>The object itself; reference fields still point to the <strong>same</strong> nested objects</td><td>The object and a fresh, independent copy of every object it references, recursively</td></tr><tr><td>Default <code>Object.clone()</code></td><td>Shallow by default</td><td>Must override <code>clone()</code> (or use serialization/copy constructors) to go deep</td></tr><tr><td>Mutation risk</td><td>Mutating a nested object through the copy affects the original too</td><td>Fully independent — mutating the copy never affects the original</td></tr><tr><td>Cost</td><td>Cheap — just copies references</td><td>More expensive — allocates new objects for the whole graph</td></tr></tbody></table><ul><li><strong>Immutable nested fields</strong> (like <code>String</code>) make shallow copying safe for those fields specifically, since they can't be mutated in place anyway.</li><li><strong>Common deep-copy techniques</strong> — manually copy each mutable field recursively, use a copy constructor, or serialize/deserialize the object graph (slow but simple for complex graphs).</li></ul>",
            referenceLinks: [{ title: "Oracle: Object.clone() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#clone()" }],
            tags: ["shallow-copy", "deep-copy", "clone", "object-copying"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Shallow clone shares nested objects; deep copy does not",
                code: "class Address {\n    String city;\n    Address(String city) { this.city = city; }\n}\n\nclass Person implements Cloneable {\n    String name;\n    Address address;\n\n    Person(String name, Address address) {\n        this.name = name;\n        this.address = address;\n    }\n\n    @Override\n    protected Person clone() throws CloneNotSupportedException {\n        return (Person) super.clone();   // shallow: the Address is SHARED\n    }\n\n    Person deepCopy() {\n        return new Person(this.name, new Address(this.address.city));\n    }\n}\n\npublic class ShallowVsDeepCopy {\n    public static void main(String[] args) throws Exception {\n        Person original = new Person(\"Aditya\", new Address(\"Pune\"));\n\n        Person shallow = original.clone();\n        Person deep = original.deepCopy();\n\n        System.out.println(\"shares Address with shallow copy? \" + (original.address == shallow.address));\n        System.out.println(\"shares Address with deep copy?    \" + (original.address == deep.address));\n\n        // Change the nested object through the original.\n        original.address.city = \"Bengaluru\";\n\n        System.out.println(\"original.city = \" + original.address.city);\n        System.out.println(\"shallow.city  = \" + shallow.address.city);\n        System.out.println(\"deep.city     = \" + deep.address.city);\n\n        // The top-level field is copied either way, so this stays independent.\n        original.name = \"Riya\";\n        System.out.println(\"shallow.name  = \" + shallow.name);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "shares Address with shallow copy? true",
                        "shares Address with deep copy?    false",
                        "original.city = Bengaluru",
                        "shallow.city  = Bengaluru",
                        "deep.city     = Pune",
                        "shallow.name  = Aditya"
                    ],
                    explain: "<p>One line was changed — <code>original.address.city</code> — and it appeared in the shallow copy too. That is the bug this question is really about: the copy looked independent right up until someone reached through it.</p><p><code>Object.clone()</code> copies fields, and the <code>address</code> field is a <em>reference</em>. Copying it faithfully gives you a second reference to the same <code>Address</code>. The deep copy built a new <code>Address</code>, so it kept \"Pune\".</p><p>The last line shows why the problem hides: <code>name</code> is a <code>String</code>, which is immutable, so reassigning it on the original could never have affected the copy. Shallow copies are safe for every immutable field and dangerous for exactly the mutable ones.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "serialization-deserialization",
            importance: "should-know",
            question: "Explain Serialization and Deserialization",
            answer: "<p><strong>🔑 Converting an object graph to bytes and back</strong></p><ul><li><strong>Serialization</strong> converts an object's state into a byte stream (via <code>ObjectOutputStream.writeObject()</code>) so it can be persisted to disk, sent over a network, or cached — the class must implement the marker interface <code>Serializable</code>.</li><li><strong>Deserialization</strong> reconstructs the object from that byte stream (<code>ObjectInputStream.readObject()</code>), <strong>without calling any constructor</strong> of the class — fields are restored directly from the stream.</li><li><strong>serialVersionUID</strong> — a version identifier that should be declared explicitly; if the sender's and receiver's class versions have mismatched UIDs, deserialization throws <code>InvalidClassException</code>, protecting against silently loading incompatible data.</li><li><strong>transient</strong> fields are skipped during serialization (see next question) — useful for derived data, caches, or non-serializable resources like <code>Thread</code> or file handles.</li><li><strong>Security concern</strong> — deserializing untrusted input is a well-known attack vector (arbitrary code execution via gadget chains), so modern guidance favors safer formats (JSON via Jackson/Gson, Protocol Buffers) over native Java serialization for external data.</li></ul><p><strong>🎯 Interview tip:</strong> mention that <code>Serializable</code> is a marker interface with zero methods — the actual work is done by the JVM via reflection over the object's fields.</p>",
            referenceLinks: [{ title: "Oracle: Java Object Serialization Specification", url: "https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/index.html" }],
            tags: ["serialization", "deserialization", "serializable", "transient", "java-io"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Round-tripping an object, and what transient leaves behind",
                code: "import java.io.ByteArrayInputStream;\nimport java.io.ByteArrayOutputStream;\nimport java.io.ObjectInputStream;\nimport java.io.ObjectOutputStream;\nimport java.io.Serializable;\n\nclass User implements Serializable {\n    private static final long serialVersionUID = 1L;\n\n    String name;\n    int loginCount;\n    transient String sessionToken;   // deliberately excluded from the stream\n\n    User(String name, int loginCount, String sessionToken) {\n        this.name = name;\n        this.loginCount = loginCount;\n        this.sessionToken = sessionToken;\n    }\n}\n\npublic class SerializationDemo {\n    public static void main(String[] args) throws Exception {\n        User before = new User(\"Aditya\", 7, \"secret-token\");\n\n        // Serialize to memory rather than a file — same stream, nothing to clean up.\n        ByteArrayOutputStream bytes = new ByteArrayOutputStream();\n        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {\n            out.writeObject(before);\n        }\n        System.out.println(\"serialized to \" + bytes.size() + \" bytes\");\n\n        User after;\n        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {\n            after = (User) in.readObject();\n        }\n\n        System.out.println(\"name         \" + after.name);\n        System.out.println(\"loginCount   \" + after.loginCount);\n        System.out.println(\"sessionToken \" + after.sessionToken);\n        System.out.println(\"same object? \" + (before == after));\n        System.out.println(\"token was    \" + before.sessionToken + \" before writing\");\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "serialized to 79 bytes",
                        "name         Aditya",
                        "loginCount   7",
                        "sessionToken null",
                        "same object? false",
                        "token was    secret-token before writing"
                    ],
                    explain: "<p><code>name</code> and <code>loginCount</code> survived the round trip. <code>sessionToken</code> came back <strong>null</strong>, and the last line confirms it held a real value before writing — <code>transient</code> excluded it from the stream, and deserialization left the field at its default rather than restoring anything.</p><p>That is the mechanism for keeping secrets, caches and connections out of a serialized form, and also a trap: a <code>transient</code> field is not just absent from the bytes, it is <code>null</code> in the object you get back, so anything reading it after deserialization needs to cope.</p><p><code>same object? false</code> is the other half — deserialization constructs a new instance without calling the constructor. Serialization is a copying mechanism, which is why it is sometimes abused for deep copies.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "transient-modifier",
            importance: "good-to-know",
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
            importance: "should-know",
            question: "What are anonymous classes?",
            answer: "<p><strong>🔑 A one-off class declared and instantiated inline, with no name</strong></p><ul><li>An <strong>anonymous class</strong> lets you define a class body and create a single instance of it in one expression — useful when you need a one-time implementation of an interface or a small override of an abstract/concrete class, without a separate named top-level or nested class.</li><li><strong>Syntax</strong> — <code>new SomeType() { ... method overrides ... }</code>; it implicitly extends <code>SomeType</code> (class or interface) and can override its methods or add new ones (though new members aren't accessible outside the anonymous class itself).</li><li><strong>Captures enclosing variables</strong> — can access local variables from the enclosing scope only if they are <code>final</code> or <em>effectively final</em> (never reassigned after initialization).</li><li><strong>Compiled artifact</strong> — the compiler generates a separate class file named like <code>Outer$1.class</code> for each anonymous class in a source file.</li><li><strong>Largely superseded</strong> for single-abstract-method (SAM) interfaces by <strong>lambda expressions</strong> (Java 8+), which are more concise and don't create a new <code>this</code> scope — but anonymous classes are still needed when overriding multiple methods or extending a concrete/abstract class.</li></ul><p><strong>🎯 Interview tip:</strong> know the difference in <code>this</code> binding — inside an anonymous class, <code>this</code> refers to the anonymous instance; inside a lambda, <code>this</code> refers to the enclosing instance.</p>",
            referenceLinks: [{ title: "Oracle: Anonymous Classes", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/anonymousclasses.html" }],
            tags: ["anonymous-classes", "lambdas", "oop", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Anonymous class and lambda, side by side",
                code: "import java.util.ArrayList;\nimport java.util.Comparator;\nimport java.util.List;\n\npublic class AnonymousClasses {\n    public static void main(String[] args) {\n        // Anonymous class implementing an interface\n        Comparator<String> byLength = new Comparator<String>() {\n            @Override\n            public int compare(String a, String b) {\n                return a.length() - b.length();\n            }\n        };\n\n        // Equivalent lambda — only possible because Comparator is a SAM interface\n        Comparator<String> byLengthLambda = (a, b) -> a.length() - b.length();\n\n        List<String> words = new ArrayList<>(List.of(\"banana\", \"fig\", \"cherry\"));\n\n        words.sort(byLength);\n        System.out.println(\"anonymous class \" + words);\n\n        words.sort(byLengthLambda);\n        System.out.println(\"lambda          \" + words);\n\n        // They are not the same thing underneath. An anonymous class is a real\n        // named class file; a lambda is not.\n        System.out.println(\"anon class name        \" + byLength.getClass().getName());\n        System.out.println(\"anon has enclosing?    \" + (byLength.getClass().getEnclosingClass() != null));\n        System.out.println(\"lambda has enclosing?  \" + (byLengthLambda.getClass().getEnclosingClass() != null));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "anonymous class [fig, banana, cherry]",
                        "lambda          [fig, banana, cherry]",
                        "anon class name        AnonymousClasses$1",
                        "anon has enclosing?    true",
                        "lambda has enclosing?  false"
                    ],
                    explain: "<p>Both comparators sort identically, so as far as the code using them is concerned they are interchangeable. The bottom three lines show they are not the same underneath.</p><p>The anonymous class is a real class — the compiler generated <code>AnonymousClasses$1</code>, a numbered class file with an enclosing class. The lambda is not: it has no enclosing class because it is not a nested type at all, but a method handle wired up at first use.</p><p>That is why lambdas are limited to interfaces with a single abstract method, and why an anonymous class is still the answer when you need two methods, a constructor, or a field.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "equals-vs-double-equals",
            importance: "must-know",
            question: "What is the difference between == and .equals()?",
            answer: "<p><strong>🔑 Reference identity vs logical content equality</strong></p><table><thead><tr><th>Aspect</th><th><code>==</code></th><th><code>.equals()</code></th></tr></thead><tbody><tr><td>For primitives</td><td>Compares actual values</td><td>N/A (not applicable to primitives)</td></tr><tr><td>For objects</td><td>Compares <strong>reference identity</strong> — do both variables point to the exact same object in memory?</td><td>Compares whatever the class defines as <strong>logical equality</strong> (content)</td></tr><tr><td>Default behavior</td><td>N/A</td><td><code>Object.equals()</code> defaults to <code>==</code> unless overridden</td></tr><tr><td>Overridable?</td><td>No, fixed language operator</td><td>Yes — classes like <code>String</code>, <code>Integer</code>, and your own classes commonly override it</td></tr></tbody></table><ul><li><strong>Strings specifically</strong> — <code>==</code> on two <code>String</code> objects only returns <code>true</code> if they're the same pooled/interned instance; <code>.equals()</code> always compares character content correctly, which is why string comparisons should always use <code>.equals()</code>.</li><li>If you override <code>equals()</code>, you are contractually required to also override <code>hashCode()</code> consistently (see the next question) or break hash-based collections.</li></ul>",
            referenceLinks: [{ title: "Oracle: Object.equals() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)" }],
            tags: ["equals", "double-equals", "reference-equality", "strings", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "== compares identity, equals() compares content",
                code: "class Point {\n    int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        if (!(o instanceof Point)) return false;\n        Point p = (Point) o;\n        return x == p.x && y == p.y;\n    }\n}\n\npublic class EqualsVsDoubleEquals {\n    public static void main(String[] args) {\n        String a = new String(\"hi\");\n        String b = new String(\"hi\");\n        System.out.println(\"a == b       \" + (a == b));        // two distinct objects\n        System.out.println(\"a.equals(b)  \" + a.equals(b));     // same characters\n\n        Point p = new Point(1, 2);\n        Point q = new Point(1, 2);\n        System.out.println(\"p == q       \" + (p == q));        // reference comparison\n        System.out.println(\"p.equals(q)  \" + p.equals(q));     // our override compares fields\n\n        // Without an override, equals() is just ==. Object's version does nothing else.\n        Object o1 = new Object();\n        Object o2 = new Object();\n        System.out.println(\"o1.equals(o2) \" + o1.equals(o2));\n\n        // Primitives have no identity, so == is the only comparison there is.\n        int i = 5, j = 5;\n        System.out.println(\"i == j       \" + (i == j));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "a == b       false",
                        "a.equals(b)  true",
                        "p == q       false",
                        "p.equals(q)  true",
                        "o1.equals(o2) false",
                        "i == j       true"
                    ],
                    explain: "<p><code>==</code> asks \"are these the same object?\" and <code>equals()</code> asks whatever the class decided it should ask. For <code>String</code> and for our <code>Point</code>, that is \"do the contents match?\" — so the two operators disagree, correctly.</p><p>The fifth line is the one worth remembering. <code>Object.equals()</code> is <em>defined as</em> <code>==</code>. A class that does not override it gets identity comparison under a name that suggests otherwise, which is why two freshly built objects with identical fields can still be unequal.</p><p>The last line is the exception that confuses beginners: primitives have no identity, so <code>==</code> on <code>int</code> compares values and is the only comparison available.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "hashcode-and-equals",
            importance: "must-know",
            question: "What is hashCode() and equals() used for?",
            answer: "<p><strong>🔑 Together they define logical equality and let objects work correctly as hash-based keys</strong></p><ul><li><strong>equals()</strong> defines when two objects are considered logically equal; <strong>hashCode()</strong> returns an <code>int</code> used to place an object into a bucket in hash-based collections (<code>HashMap</code>, <code>HashSet</code>, <code>Hashtable</code>).</li><li><strong>The contract (must hold)</strong>: (1) if <code>a.equals(b)</code> is <code>true</code>, then <code>a.hashCode() == b.hashCode()</code> must also be <code>true</code>; (2) equal hash codes do <strong>not</strong> imply equal objects (hash collisions are expected and handled); (3) both methods must be <strong>consistent</strong> across calls as long as the object's relevant fields don't change.</li><li><strong>Why it matters</strong> — a <code>HashMap</code> first uses <code>hashCode()</code> to jump to the right bucket, then uses <code>equals()</code> to find the exact matching key within that bucket. Overriding one without the other breaks lookups: two &quot;equal&quot; objects could land in different buckets and never be found.</li><li><strong>Best practice</strong> — use <code>Objects.equals()</code> and <code>Objects.hash()</code> (or an IDE/Lombok-generated implementation, or a Kotlin <code>data class</code>) to derive both consistently from the same set of significant fields.</li><li><strong>Immutability tip</strong> — avoid using mutable fields in <code>hashCode()</code> for objects stored as <code>HashMap</code> keys; mutating the field after insertion can make the entry unfindable (it hashes to a different bucket than where it was stored).</li></ul><p><strong>🎯 Interview tip:</strong> this pairs perfectly with the previous question — always mention the equals/hashCode contract when discussing either one.</p>",
            referenceLinks: [{ title: "Oracle: Object.hashCode() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#hashCode()" }],
            tags: ["hashcode", "equals", "hashmap", "contract", "collections"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "What breaks when hashCode is left out",
                code: "import java.util.HashSet;\nimport java.util.Objects;\nimport java.util.Set;\n\n// Correct: equals and hashCode derived from the same fields.\nclass Point {\n    final int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof Point)) return false;\n        Point p = (Point) o;\n        return x == p.x && y == p.y;\n    }\n\n    @Override public int hashCode() {\n        return Objects.hash(x, y);\n    }\n}\n\n// Broken: equals overridden, hashCode left as Object's identity hash.\nclass BadPoint {\n    final int x, y;\n    BadPoint(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        if (!(o instanceof BadPoint)) return false;\n        BadPoint p = (BadPoint) o;\n        return x == p.x && y == p.y;\n    }\n}\n\npublic class HashCodeAndEquals {\n    public static void main(String[] args) {\n        Point a = new Point(1, 2), b = new Point(1, 2);\n        System.out.println(\"Point equal?        \" + a.equals(b));\n        System.out.println(\"Point same hash?    \" + (a.hashCode() == b.hashCode()));\n\n        Set<Point> good = new HashSet<>();\n        good.add(a);\n        good.add(b);\n        System.out.println(\"HashSet<Point> size \" + good.size());\n        System.out.println(\"contains new(1,2)   \" + good.contains(new Point(1, 2)));\n\n        BadPoint c = new BadPoint(1, 2), d = new BadPoint(1, 2);\n        System.out.println(\"BadPoint equal?     \" + c.equals(d));\n        System.out.println(\"BadPoint same hash? \" + (c.hashCode() == d.hashCode()));\n\n        Set<BadPoint> bad = new HashSet<>();\n        bad.add(c);\n        bad.add(d);\n        System.out.println(\"HashSet<BadPoint>   \" + bad.size());\n        System.out.println(\"contains new(1,2)   \" + bad.contains(new BadPoint(1, 2)));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Point equal?        true",
                        "Point same hash?    true",
                        "HashSet<Point> size 1",
                        "contains new(1,2)   true",
                        "BadPoint equal?     true",
                        "BadPoint same hash? false",
                        "HashSet<BadPoint>   2",
                        "contains new(1,2)   false"
                    ],
                    explain: "<p><code>BadPoint</code> overrides <code>equals</code> and not <code>hashCode</code>, and the bottom four lines are the consequence. Two <code>BadPoint</code> objects report themselves <strong>equal</strong>, and a <code>HashSet</code> still stored <strong>both</strong> of them.</p><p>That is not a contradiction — it is how a hash container works. It goes to the bucket the hash code names, and only compares with <code>equals</code> once it is there. Different hash codes mean different buckets, so the equal object is never even looked at. The last line is the same failure from the other side: a lookup for an equal key returns nothing, because it searched the wrong bucket.</p><p>Hence the contract: <strong>equal objects must have equal hash codes.</strong> Overriding one without the other produces objects that are equal everywhere except the places it matters.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "final-finally-finalize",
            importance: "should-know",
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
            importance: "should-know",
            question: "What does the static keyword mean in Java?",
            answer: "<p><strong>🔑 Belongs to the class itself, not to any instance</strong></p><ul><li><strong>static field</strong> — a single shared copy exists per class (not per instance), stored in the class's runtime area and initialized once when the class is loaded.</li><li><strong>static method</strong> — callable via the class name without creating an instance (<code>MyClass.method()</code>); cannot access instance (non-static) fields/methods directly since there's no implicit <code>this</code>.</li><li><strong>static block</strong> — runs once, in source order, when the class is first loaded by the JVM classloader; used for one-time static field initialization that needs more than a simple expression.</li><li><strong>static nested class</strong> — a nested class that doesn't hold an implicit reference to an outer instance, unlike a non-static inner class; can be instantiated without an outer instance (<code>new Outer.Nested()</code>).</li><li><strong>static import</strong> — imports static members so they can be used unqualified (e.g. <code>import static java.lang.Math.PI;</code>).</li><li>Common uses — constants (<code>public static final</code>), utility/helper methods (<code>Math.max()</code>, <code>Collections.sort()</code>), and factory methods.</li></ul>",
            referenceLinks: [{ title: "Oracle: Understanding Class Members", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html" }],
            tags: ["static", "keywords", "class-members", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "When a static block runs, and what static actually shares",
                code: "class Config {\n    static final String APP_NAME;      // one copy, shared by every instance\n    static int instances = 0;\n\n    static {                           // runs once, at class-load time\n        System.out.println(\"2. static block runs (class is being loaded)\");\n        APP_NAME = loadFromManifest();\n    }\n\n    int id;\n\n    Config() {                         // runs per instance\n        instances++;\n        id = instances;\n        System.out.println(\"   constructor runs, id=\" + id);\n    }\n\n    static String loadFromManifest() { return \"DroidDeck\"; }   // no 'this' available\n\n    static class Builder {             // static nested class: needs no outer instance\n        Config build() { return new Config(); }\n    }\n}\n\npublic class StaticKeyword {\n    public static void main(String[] args) {\n        System.out.println(\"1. main starts, Config not loaded yet\");\n\n        Config first = new Config.Builder().build();\n        Config second = new Config.Builder().build();\n\n        System.out.println(\"3. APP_NAME   = \" + Config.APP_NAME);\n        System.out.println(\"   instances  = \" + Config.instances);\n        System.out.println(\"   first.id   = \" + first.id + \", second.id = \" + second.id);\n        System.out.println(\"   same APP_NAME object? \" + (Config.APP_NAME == \"DroidDeck\"));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "1. main starts, Config not loaded yet",
                        "2. static block runs (class is being loaded)",
                        "   constructor runs, id=1",
                        "   constructor runs, id=2",
                        "3. APP_NAME   = DroidDeck",
                        "   instances  = 2",
                        "   first.id   = 1, second.id = 2",
                        "   same APP_NAME object? true"
                    ],
                    explain: "<p>The numbered lines give the ordering. The static block did not run when the program started — it ran when <code>Config</code> was first touched, and then <strong>once only</strong>, no matter how many instances followed. The constructor ran twice, once per object.</p><p>That is the whole distinction. <code>instances</code> is <code>static</code>, so there is one of it and both objects incremented the same counter to 2. <code>id</code> is an instance field, so there are two of them holding 1 and 2.</p><p>Class loading is lazy, which is worth remembering when a static block does real work: it happens at first use, not at startup.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "reflection-in-java",
            importance: "good-to-know",
            question: "Explain Reflection in Java",
            answer: "<p><strong>🔑 Inspecting and manipulating classes, methods and fields at runtime</strong></p><ul><li><strong>Reflection</strong> (<code>java.lang.reflect</code>) lets code examine and modify the structure and behavior of classes, interfaces, fields, and methods <strong>at runtime</strong>, even without compile-time knowledge of the exact type — starting from a <code>Class&lt;?&gt;</code> object obtained via <code>obj.getClass()</code>, <code>MyClass.class</code>, or <code>Class.forName(name)</code>.</li><li><strong>Capabilities</strong> — enumerate a class's methods/fields/constructors, invoke a method by name (<code>Method.invoke()</code>), read/write a field even if <code>private</code> (via <code>setAccessible(true)</code>), and instantiate objects dynamically.</li><li><strong>Real-world uses</strong> — dependency injection frameworks (Spring, Dagger's annotation processing has largely replaced runtime reflection but earlier DI relied on it), ORMs mapping database columns to fields (Hibernate), JSON libraries (Gson/Jackson) populating POJOs, JUnit discovering <code>@Test</code> methods, and IDE auto-complete/debuggers.</li><li><strong>Trade-offs</strong> — reflective calls are significantly <strong>slower</strong> than direct calls (no JIT inlining, extra security checks), bypass compile-time type safety, and can break encapsulation by accessing <code>private</code> members, which is a security and maintainability concern.</li><li><strong>Android specifics</strong> — heavy reflection use is discouraged since it defeats R8/ProGuard optimization and code shrinking unless explicit keep rules are added, and it's slower on resource-constrained devices.</li></ul><p><strong>🎯 Interview tip:</strong> know a concrete example — Gson using reflection to read a POJO's fields and construct JSON, or JUnit scanning for <code>@Test</code>-annotated methods.</p>",
            referenceLinks: [{ title: "Oracle: The Reflection API", url: "https://docs.oracle.com/javase/tutorial/reflect/index.html" }],
            tags: ["reflection", "runtime", "annotations", "frameworks"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Inspecting and invoking at runtime",
                code: "import java.lang.reflect.Field;\nimport java.lang.reflect.Method;\n\nclass Greeter {\n    private String name = \"unset\";          // private, and about to be written anyway\n\n    public String greet() { return \"Hello, \" + name; }\n\n    private String secret() { return \"private method ran\"; }\n}\n\npublic class ReflectionDemo {\n    public static void main(String[] args) throws Exception {\n        Class<?> clazz = Class.forName(\"Greeter\");\n        Object instance = clazz.getDeclaredConstructor().newInstance();\n\n        System.out.println(\"class      \" + clazz.getName());\n        System.out.println(\"before     \" + ((Greeter) instance).greet());\n\n        Field nameField = clazz.getDeclaredField(\"name\");\n        nameField.setAccessible(true);       // step past private\n        nameField.set(instance, \"Aditya\");\n\n        Method greet = clazz.getMethod(\"greet\");\n        System.out.println(\"after      \" + greet.invoke(instance));\n\n        Method secret = clazz.getDeclaredMethod(\"secret\");\n        secret.setAccessible(true);\n        System.out.println(\"private    \" + secret.invoke(instance));\n\n        // getMethods() sees public members including inherited ones;\n        // getDeclaredMethods() sees this class's own, private included.\n        System.out.println(\"declared methods \" + clazz.getDeclaredMethods().length);\n        System.out.println(\"declared fields  \" + clazz.getDeclaredFields().length);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "class      Greeter",
                        "before     Hello, unset",
                        "after      Hello, Aditya",
                        "private    private method ran",
                        "declared methods 2",
                        "declared fields  1"
                    ],
                    explain: "<p>Nothing here mentions <code>Greeter</code> at compile time — the class arrives as the string <code>\"Greeter\"</code>, and the field and method are looked up by name. That is reflection's whole purpose and its whole cost: it works on types the code has never heard of, and no typo in those strings is caught until it runs.</p><p>Lines three and four are the part to be uneasy about. <code>setAccessible(true)</code> wrote a private field and called a private method from outside the class. Access modifiers are a compile-time contract, and reflection is not bound by it.</p><p>This is how JSON libraries populate your model classes and how test frameworks find methods by annotation. It is also why reflection is slow, breaks under obfuscation, and needs a ProGuard keep rule in an Android build.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "stringbuffer-vs-stringbuilder",
            importance: "must-know",
            question: "What is the difference between StringBuffer and StringBuilder?",
            answer: "<p><strong>🔑 Same mutable-string API, different thread-safety guarantees</strong></p><table><thead><tr><th>Aspect</th><th>StringBuffer</th><th>StringBuilder</th></tr></thead><tbody><tr><td>Thread safety</td><td>Thread-safe — methods are <code>synchronized</code></td><td>Not thread-safe — no synchronization</td></tr><tr><td>Performance</td><td>Slower due to lock acquisition overhead</td><td>Faster — no locking cost</td></tr><tr><td>Introduced</td><td>Java 1.0</td><td>Java 1.5, added as the unsynchronized alternative</td></tr><tr><td>API</td><td>Identical (<code>append</code>, <code>insert</code>, <code>delete</code>, <code>reverse</code>, <code>toString</code>)</td><td>Identical</td></tr><tr><td>When to use</td><td>Shared mutable string built across multiple threads</td><td>Single-threaded string building (the vast majority of cases, e.g. loop concatenation)</td></tr></tbody></table><ul><li>Both are <strong>mutable</strong>, unlike <code>String</code> — <code>append()</code> modifies an internal resizable <code>char[]</code>/<code>byte[]</code> buffer in place instead of allocating a new object each time, making them efficient for repeated concatenation.</li><li><strong>Default choice</strong> — use <code>StringBuilder</code> unless you specifically need cross-thread safety on the same buffer instance; that's rare enough that <code>StringBuffer</code> is largely legacy today.</li></ul>",
            referenceLinks: [{ title: "Oracle: StringBuilder (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/StringBuilder.html" }],
            tags: ["stringbuffer", "stringbuilder", "strings", "thread-safety", "mutability"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Mutating a buffer versus allocating a new String",
                code: "public class StringBuilding {\n    public static void main(String[] args) {\n        // A StringBuilder mutates one buffer and hands the same object back.\n        StringBuilder sb = new StringBuilder(\"a\");\n        StringBuilder returned = sb.append(\"b\");\n        System.out.println(\"append returned the same object? \" + (sb == returned));\n        System.out.println(\"sb is now                        \" + sb);\n\n        // A String cannot be mutated, so every operation allocates.\n        String s = \"a\";\n        String s2 = s.concat(\"b\");\n        System.out.println(\"concat returned a new object?    \" + (s != s2));\n        System.out.println(\"s is still                       \" + s);\n\n        StringBuilder builder = new StringBuilder();\n        for (int i = 0; i < 5; i++) builder.append(i).append(\",\");   // one buffer\n        System.out.println(\"StringBuilder ->                 \" + builder);\n\n        String concat = \"\";\n        for (int i = 0; i < 5; i++) concat += i + \",\";               // 5 throwaway Strings\n        System.out.println(\"String +=     ->                 \" + concat);\n        System.out.println(\"identical text?                  \" + builder.toString().equals(concat));\n\n        // StringBuffer is the synchronized twin: same API, slower when unshared.\n        StringBuffer buffer = new StringBuffer(\"abc\");\n        System.out.println(\"StringBuffer  ->                 \" + buffer.append(\"def\"));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "append returned the same object? true",
                        "sb is now                        ab",
                        "concat returned a new object?    true",
                        "s is still                       a",
                        "StringBuilder ->                 0,1,2,3,4,",
                        "String +=     ->                 0,1,2,3,4,",
                        "identical text?                  true",
                        "StringBuffer  ->                 abcdef"
                    ],
                    explain: "<p>The first four lines are the difference, stated as identity. <code>append</code> handed back <em>the same object</em> it was called on, having changed it in place. <code>concat</code> handed back a different object and left the original alone.</p><p>The two loops then produce identical text by very different means. The <code>StringBuilder</code> wrote into one growing buffer. The <code>+=</code> loop built a new <code>String</code> on every pass and threw the previous one away — five here, but a thousand iterations means a thousand allocations and copies, which is how an <code>O(n)</code> job becomes <code>O(n²)</code>.</p><p><code>StringBuffer</code> has the identical API and synchronises every method. That costs something and buys nothing unless the buffer is genuinely shared between threads, which is why <code>StringBuilder</code> is the default.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "dependency-injection-in-java",
            importance: "should-know",
            question: "What is Dependency Injection?",
            answer: "<p><strong>🔑 Supplying an object's dependencies from outside instead of letting it construct them itself</strong></p><ul><li><strong>Dependency Injection (DI)</strong> is a technique implementing the Dependency Inversion Principle — a class declares what it needs (via constructor, field, or setter parameters) and an external party (caller, framework/IoC container) supplies concrete implementations, instead of the class instantiating its own dependencies with <code>new</code>.</li><li><strong>Three common forms</strong> — <strong>constructor injection</strong> (preferred — dependencies are required and immutable, enables <code>final</code> fields), <strong>setter injection</strong> (optional/reconfigurable dependencies), and <strong>field injection</strong> (least testable — hides dependencies, common in older annotation-based frameworks).</li><li><strong>Frameworks</strong> — on Android, <strong>Dagger</strong>/<strong>Hilt</strong> generate DI wiring at compile time (no runtime reflection cost); Spring in backend Java typically wires beans via reflection/annotations at startup.</li><li><strong>Benefit</strong> — swapping a real <code>UserRepository</code> for a fake/mock in unit tests becomes trivial, since the class never hardcodes which implementation it uses.</li><li><strong>DI vs Service Locator</strong> — DI pushes dependencies <em>in</em> explicitly; a Service Locator has the class pull dependencies <em>out</em> of a global registry, which is generally considered an anti-pattern since dependencies become hidden.</li></ul><p><strong>🎯 Interview tip:</strong> tie this back to SOLID — DI is the standard mechanism for satisfying the Dependency Inversion Principle in real code.</p>",
            referenceLinks: [{ title: "Android Developers: Dependency injection", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["dependency-injection", "di", "dagger", "hilt", "solid"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Constructor injection, and why tests need it",
                code: "interface Clock {\n    long now();\n}\n\nclass SystemClock implements Clock {\n    public long now() { return System.currentTimeMillis(); }   // real, unpredictable\n}\n\nclass FixedClock implements Clock {\n    private final long fixed;\n    FixedClock(long fixed) { this.fixed = fixed; }\n    public long now() { return fixed; }                        // a test can assert on this\n}\n\n// Without DI: the dependency is welded in and cannot be replaced.\nclass ReceiptPrinterBad {\n    private final Clock clock = new SystemClock();\n    String print(String item) { return item + \" at \" + clock.now(); }\n}\n\n// With DI: the dependency arrives through the constructor.\nclass ReceiptPrinter {\n    private final Clock clock;\n    ReceiptPrinter(Clock clock) { this.clock = clock; }\n    String print(String item) { return item + \" at \" + clock.now(); }\n}\n\npublic class DependencyInjection {\n    public static void main(String[] args) {\n        ReceiptPrinter printer = new ReceiptPrinter(new FixedClock(1_700_000_000_000L));\n        System.out.println(printer.print(\"coffee\"));\n        System.out.println(printer.print(\"tea\"));\n\n        // The same object, given a different collaborator.\n        ReceiptPrinter other = new ReceiptPrinter(new FixedClock(0L));\n        System.out.println(other.print(\"coffee\"));\n\n        // The hardcoded version can only ever be tested against the real clock.\n        String hardcoded = new ReceiptPrinterBad().print(\"coffee\");\n        System.out.println(\"hardcoded output is assertable? \" + hardcoded.equals(\"coffee at 0\"));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "coffee at 1700000000000",
                        "tea at 1700000000000",
                        "coffee at 0",
                        "hardcoded output is assertable? false"
                    ],
                    explain: "<p>The first three lines print exact, repeatable timestamps for something that reads the clock — which is only possible because the clock arrived through the constructor and the caller supplied a fixed one.</p><p>The last line is <code>ReceiptPrinterBad</code>, which builds its own <code>SystemClock</code>. Its output contains the current time, so there is no value a test could assert against; it changes every millisecond. The dependency is not merely awkward to replace, it is unreachable.</p><p>This is the practical case for DI, and it needs no framework. Dagger and Hilt automate the wiring; the testability comes from the constructor parameter.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "marker-interface-in-java",
            importance: "good-to-know",
            question: "What is a marker interface in Java?",
            answer: "<p><strong>🔑 An empty interface used purely as a runtime type tag</strong></p><ul><li>A <strong>marker interface</strong> declares <strong>no methods or fields</strong> — its only purpose is to mark implementing classes with a piece of metadata that code can check via <code>instanceof</code> at runtime.</li><li><strong>Standard JDK examples</strong> — <code>Serializable</code> (tells the JVM this object may be serialized), <code>Cloneable</code> (enables <code>Object.clone()</code> to work instead of throwing <code>CloneNotSupportedException</code>), <code>RandomAccess</code> (tells algorithms a <code>List</code> supports fast random-access indexing, e.g. <code>ArrayList</code> vs <code>LinkedList</code>).</li><li><strong>How it's used</strong> — framework code does <code>if (obj instanceof Serializable)</code> to decide whether to allow an operation, since there's no method to call — the type itself is the signal.</li><li><strong>Modern alternative</strong> — since Java 5, <strong>annotations</strong> (e.g. a custom <code>@Entity</code>) are generally preferred over marker interfaces because they can carry additional metadata (parameters) and be applied to more targets (fields, methods), not just types.</li></ul>",
            referenceLinks: [{ title: "Oracle: Serializable (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Serializable.html" }],
            tags: ["marker-interface", "serializable", "cloneable", "annotations", "interfaces"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "An interface with nothing in it",
                code: "import java.io.Serializable;\n\nclass Report implements Serializable { }   // no methods added — the type IS the signal\n\nclass Draft { }                            // not marked\n\npublic class MarkerInterface {\n\n    static String persist(Object obj) {\n        if (obj instanceof Serializable) {\n            return \"ok, safe to hand to ObjectOutputStream\";\n        }\n        return \"refused: \" + obj.getClass().getSimpleName() + \" is not Serializable\";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"Report : \" + persist(new Report()));\n        System.out.println(\"Draft  : \" + persist(new Draft()));\n\n        // The interface really is empty; it carries no behaviour at all.\n        System.out.println(\"methods on Serializable: \" + Serializable.class.getMethods().length);\n\n        // Several JDK types are marked this way.\n        System.out.println(\"String  serializable? \" + (\"x\" instanceof Serializable));\n        System.out.println(\"Integer serializable? \" + (Integer.valueOf(1) instanceof Serializable));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Report : ok, safe to hand to ObjectOutputStream",
                        "Draft  : refused: Draft is not Serializable",
                        "methods on Serializable: 0",
                        "String  serializable? true",
                        "Integer serializable? true"
                    ],
                    explain: "<p><code>Serializable</code> declares <strong>zero methods</strong> — the third line is that fact, measured. Implementing it adds no behaviour whatsoever. The only thing it changes is the answer to <code>instanceof</code>, and that answer is the entire point: the type itself is the metadata.</p><p>This is the pre-annotation way of tagging a class, and it survives because the tag is checkable at compile time in a way an annotation is not. Modern code would usually reach for an annotation instead, but <code>Serializable</code>, <code>Cloneable</code> and <code>RandomAccess</code> are all still markers.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "comparable-vs-comparator",
            importance: "should-know",
            question: "What is the difference between Comparable and Comparator?",
            answer: "<p><strong>🔑 One natural ordering defined by the class itself vs unlimited external orderings</strong></p><table><thead><tr><th>Aspect</th><th>Comparable</th><th>Comparator</th></tr></thead><tbody><tr><td>Package</td><td><code>java.lang</code></td><td><code>java.util</code></td></tr><tr><td>Method</td><td><code>int compareTo(T other)</code></td><td><code>int compare(T a, T b)</code></td></tr><tr><td>Implemented by</td><td>The class being compared, defining its own natural order</td><td>A separate class/lambda, external to the type being compared</td></tr><tr><td>How many orderings</td><td>Exactly one — the &quot;natural order&quot;</td><td>Unlimited — define as many comparators as needed (by name, by age, reversed, ...)</td></tr><tr><td>Used by</td><td><code>Collections.sort(list)</code>, <code>TreeSet</code>/<code>TreeMap</code> with no explicit comparator</td><td><code>Collections.sort(list, comparator)</code>, <code>list.sort(comparator)</code>, <code>Stream.sorted(comparator)</code></td></tr></tbody></table><ul><li>Implement <code>Comparable</code> when there's one obvious default ordering for a type (e.g. <code>Integer</code> sorts numerically); use <code>Comparator</code> for alternate or ad-hoc orderings without modifying the class.</li><li>Java 8+ makes building comparators concise via <code>Comparator.comparing(...)</code>, chainable with <code>.thenComparing(...)</code> and <code>.reversed()</code>.</li></ul>",
            referenceLinks: [{ title: "Oracle: Comparator (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Comparator.html" }],
            tags: ["comparable", "comparator", "sorting", "collections"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Natural order, custom orders, and sort stability",
                code: "import java.util.ArrayList;\nimport java.util.Collections;\nimport java.util.Comparator;\nimport java.util.List;\n\nclass Person implements Comparable<Person> {\n    final String name;\n    final int age;\n    Person(String name, int age) { this.name = name; this.age = age; }\n\n    @Override public int compareTo(Person other) {     // the natural order: by age\n        return Integer.compare(this.age, other.age);\n    }\n\n    @Override public String toString() { return name + \"(\" + age + \")\"; }\n}\n\npublic class ComparableVsComparator {\n    public static void main(String[] args) {\n        List<Person> people = new ArrayList<>(List.of(\n            new Person(\"Sam\", 31),\n            new Person(\"Aditya\", 29),\n            new Person(\"Riya\", 31),\n            new Person(\"Bina\", 29)\n        ));\n        System.out.println(\"as built        \" + people);\n\n        Collections.sort(people);                       // uses Comparable\n        System.out.println(\"natural (age)   \" + people);\n\n        people.sort(Comparator.comparing((Person p) -> p.name));\n        System.out.println(\"by name         \" + people);\n\n        people.sort(Comparator.comparingInt((Person p) -> p.age)\n                              .thenComparing(p -> p.name));\n        System.out.println(\"age, then name  \" + people);\n\n        people.sort(Comparator.comparingInt((Person p) -> p.age).reversed());\n        System.out.println(\"age descending  \" + people);\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "as built        [Sam(31), Aditya(29), Riya(31), Bina(29)]",
                        "natural (age)   [Aditya(29), Bina(29), Sam(31), Riya(31)]",
                        "by name         [Aditya(29), Bina(29), Riya(31), Sam(31)]",
                        "age, then name  [Aditya(29), Bina(29), Riya(31), Sam(31)]",
                        "age descending  [Riya(31), Sam(31), Aditya(29), Bina(29)]"
                    ],
                    explain: "<p><code>Comparable</code> is the one order a class carries with it — here, by age, which is what <code>Collections.sort</code> used without being told anything. <code>Comparator</code> is an order supplied from outside, and there can be as many as you like, including for classes you do not own.</p><p>Compare lines two and four closely: both sort by age, and <strong>Sam and Riya swap places</strong>. Sorting by age alone left the two 31s in the order they were built, because Java's sort is <em>stable</em> — equal elements keep their relative positions. Adding <code>.thenComparing(name)</code> replaced that accident with a rule.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "enum-in-java",
            importance: "should-know",
            question: "What is an enum in Java?",
            answer: "<p><strong>🔑 A type-safe, fixed set of named constants that is really a special class</strong></p><ul><li>An <strong>enum</strong> defines a fixed set of constant instances of a type — declared with <code>enum</code> instead of <code>class</code> — giving compile-time type safety that plain <code>int</code> or <code>String</code> constants don't (the compiler rejects any value outside the defined set).</li><li><strong>It's a real class under the hood</strong> — implicitly extends <code>java.lang.Enum</code>, can have fields, constructors (implicitly <code>private</code>), methods, and even <strong>per-constant method bodies</strong> for constant-specific behavior.</li><li><strong>Built-in capabilities</strong> — <code>values()</code> returns all constants in declaration order, <code>valueOf(String)</code> parses a constant by name (throws <code>IllegalArgumentException</code> if not found), <code>ordinal()</code> gives its declaration-order index, and enums work naturally in a <code>switch</code> statement.</li><li><strong>Collections support</strong> — <code>EnumMap</code> and <code>EnumSet</code> are highly optimized (array-backed) collections designed specifically for enum keys/elements.</li><li><strong>Singleton pattern</strong> — a single-constant enum (<code>enum Singleton { INSTANCE; }</code>) is considered the safest way to implement a Singleton in Java, since it's inherently serialization-safe and reflection-attack-resistant.</li></ul><p><strong>🎯 Interview tip:</strong> mention the single-constant-enum singleton trick — it's a favorite &quot;did you know&quot; follow-up.</p>",
            referenceLinks: [{ title: "Oracle: Enum Types", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html" }],
            tags: ["enum", "type-safety", "constants", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Enums with behaviour, fields, and safe ==",
                code: "import java.util.Arrays;\n\nenum Operation {\n    ADD      { public int apply(int a, int b) { return a + b; } },\n    SUBTRACT { public int apply(int a, int b) { return a - b; } };\n\n    public abstract int apply(int a, int b);      // per-constant behaviour\n}\n\nenum Planet {\n    MERCURY(3.3e23), EARTH(5.9e24);\n\n    private final double mass;                    // enums may hold fields\n    Planet(double mass) { this.mass = mass; }     // constructor is implicitly private\n    double getMass() { return mass; }\n}\n\npublic class EnumInJava {\n    public static void main(String[] args) {\n        System.out.println(\"ADD.apply(2, 3)      = \" + Operation.ADD.apply(2, 3));\n        System.out.println(\"SUBTRACT.apply(2, 3) = \" + Operation.SUBTRACT.apply(2, 3));\n\n        System.out.println(\"values()             = \" + Arrays.toString(Operation.values()));\n        System.out.println(\"valueOf(\\\"ADD\\\")       = \" + Operation.valueOf(\"ADD\"));\n        System.out.println(\"ADD.ordinal()        = \" + Operation.ADD.ordinal());\n\n        System.out.println(\"EARTH mass           = \" + Planet.EARTH.getMass());\n\n        // Constants are singletons, so == is safe here — unlike everywhere else.\n        Planet earth = Planet.valueOf(\"EARTH\");\n        System.out.println(\"EARTH == valueOf     \" + (earth == Planet.EARTH));\n\n        switch (earth) {\n            case EARTH: System.out.println(\"switch matched EARTH\"); break;\n            default:    System.out.println(\"switch matched something else\");\n        }\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "ADD.apply(2, 3)      = 5",
                        "SUBTRACT.apply(2, 3) = -1",
                        "values()             = [ADD, SUBTRACT]",
                        "valueOf(\"ADD\")       = ADD",
                        "ADD.ordinal()        = 0",
                        "EARTH mass           = 5.9E24",
                        "EARTH == valueOf     true",
                        "switch matched EARTH"
                    ],
                    explain: "<p>A Java enum is a class, not a list of names. <code>ADD</code> and <code>SUBTRACT</code> each supply their own <code>apply</code> body, so the enum dispatches like any other polymorphic type and the caller never writes a <code>switch</code>. <code>Planet</code> shows the other half: enum constants may hold fields, set by a constructor that is implicitly private.</p><p><code>EARTH == valueOf(\"EARTH\")</code> is <strong>true</strong>, and this is the one place in Java where comparing objects with <code>==</code> is not just safe but preferred — the JVM guarantees exactly one instance per constant. It is also why an enum is the correct singleton.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "autoboxing-and-unboxing",
            importance: "should-know",
            question: "What is Autoboxing and Unboxing in Java?",
            answer: "<p><strong>🔑 Automatic conversion between primitives and their wrapper objects</strong></p><ul><li><strong>Autoboxing</strong> — the compiler automatically converts a primitive value into its corresponding wrapper object where an object is required, e.g. assigning an <code>int</code> to an <code>Integer</code> variable, or adding an <code>int</code> to a <code>List&lt;Integer&gt;</code>.</li><li><strong>Unboxing</strong> — the reverse: automatically extracting the primitive value from a wrapper object, e.g. using an <code>Integer</code> in an arithmetic expression or an <code>if</code> condition expecting a <code>boolean</code>.</li><li><strong>Why it exists</strong> — generics and collections only work with objects (<code>List&lt;int&gt;</code> is illegal), so autoboxing lets you write natural-looking code like <code>list.add(5)</code> without manually calling <code>Integer.valueOf(5)</code>.</li><li><strong>Performance pitfall</strong> — boxing/unboxing inside tight loops (e.g. <code>Long sum = 0L; for (...) sum += i;</code>) creates a new wrapper object on every iteration, which is far slower than using the primitive directly.</li><li><strong>NPE pitfall</strong> — unboxing a <code>null</code> wrapper (e.g. a <code>Map</code> lookup that returned <code>null</code>, then used in arithmetic) throws <code>NullPointerException</code> at the unboxing point, which can be non-obvious in generated bytecode.</li><li><strong>Integer caching interacts with this</strong> — autoboxed values in the range -128..127 reuse cached <code>Integer</code> instances (see the Integer caching question), which affects <code>==</code> comparisons.</li></ul>",
            referenceLinks: [{ title: "Oracle: Autoboxing and Unboxing", url: "https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html" }],
            tags: ["autoboxing", "unboxing", "wrapper-classes", "primitives", "performance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Autoboxing, the remove() trap, and wrapper identity",
                code: "import java.util.ArrayList;\nimport java.util.List;\n\npublic class AutoboxingAndUnboxing {\n    public static void main(String[] args) {\n        List<Integer> list = new ArrayList<>();\n        list.add(5);              // autobox: int -> Integer\n        int x = list.get(0);      // unbox:   Integer -> int\n        System.out.println(\"round trip = \" + x);\n\n        // The classic overload trap: List has remove(int index) AND remove(Object).\n        List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));\n        nums.remove(1);                      // int -> remove BY INDEX\n        System.out.println(\"after remove(1)                = \" + nums);\n\n        List<Integer> again = new ArrayList<>(List.of(10, 20, 30));\n        again.remove(Integer.valueOf(10));   // Object -> remove BY VALUE\n        System.out.println(\"after remove(Integer.valueOf(10)) = \" + again);\n\n        // Arithmetic on a wrapper unboxes, adds, and boxes the result again.\n        Long boxedSum = 0L;\n        for (long i = 1; i <= 5; i++) boxedSum += i;\n        System.out.println(\"boxedSum   = \" + boxedSum + \" (a \" + boxedSum.getClass().getSimpleName() + \")\");\n\n        long fastSum = 0L;\n        for (long i = 1; i <= 5; i++) fastSum += i;\n        System.out.println(\"fastSum    = \" + fastSum + \" (a primitive long)\");\n\n        // And because they are objects, == compares identity, not value.\n        Long m = 1000L, n = 1000L;\n        System.out.println(\"m == n     \" + (m == n));\n        System.out.println(\"m.equals(n) \" + m.equals(n));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "round trip = 5",
                        "after remove(1)                = [10, 30]",
                        "after remove(Integer.valueOf(10)) = [20, 30]",
                        "boxedSum   = 15 (a Long)",
                        "fastSum    = 15 (a primitive long)",
                        "m == n     false",
                        "m.equals(n) true"
                    ],
                    explain: "<p>Lines two and three are the trap. <code>List</code> has both <code>remove(int index)</code> and <code>remove(Object)</code>, and autoboxing does <em>not</em> happen when an exact primitive overload already matches. So <code>nums.remove(1)</code> removed the element at <strong>index 1</strong> — the value 20 — while <code>remove(Integer.valueOf(10))</code> removed the <strong>value</strong> 10. Same method name, same-looking argument, entirely different operation.</p><p>The <code>boxedSum</code> loop looks identical to the primitive one and is not: each <code>+=</code> unboxes, adds, and allocates a new <code>Long</code>. Over a million iterations that is a million short-lived objects, which is why the type of an accumulator is worth a glance.</p><p>The last pair is the reason to distrust <code>==</code> on wrappers entirely — see the Integer cache question for why 1000 behaves differently from 100.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "varargs-in-java",
            importance: "good-to-know",
            question: "What are varargs in Java?",
            answer: "<p><strong>🔑 A method parameter that accepts zero or more arguments as an array</strong></p><ul><li><strong>Varargs</strong> (<code>Type... name</code>) let a method accept a variable number of arguments of the same type without the caller having to wrap them in an explicit array — introduced in Java 5.</li><li><strong>Under the hood</strong> — the compiler treats a varargs parameter as an array (<code>Type[]</code>); callers can pass individual arguments (<code>sum(1, 2, 3)</code>), an existing array (<code>sum(new int[]{1,2,3})</code>), or nothing at all (<code>sum()</code>, which passes a zero-length array).</li><li><strong>Rules</strong> — a method can have at most one varargs parameter, and it must be the <strong>last</strong> parameter in the signature.</li><li><strong>Overload resolution</strong> — the compiler prefers an exact-match non-varargs overload over a varargs one if both are applicable, and prefers a more specific varargs match over a boxing/widening one.</li><li><strong>Well-known JDK examples</strong> — <code>String.format(String fmt, Object... args)</code>, <code>List.of(E... elements)</code>, <code>Arrays.asList(T... a)</code>.</li><li><strong>Pitfall</strong> — mixing generics with varargs (<code>List&lt;String&gt;... lists</code>) can produce &quot;heap pollution&quot; compiler warnings, since arrays and generics interact unsafely due to type erasure.</li></ul>",
            referenceLinks: [{ title: "Oracle: Arbitrary Number of Arguments", url: "https://docs.oracle.com/javase/tutorial/java/javaOO/arguments.html#varargs" }],
            tags: ["varargs", "methods", "arrays", "java-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Varargs is an array with nicer call sites",
                code: "public class VarargsInJava {\n\n    static int sum(int... numbers) {          // compiled as int[] numbers\n        int total = 0;\n        for (int n : numbers) total += n;\n        return total;\n    }\n\n    static String describe(String label, int... values) {   // varargs must come last\n        return label + \" got \" + values.length + \" value(s)\";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"sum()               = \" + sum());\n        System.out.println(\"sum(1, 2, 3)        = \" + sum(1, 2, 3));\n        System.out.println(\"sum(new int[]{4,5}) = \" + sum(new int[]{4, 5}));\n\n        System.out.println(describe(\"none\"));\n        System.out.println(describe(\"three\", 1, 2, 3));\n\n        // Inside the method it is an ordinary array — including when empty.\n        System.out.println(\"empty call is an array, not null: \" + (sum() == 0));\n        System.out.println(String.format(\"%s scored %d\", \"Aditya\", 42));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "sum()               = 0",
                        "sum(1, 2, 3)        = 6",
                        "sum(new int[]{4,5}) = 9",
                        "none got 0 value(s)",
                        "three got 3 value(s)",
                        "empty call is an array, not null: true",
                        "Aditya scored 42"
                    ],
                    explain: "<p>All three calls reach the same method, because <code>int... numbers</code> <em>is</em> <code>int[] numbers</code> with the compiler wrapping loose arguments for you. That is why passing a ready-made array works with no extra syntax.</p><p>The sixth line is the detail worth knowing: calling with no arguments gives an <strong>empty array, never null</strong>, so iterating a varargs parameter needs no null check. <code>String.format</code> at the end is the same mechanism — it is why one method signature accepts any number of substitutions.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "integer-caching-wrapper-classes",
            importance: "should-know",
            question: "Why does Java cache Integer values from -128 to 127 (Integer caching)?",
            answer: "<p><strong>🔑 A memory/performance optimization for the most commonly used small values</strong></p><ul><li><strong>Integer caching</strong> — <code>Integer.valueOf(int)</code> (which autoboxing calls internally) maintains a private static cache of <code>Integer</code> objects for values <strong>-128 to 127</strong> and returns a <strong>shared cached instance</strong> for values in that range instead of allocating a new object every time.</li><li><strong>Why this range</strong> — small integers are used extremely frequently (loop counters, small collection sizes), so reusing them avoids a huge number of redundant tiny object allocations; -128..127 was chosen as a reasonable default and is <strong>guaranteed</strong> by the JVM spec, though the upper bound can be raised via <code>-XX:AutoBoxCacheMax</code>.</li><li><strong>Other wrapper classes</strong> cache similarly — <code>Byte</code>, <code>Short</code>, <code>Long</code> cache -128..127; <code>Character</code> caches 0..127; <code>Boolean</code> caches both <code>TRUE</code>/<code>FALSE</code>.</li><li><strong>The == trap</strong> — because of caching, <code>Integer a = 100; Integer b = 100; a == b</code> is <code>true</code> (same cached object), but <code>Integer a = 200; Integer b = 200; a == b</code> is <code>false</code> (outside the cache, two distinct objects) — a classic interview gotcha showing why <code>==</code> should never be used to compare wrapper objects.</li><li><code>new Integer(100)</code> always bypasses the cache and allocates a fresh object (this constructor is deprecated since Java 9 for exactly this reason).</li></ul><p><strong>🎯 Interview tip:</strong> this question is almost always paired with a &quot;what does this code print&quot; snippet comparing two boxed values with <code>==</code> just outside and just inside the cache range.</p>",
            referenceLinks: [{ title: "Oracle: Integer.valueOf() (Java SE 17)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Integer.html#valueOf(int)" }],
            tags: ["integer-caching", "wrapper-classes", "autoboxing", "equals-vs-double-equals"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "The Integer cache boundary",
                code: "public class IntegerCaching {\n    public static void main(String[] args) {\n        Integer a = 100, b = 100;\n        System.out.println(\"100 == 100   \" + (a == b));   // served from the cache\n\n        Integer c = 200, d = 200;\n        System.out.println(\"200 == 200   \" + (c == d));   // outside it, so new objects\n        System.out.println(\"200.equals   \" + c.equals(d));\n\n        // The cache covers -128..127, so the flip happens between these two.\n        Integer e = 127, f = 127;\n        Integer g = 128, h = 128;\n        System.out.println(\"127 == 127   \" + (e == f));\n        System.out.println(\"128 == 128   \" + (g == h));\n\n        // new Integer(...) always allocates, which is why it is deprecated.\n        Integer i = Integer.valueOf(100);\n        Integer j = new Integer(100);\n        System.out.println(\"valueOf == new \" + (i == j));\n\n        // Other wrappers cache too. Character caches 0..127, Boolean caches both.\n        Character p = 'A', q = 'A';\n        Boolean r = true, s = true;\n        System.out.println(\"'A' == 'A'   \" + (p == q));\n        System.out.println(\"true == true \" + (r == s));\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "100 == 100   true",
                        "200 == 200   false",
                        "200.equals   true",
                        "127 == 127   true",
                        "128 == 128   false",
                        "valueOf == new false",
                        "'A' == 'A'   true",
                        "true == true true"
                    ],
                    explain: "<p>The middle pair is the whole question. <code>127 == 127</code> is <strong>true</strong> and <code>128 == 128</code> is <strong>false</strong>, with nothing changed but the number. Autoboxing calls <code>Integer.valueOf</code>, which hands back a shared instance for <code>-128..127</code> and allocates a new one above that. So <code>==</code> — which compares identity — succeeds inside the cache and fails one step outside it.</p><p>This is the most dangerous kind of bug: code that compares boxed integers with <code>==</code> works perfectly on small test values and fails in production on real ones.</p><p><code>new Integer(100)</code> bypasses the cache and always allocates, which is why it is deprecated. <code>Character</code> and <code>Boolean</code> cache too, so the same trap exists with a friendlier failure mode.</p>"
                }
            }],
            subsection: "others-java"
        },
        {
            id: "diamond-problem-default-methods",
            importance: "should-know",
            question: "How does Java resolve the Diamond Problem with default methods in interfaces?",
            answer: "<p><strong>🔑 The most specific interface wins; true ties must be resolved explicitly</strong></p><ul><li>Since Java 8, interfaces can have <code>default</code> methods with a body — if a class implements two interfaces that each declare a <strong>default method with the same signature</strong>, the compiler must decide which one applies (the classic &quot;diamond problem&quot;).</li><li><strong>Rule 1 — most specific interface wins</strong> — if one interface extends the other, the more specific (sub-)interface's default implementation is used automatically, no ambiguity.</li><li><strong>Rule 2 — unrelated interfaces cause a compile error</strong> — if two <strong>unrelated</strong> interfaces both declare the same default method, the implementing class gets a <strong>compile-time error</strong> (not a silent runtime choice) and must override the method itself to resolve the conflict.</li><li><strong>Resolving explicitly</strong> — inside the override, you can pick a specific parent's implementation using <code>InterfaceName.super.methodName()</code> syntax, or provide entirely new logic.</li><li><strong>Why this is safer than C++</strong> — because Java interfaces (still) carry no instance state, the ambiguity is limited to behavior, not duplicated data fields, and the compiler forces the developer to make the choice explicit rather than picking silently.</li></ul>",
            referenceLinks: [{ title: "Oracle: Default Methods", url: "https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html" }],
            tags: ["diamond-problem", "default-methods", "interfaces", "java8"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "java",
                title: "Resolving two inherited defaults",
                code: "interface A {\n    default String greet() { return \"Hello from A\"; }\n}\n\ninterface B {\n    default String greet() { return \"Hello from B\"; }\n}\n\n// Inheriting the same default from two places is a compile error until the\n// class says which one it means.\nclass C implements A, B {\n    @Override\n    public String greet() {\n        return A.super.greet() + \" and \" + B.super.greet();\n    }\n}\n\nclass OnlyA implements A { }      // no conflict, so no override needed\n\npublic class DiamondDefaults {\n    public static void main(String[] args) {\n        System.out.println(\"C.greet()     = \" + new C().greet());\n        System.out.println(\"OnlyA.greet() = \" + new OnlyA().greet());\n\n        A asA = new C();\n        B asB = new C();\n        System.out.println(\"through A     = \" + asA.greet());\n        System.out.println(\"through B     = \" + asB.greet());\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "C.greet()     = Hello from A and Hello from B",
                        "OnlyA.greet() = Hello from A",
                        "through A     = Hello from A and Hello from B",
                        "through B     = Hello from A and Hello from B"
                    ],
                    explain: "<p>Default methods gave interfaces implementations, which gave Java a version of the diamond problem it had avoided for twenty years. Two interfaces, one method name, both with bodies — and the compiler refuses to pick. <code>C</code> does not compile until it overrides <code>greet()</code>, and <code>A.super.greet()</code> is the syntax for reaching a specific one.</p><p><code>OnlyA</code> shows the rule is narrow: with one source of the default there is no ambiguity and no override needed.</p><p>The last two lines are the reassurance. Whichever interface you view the object through, the object's own method runs. The conflict is resolved once, at the class, not per call site.</p>"
                }
            }],
            subsection: "others-java"
        }
    ]
};
