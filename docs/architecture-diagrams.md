# IBM Equal Access Toolkit - Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Core Engine"
        Engine[accessibility-checker-engine<br/>JavaScript/TypeScript<br/>Rules & Evaluation Engine]
    end
    
    subgraph "Browser Extensions (Same Codebase)"
        Extensions[Browser Extensions<br/>Chrome / Edge / Firefox<br/>DevTools Integration<br/>Bundled Engine & Rules]
    end
    
    subgraph "Node.js Testing Tools"
        NodeChecker[accessibility-checker<br/>Node.js Package]
        CypressChecker[cypress-accessibility-checker<br/>Cypress Plugin]
        KarmaChecker[karma-accessibility-checker<br/>Karma Plugin]
    end
    
    subgraph "Java Testing Tools"
        JavaChecker[java-accessibility-checker<br/>Maven Package]
    end
    
    subgraph "Test Frameworks & Environments"
        Selenium[Selenium WebDriver]
        Puppeteer[Puppeteer]
        Playwright[Playwright]
        WebDriverIO[WebDriverIO]
        Jest[Jest]
        Cypress[Cypress]
        Karma[Karma]
        JUnit[JUnit]
    end
    
    subgraph "Distribution"
        RuleServer[rule-server<br/>Help Documentation]
        CDN[jsdelivr.net CDN<br/>Engine Distribution]
    end
    
    subgraph "Common Components"
        CommonModule[common/module<br/>Config & Report Components]
        ReportReact[report-react<br/>HTML Report Generation]
    end
    
    Engine -->|bundled with| Extensions
    Engine -->|published to| CDN
    
    CDN -->|loads engine| NodeChecker
    CDN -->|loads engine| CypressChecker
    CDN -->|loads engine| KarmaChecker
    CDN -->|loads engine| JavaChecker
    
    RuleServer -->|serves help files| Extensions
    
    CommonModule -->|config & reporting<br/>components| NodeChecker
    CommonModule -->|config & reporting<br/>components| CypressChecker
    CommonModule -->|config & reporting<br/>components| KarmaChecker
    
    ReportReact -->|HTML report<br/>generation| CommonModule
    CommonModule -->|includes| ReportReact
    
    NodeChecker -->|integrates with| Selenium
    NodeChecker -->|integrates with| Puppeteer
    NodeChecker -->|integrates with| Playwright
    NodeChecker -->|integrates with| WebDriverIO
    NodeChecker -->|integrates with| Jest
    
    CypressChecker -->|integrates with| Cypress
    
    KarmaChecker -->|integrates with| Karma
    
    JavaChecker -->|integrates with| Selenium
    JavaChecker -->|integrates with| JUnit
    
    style Engine fill:#e1f5ff,stroke:#0062ff,stroke-width:3px
    style CDN fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    style RuleServer fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    style CommonModule fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style ReportReact fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## 2. accessibility-checker-engine Architecture

