var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
let AppComponent = (() => {
    let _classDecorators = [Component({
            selector: "app-root",
            standalone: true,
            imports: [CommonModule],
            template: `
    <main class="page">
      <section class="hero">
        <p class="eyebrow">MongoDB, Express.js, Angular, Node.js</p>
        <h1>Loom MEAN template</h1>
        <p class="lede">A real Angular frontend talking to an Express API over a local proxy.</p>
      </section>

      <section class="status-grid">
        <article>
          <p class="label">Route</p>
          <p>https://mean.loom.local</p>
        </article>
        <article>
          <p class="label">API status</p>
          <p>{{ status }}</p>
        </article>
      </section>

      <section class="card-list">
        <article class="card" *ngFor="let item of items">
          <h2>{{ item.name }}</h2>
          <p>{{ item.done ? 'done' : 'open' }}</p>
        </article>
      </section>
    </main>
  `,
            styleUrl: "./app.component.css"
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        items = [];
        status = "loading";
        async ngOnInit() {
            try {
                const [healthResponse, itemsResponse] = await Promise.all([fetch("/api/health"), fetch("/api/items")]);
                if (!healthResponse.ok || !itemsResponse.ok) {
                    throw new Error(`Request failed: ${healthResponse.status}/${itemsResponse.status}`);
                }
                const health = (await healthResponse.json());
                this.items = (await itemsResponse.json());
                this.status = health.status ?? "ok";
            }
            catch (error) {
                this.status = `unavailable: ${error}`;
            }
        }
    };
    return AppComponent = _classThis;
})();
export { AppComponent };
//# sourceMappingURL=app.component.js.map