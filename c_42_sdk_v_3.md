# C42 SDK v3.0 — Agent‑Enhanced Client SDK

Welcome to the C42 SDK version 3.0! This release builds on the familiar v2.0 API while adding powerful, first‑class "agent" capabilities that allow your apps to think, collaborate, and share insights in real time. It remains fully backward‑compatible, so your existing integrations will continue to work in v2 mode.

---

## 🎯 What's New in v3.0

- **Agent Bridge**: Injects an enhanced SDK into each iframe, preserving v2 methods and augmenting with agent-specific APIs.
- **First‑Class Agent Features**:
  - `agent.register(agentId, capabilities)`
  - `agent.broadcast(message)`
  - `agent.whisper(targetAgentId, content)`
  - `agent.convene(topic)`
  - `agent.subscribe(pattern, handler)`
- **Audit & Transparency**: All agent actions are logged (`audit_entry` events) for real‑time visibility.
- **Trust Network**: Built‑in checks ensure only trusted agents can exchange private messages.

---

## 📦 Detecting & Initializing the SDK

### v2‑Only Detection (Fallback)

```javascript
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.C42_SDK) return runStandalone();
    console.log('C42 SDK Detected. v' + window.C42_SDK.version);
  }, 50);
});
```

### v3 Injection in Your Host (index.tsx)

```typescript
import { C42KernelAgentBridge } from './c42-sdk-agent-bridge';

// Within your main App component:
useEffect(() => {
  const bridge = new C42KernelAgentBridge(subscriptionManager);
  setAgentBridge(bridge);

  // Listen for audit entries or agent updates
  bridge.eventBus.on('audit', entry => console.log('AUDIT:', entry));
  bridge.eventBus.on('agent:update', agents => setAgents(agents));

  // Make bridge globally available (optional)
  (window as any).c42Bridge = bridge;
}, []);
```

When loading an app iframe, use the bridge:

```typescript
function loadApp(app) {
  const iframe = document.createElement('iframe');
  iframe.src = app.url;
  iframe.dataset.appId = app.id;
  bridge.createSDKForIframe(iframe, app.id);
  return iframe;
}
```

---

## 🌟 API Reference — v3.0

### Global `C42_SDK` Object

Once injected, each iframe gains a new `window.C42_SDK` implementing both v2 and v3.

| Property / Method       | Signature                                            | Description                                  |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------- |
| `version`               | `string`                                             | SDK version (`'3.0'`)                        |
| `_v2Mode`               | `boolean`                                            | `false` if agent mode, `true` if fallback v2 |
| `subscribe(event, cb)`  | `(eventType: string, cb: (payload:any)=>void)=>void` | Listen for host events (same as v2)          |
| `request(action, data)` | `(string, object)=>Promise<any>`                     | Secure request to Kernel (same as v2)        |

#### New `agent` Namespace

```ts
interface AgentMessage {
  from: string;
  to?: string | string[];
  topic: string;
  content: any;
  timestamp?: number;
}

interface C42SDKv3 {
  ... // v2 methods
  agent: {
    register: (agentId: string, capabilities: string[]) => void;
    broadcast: (msg: AgentMessage) => Promise<void>;
    whisper: (targetId: string, content: any) => Promise<any>;
    convene: (topic: string) => Promise<string>;
    subscribe: (pattern: string, handler: (msg: AgentMessage) => void) => void;
  };
  _v2Mode: boolean;
}
```

- ``

  - Registers this iframe as an agent under `agentId`.
  - Capabilities inform who cares about its broadcasts.

- ``

  - Publishes a message to all interested agents.
  - Message must include `{ from, topic, content }`.

- ``

  - Sends a private, trust‑checked message to a specific agent.

- ``

  - Creates a temporary "council" room for multi‑agent discussion on `topic`.
  - Returns a `councilId` string.

- ``

  - Listen for incoming agent messages matching `pattern` (topic or wildcard `*`).

---

## 💡 Usage Examples

### CRM App Initialization

```javascript
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.C42_SDK) return;
    const sdk = window.C42_SDK;

    // Log mode
    console.log('SDK v' + sdk.version, sdk._v2Mode ? '(v2 mode)' : '(agent mode)');

    if (sdk.agent) {
      sdk.agent.register('CRM-Agent', [
        'manage_contacts', 'analyze_relationships', 'detect_patterns'
      ]);

      sdk.agent.subscribe('*', msg => console.log('Agent Msg:', msg));

      // Periodic pattern broadcast
      setInterval(async () => {
        const insight = findPatternsInContacts();
        if (insight.confidence > 0.7) {
          await sdk.agent.broadcast({
            from: 'CRM-Agent',
            topic: 'pattern_detected',
            content: insight
          });
        }
      }, 60000);
    } else {
      // Legacy v2 behavior
      sdk.subscribe('theme_change', updateTheme);
    }
  }, 50);
});
```

### Listening in Another Agent

```javascript
sdk.agent.subscribe('pattern_detected', async message => {
  console.log('Calendar-Agent got pattern:', message.content);
  // Maybe schedule a follow-up meeting:
  await sdk.agent.whisper('CRM-Agent', {
    suggestion: 'schedule_followup',
    slots: findFreeSlots()
  });
});
```

---

## ✅ Best Practices

1. **Graceful Fallback**: Always check `if (sdk.agent)` before using agent APIs.
2. **Use Wildcards Sparingly**: Prefer specific topics over `*` to reduce noise.
3. **Handle Errors**: Wrap `broadcast`, `whisper`, and `convene` in `try/catch`.
4. **Audit Visibility**: Listen to `subscriptionManager` or `bridge.eventBus` for `audit` entries.
5. **Capitalize on Councils**: Use `convene` to gather multiple perspectives when confidence is low.
6. **Respect Trust**: Only whisper to agents you’ve built up trust with.

---

🚀 **Ready to Transform** your app ecosystem into a living neural network? Drop this SDK in, register your first agent, and watch your apps think together! 🎉