```mermaid
graph TB
    subgraph "Engine Core"
        Rules[Accessibility Rules<br/>WCAG 2.1/2.2 Compliance]
        Checker[Checker API<br/>Scan Orchestration]
        Mapper[DOM Mapper<br/>Element Analysis]
        Simulator[Simulator<br/>Render Tree Analysis]
    end
    
    subgraph "Build Outputs"
        AceJS[ace.js<br/>Browser Production]
        AceDebugJS[ace-debug.js<br/>Browser Development]
        AceNodeJS[ace-node.js<br/>Node.js Production]
        AceNodeDebugJS[ace-node-debug.js<br/>Node.js Development]
    end
    
    subgraph "Interfaces"
        IChecker[IChecker Interface]
        IEngine[IEngine Interface]
        IRule[IRule Interface]
        IRuleset[IRuleset Interface]
        IReport[IReport Interface]
    end
    
    Rules --> Checker
    Mapper --> Checker
    Simulator --> Checker
    
    Checker --> AceJS
    Checker --> AceDebugJS
    Checker --> AceNodeJS
    Checker --> AceNodeDebugJS
    
    IChecker -.defines.-> Checker
    IEngine -.defines.-> Checker
    IRule -.defines.-> Rules
    IRuleset -.defines.-> Rules
    IReport -.defines.-> Checker
    
    style Rules fill:#ffebee,stroke:#c62828,stroke-width:2px
    style Checker fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

## 3. accessibility-checker (Node) Architecture

```mermaid
graph TB
    subgraph "Public API"
        ACChecker[aChecker API<br/>Main Entry Point]
        ACConfig[ACConfigManager<br/>Configuration]
    end
    
    subgraph "Core Components"
        EngineManager[ACEngineManager<br/>Engine Lifecycle]
        ReporterManager[ReporterManager<br/>Report Generation]
        BaselineManager[BaselineManager<br/>Baseline Comparison]
    end
    
    subgraph "Reporters"
        JSONReporter[ACReporterJSON]
        HTMLReporter[ACReporterHTML]
        CSVReporter[ACReporterCSV]
        XLSXReporter[ACReporterXLSX]
        MetricsReporter[ACReporterMetrics]
    end
    
    subgraph "Integration Layer"
        SeleniumInt[Selenium Integration]
        PuppeteerInt[Puppeteer Integration]
        PlaywrightInt[Playwright Integration]
        WebDriverIOInt[WebDriverIO Integration]
        JestInt[Jest Integration]
        LocalScan[Local File Scanner]
    end
    
    subgraph "Engine (from CDN)"
        ACEngine[accessibility-checker-engine<br/>ace-node.js<br/>Loaded from jsdelivr.net]
    end
    
    ACChecker --> ACConfig
    ACChecker --> EngineManager
    ACChecker --> ReporterManager
    ACChecker --> BaselineManager
    
    EngineManager --> ACEngine
    
    ReporterManager --> JSONReporter
    ReporterManager --> HTMLReporter
    ReporterManager --> CSVReporter
    ReporterManager --> XLSXReporter
    ReporterManager --> MetricsReporter
    
    ACChecker --> SeleniumInt
    ACChecker --> PuppeteerInt
    ACChecker --> PlaywrightInt
    ACChecker --> WebDriverIOInt
    ACChecker --> JestInt
    ACChecker --> LocalScan
    
    SeleniumInt --> EngineManager
    PuppeteerInt --> EngineManager
    PlaywrightInt --> EngineManager
    WebDriverIOInt --> EngineManager
    JestInt --> EngineManager
    LocalScan --> EngineManager
    
    style ACChecker fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style ACEngine fill:#e1f5ff,stroke:#0062ff,stroke-width:2px
```

## 4. Browser Extension Architecture

```mermaid
graph TB
    subgraph "DevTools Process"
        DevToolsUI[DevTools UI<br/>devToolsApp.tsx<br/>React Components]
        DevToolsAppCtrl[DevTools App Controller<br/>devtoolsAppController.ts<br/>UI State Management]
        DevToolsCtrl[DevTools Controller<br/>devtoolsController.ts<br/>Scan Orchestration]
    end
    
    subgraph "Extension Pages"
        Options[Options Page<br/>Configuration]
        Popup[Popup<br/>Quick Actions]
    end
    
    subgraph "Content Scripts (Injected)"
        ViewInspect[viewInspect.ts<br/>Element Highlighting]
        ViewKCM[viewKCM.ts<br/>Keyboard Check Mode]
        TabStopViz[Tab Stop Visualization<br/>Circles & Lines]
    end
    
    subgraph "Background Process"
        BGController[Background Controller<br/>controller.ts<br/>Message Routing & State]
        Messaging[Common Messaging<br/>commonMessaging.ts<br/>Communication Layer]
    end
    
    subgraph "Bundled Engine & Rules"
        LocalEngine[ace.js<br/>Bundled Locally<br/>Engine & Rules]
    end
    
    subgraph "External Services"
        RuleServer[Rule Server<br/>Help Documentation]
    end
    
    subgraph "Reporting"
        ReportGen[Report Generation<br/>HTML/JSON/CSV/XLSX]
        BaselineComp[Baseline Comparison]
    end
    
    subgraph "Browser Variants"
        Manifest[manifest.json<br/>Chrome/Edge: v3<br/>Firefox: v2]
    end
    
    DevToolsUI --> DevToolsAppCtrl
    DevToolsAppCtrl --> DevToolsCtrl
    DevToolsCtrl --> BGController
    
    Options --> BGController
    Popup --> BGController
    
    BGController --> Messaging
    Messaging --> ViewInspect
    Messaging --> ViewKCM
    Messaging --> TabStopViz
    
    DevToolsCtrl --> LocalEngine
    BGController --> LocalEngine
    BGController -.fetches help.-> RuleServer
    
    DevToolsCtrl --> ReportGen
    DevToolsCtrl --> BaselineComp
    
    ViewInspect -.injects into.-> WebPage[Web Page DOM]
    ViewKCM -.injects into.-> WebPage
    TabStopViz -.injects into.-> WebPage
    
    Manifest -.configures.-> DevToolsUI
    
    style DevToolsUI fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style DevToolsCtrl fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    style BGController fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style LocalEngine fill:#e1f5ff,stroke:#0062ff,stroke-width:3px
    style Manifest fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    
    note1[Note: Same codebase for Chrome, Edge, Firefox<br/>Only manifest.json differs for Firefox<br/>DevTools runs in separate process from background]
    style note1 fill:#fff9c4,stroke:#f57f17,stroke-width:1px
