# Form Engine

## Implementing in your application

The following will guide you though the required steps of implementing the form engine.

### Adding a backend connector

First we have to implement our own backend connector, for this we can use the following template code:

<details>
    <summary>TypeScript</summary>
    
```typescript
import {Connector, ModelFieldName} from "components-care";

class BackendConnector<KeyT extends ModelFieldName> extends Connector<KeyT> {
async index(): Promise<Record<KeyT, unknown>[]> {
throw new Error("Not implemented");
}

    async create(
        data: Record<string, unknown>
    ): Promise<Record<KeyT, unknown>> {
        throw new Error("Not implemented");
    }

    async read(id: string): Promise<Record<KeyT, unknown>> {
        throw new Error("Not implemented");
    }

    async update(
        data: Record<ModelFieldName, unknown>
    ): Promise<Record<KeyT, unknown>> {
        throw new Error("Not implemented");
    }

    async delete(id: string): Promise<void> {
        throw new Error("Not implemented");
    }

}

export default BackendConnector;

````
</details>

<details>
    <summary>JavaScript</summary>

```javascript
import {Connector, ModelFieldName} from "components-care";

class BackendConnector extends Connector {
    async index() {
        throw new Error("Not implemented");
    }

    async create(data) {
        throw new Error("Not implemented");
    }

    async read(id) {
        throw new Error("Not implemented");
    }

    async update(data) {
        throw new Error("Not implemented");
    }

    async delete(id) {
        throw new Error("Not implemented");
    }
}

export default BackendConnector;
````

</details>

The documentation of the methods can be found in the superclass [Connector](../src/backend-integration/Connector/Connector.ts)

### Defining your models

Next up you have to define your data structures in a model. A minimalistic model looks like this:

<details>
	<summary>TypeScript/JavaScript</summary>
    
```typescript
import {Model, ModelDataTypeStringRendererMUI, ModelVisibilityDisabled, ModelVisibilityHidden} from "components-care";
import BackendConnector from "./BackendConnector";

const NameModel = new Model(
"name-model-id",
{
id: {
type: new ModelDataTypeStringRendererMUI(),
visibility: {
overview: ModelVisibilityDisabled,
edit: ModelVisibilityHidden,
create: ModelVisibilityDisabled,
},
getLabel: () => "ID",
customData: null,
},
},
new BackendConnector()
);

export default NameModel;

````


</details>

You need to define all additional fields required for your model yourself. A field definiion looks like this:

<details>
	<summary>TypeScript diff</summary>

```diff
--- example.ts
+++ example-with-field.ts
@@ -14,6 +14,21 @@
             getLabel: () => "ID",
             customData: null,
         },
+        field_name: {
+            type: new ModelDataTypeStringRendererMUI(), // define your type & renderer here
+            visibility: { // modify to your liking
+                overview: ModelVisibilityDisabled,
+                edit: ModelVisibilityHidden,
+                create: ModelVisibilityDisabled,
+            },
+            getLabel: () => "Field name", // to use i18n: i18n.t.bind(null, "namespace:translation.key")
+            getDefaultValue: () => "Default value, do not define to set no default value", // supports async
+            validate: (value: string, values: Record<string, unknown>): string | null => {
+                if (value !== "valid") return "Value is not 'valid'!";
+                return null; // no validation errors
+            },
+            onChange: ( // optional on change hook
+                value: string,
+                model: Model<string, PageVisibility, null>,
+                setFieldValue: FormikContextType<string>["setFieldValue"]
+            ): string => {
+                // you can modify the model itself in here, useful for e.g.: implementing conditional enums
+                return value;
+            },
+            customData: null,
+        },
     },
     new BackendConnector()
 );
````

</details>

<details>
	<summary>JavaScript diff</summary>

```diff
--- example.js
+++ example-with-field.js
@@ -14,6 +14,21 @@
             getLabel: () => "ID",
             customData: null,
         },
+        field_name: {
+            type: new ModelDataTypeStringRendererMUI(), // define your type & renderer here
+            visibility: { // modify to your liking
+                overview: ModelVisibilityDisabled,
+                edit: ModelVisibilityHidden,
+                create: ModelVisibilityDisabled,
+            },
+            getLabel: () => "Field name", // to use i18n: i18n.t.bind(null, "namespace:translation.key")
+            getDefaultValue: () => "Default value, do not define to set no default value", // supports async
+            validate: (value, values) => {
+                if (value !== "valid") return "Value is not 'valid'!";
+                return null; // no validation errors
+            },
+            onChange: (value, model, setFieldValue) => { // optional on change hook
+                // you can modify the model itself in here, useful for e.g.: implementing conditional enums
+                return value;
+            },
+            customData: null,
+        },
     },
     new BackendConnector()
 );
```

</details>

#### Defining your own Types and Renderers

Sometimes you need custom controls which aren't included in the default type library. In these cases you need to create your own Renderers or even Types.

Read more about implementing [your own renderers](../src/backend-integration/Model/Types/Renderers/README.md) and [your own types](../src/backend-integration/Model/Types/README.md) by following the respective link.