```

## 5. cypress-accessibility-checker Architecture

```mermaid
graph TB
    subgraph "Cypress Plugin"
        CypressPlugin[cypress-accessibility-checker<br/>Plugin Entry Point]
        CypressCommands[Custom Cypress Commands<br/>cy.getCompliance and others]
    end
    
    subgraph "Wrapper Layer"
        Wrapper[Wrapper Functions<br/>Cypress Context Adaptation]
    end
    
    subgraph "Core Checker"
        NodeChecker[accessibility-checker<br/>Node Package]
    end
    
    subgraph "Cypress Framework"
        CypressCore[Cypress Test Runner]
        CypressBrowser[Cypress Browser Control]
    end
    
    subgraph "Common Module"
        CommonLib[common/module<br/>Shared Types & Reports]
    end
    
    CypressPlugin --> CypressCommands
    CypressCommands --> Wrapper
    Wrapper --> NodeChecker
    
    CypressPlugin --> CommonLib
    
    CypressCore --> CypressPlugin
    CypressBrowser --> Wrapper
    
    NodeChecker --> Engine[accessibility-checker-engine]
    
    style CypressPlugin fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style NodeChecker fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
```

## 6. karma-accessibility-checker Architecture

```mermaid
graph TB
    subgraph "Karma Plugin"
        KarmaPlugin[karma-accessibility-checker<br/>Plugin Entry Point]
        Framework[Karma Framework<br/>Test Integration]
        Reporter[Karma Reporter<br/>Results Output]
        Preprocessor[Karma Preprocessor<br/>File Processing]
    end
    
    subgraph "Client-Side"
        ClientLib[Client Library<br/>Browser Context]
        TestAdapter[Test Adapter<br/>Karma Bridge]
    end
    
    subgraph "Engine Integration"
        Engine[accessibility-checker-engine<br/>ace.js]
    end
    
    subgraph "Reporting"
        ReportGen[Report Generation<br/>HTML/JSON/CSV/XLSX]
        BaselineComp[Baseline Comparison]
    end
    
    subgraph "Common Module"
        CommonLib[common/module<br/>Shared Types & Reports]
    end
    
    subgraph "Karma Framework"
        KarmaCore[Karma Test Runner]
        KarmaBrowser[Karma Browser Launcher]
    end
    
    KarmaPlugin --> Framework
    KarmaPlugin --> Reporter
    KarmaPlugin --> Preprocessor
    
    Framework --> ClientLib
    ClientLib --> TestAdapter
    TestAdapter --> Engine
    
    Reporter --> ReportGen
    Reporter --> BaselineComp
    
    KarmaPlugin --> CommonLib
    
    KarmaCore --> KarmaPlugin
    KarmaBrowser --> ClientLib
    
    style KarmaPlugin fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style Engine fill:#e1f5ff,stroke:#0062ff,stroke-width:2px
```

## 7. java-accessibility-checker Architecture

```mermaid
graph TB
    subgraph "Java API"
        JavaChecker[AccessibilityChecker<br/>Main Java API]
        Config[Configuration<br/>Java Config Objects]
    end
    
    subgraph "Engine Integration"
        Rhino[Mozilla Rhino<br/>JavaScript Engine]
        EngineWrapper[Engine Wrapper<br/>JS-Java Bridge]
    end
    
    subgraph "JavaScript Engine"
        ACEngine[accessibility-checker-engine<br/>ace-node.js]
    end
    
    subgraph "Integration Layer"
        SeleniumInt[Selenium WebDriver<br/>Integration]
        PlaywrightInt[Playwright<br/>Integration]
    end
    
    subgraph "Test Frameworks"
        JUnit[JUnit 4/5<br/>Test Framework]
    end
    
    subgraph "Reporting"
        JSONReport[JSON Reports]
        BaselineComp[Baseline Comparison]
    end
    
    JavaChecker --> Config
    JavaChecker --> EngineWrapper
    JavaChecker --> SeleniumInt
    JavaChecker --> PlaywrightInt
    
    EngineWrapper --> Rhino
    Rhino --> ACEngine
    
    JavaChecker --> JSONReport
    JavaChecker --> BaselineComp
    
    JUnit --> JavaChecker
    
    style JavaChecker fill:#fff9c4,stroke:#f57f17,stroke-width:3px
    style Rhino fill:#ffebee,stroke:#c62828,stroke-width:2px
    style ACEngine fill:#e1f5ff,stroke:#0062ff,stroke-width:2px
```

## 8. Data Flow: Accessibility Scan Process

```mermaid
sequenceDiagram
    participant User
    participant Tool as Testing Tool<br/>(Node/Cypress/Karma/Java/Extension)
    participant Engine as accessibility-checker-engine
    participant Rules as Rule Server
    participant Reporter as Report Generator
    
    User->>Tool: Initiate Scan
    Tool->>Tool: Load Configuration
    Tool->>Rules: Fetch Latest Rules (optional)
    Rules-->>Tool: Return Rules & Engine
    Tool->>Engine: Initialize Engine
    Tool->>Engine: Scan DOM/Page
    Engine->>Engine: Parse DOM
    Engine->>Engine: Apply Rules
    Engine->>Engine: Generate Results
    Engine-->>Tool: Return Scan Results
    Tool->>Reporter: Format Results
    Reporter->>Reporter: Generate Reports<br/>(JSON/HTML/CSV/XLSX)
    Tool->>Tool: Compare with Baseline (optional)
    Tool-->>User: Return Results<br/>(Pass/Fail + Reports)
```

## 9. Component Dependencies

```mermaid
graph LR
    subgraph "Foundation"
        Engine[accessibility-checker-engine]
        Common[common/module<br/>Config & Reporting]
        Report[report-react<br/>HTML Reports]
    end
    
    subgraph "Distribution"
        RuleServer[rule-server]
    end
    
    subgraph "Tools"
        Node[accessibility-checker]
        Cypress[cypress-accessibility-checker]
        Karma[karma-accessibility-checker]
        Java[java-accessibility-checker]
        Extension[accessibility-checker-extension]
    end
    
    Engine --> Node
    Engine --> Cypress
    Engine --> Karma
    Engine --> Java
    Engine -.bundled with.-> Extension
    Engine --> RuleServer
    
    Report --> Common
    Common --> Node
    Common --> Cypress
    Common --> Karma
    
    RuleServer -.help files.-> Extension
    RuleServer -.serves rules.-> Node
    
    style Engine fill:#e1f5ff,stroke:#0062ff,stroke-width:3px
    style Common fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Report fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## Key Architecture Principles

### 1. **Core Engine as Foundation**
- `accessibility-checker-engine` provides the core accessibility rules and evaluation logic
- Built in TypeScript/JavaScript for cross-platform compatibility
- Generates multiple build outputs for different environments (browser, Node.js)

### 2. **Modular Tool Design**
- Each tool (Node, Cypress, Karma, Java, Extension) integrates the core engine
- Tools provide environment-specific integrations and APIs
- Shared functionality extracted to `common/module`

### 3. **Common Components for Code Reuse**
- **common/module**: Shared JavaScript components for config processing and reporting
  - Configuration management (ACConfigManager)
  - Report generation (JSON, CSV, HTML, XLSX, Metrics)
  - Baseline comparison (BaselineManager)
  - Diff utilities
- **report-react**: React-based HTML report generation component
  - Built and copied into common/module during build process
  - Provides consistent HTML reporting across all tools

### 4. **Multiple Integration Points**
- **Browser Extensions**:
  - Direct DevTools integration for manual testing
  - Same codebase for Chrome, Edge, and Firefox
  - Only difference: Firefox uses separate manifest.json (v2 vs v3)
  - Engine and rules are bundled with the extension
  - Rule server only provides help documentation
- **Node.js Tools**: Integration with popular test frameworks (Jest, Selenium, Puppeteer, Playwright)
- **Cypress Plugin**: Adapted code for Cypress environment with common components
- **Karma Plugin**: Framework/reporter/preprocessor for Karma test runner
- **Java Package**: Uses Rhino JavaScript engine to run core engine in JVM

### 5. **Flexible Rule Distribution**
- **Browser Extensions**: Rules and engine bundled locally with extension
- **Node.js Tools**: Rules can be fetched from rule-server for latest updates
- Supports custom rule archives and policies

### 6. **Comprehensive Reporting**
- Multiple output formats: JSON, HTML, CSV, XLSX
- Baseline comparison for regression testing
- Metrics and summary reports
- Shared report generation via `common/module` and `report-react`

### 7. **Test Framework Agnostic**
- Node checker works with any Node-based test framework
- Provides APIs for scanning DOM, URLs, and local files
- Supports both programmatic and CLI usage

### 8. **Code Adaptation vs Wrapping**
- **Cypress**: Contains adapted/copied code from accessibility-checker, tweaked for Cypress
- **Karma**: Independent implementation with shared common components
- **Java**: Independent implementation using Rhino to execute JavaScript engine
- All tools share common components for consistency
