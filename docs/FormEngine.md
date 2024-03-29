# Form Engine

## Purpose

The form engine enables you to create reusable form components and easily create large, very performant forms with built-in validations.

## Overview

<p align="center">
  <img src="assets/FormEngine/Overview.svg" alt="Form Engine & Model system overview">
</p>

## Implementing in your application

The following will guide you though the required steps of implementing the form engine.

### Adding a backend connector

First we have to implement our own backend connector, for this we can use the following template code:

<details>
    <summary>TypeScript</summary>
    
```typescript
import {Connector, ModelFieldName, ResponseMeta, ModelGetResponse } from "components-care";

class BackendConnector<
  KeyT extends ModelFieldName,
  VisibilityT extends PageVisibility,
  CustomT
  > extends Connector<KeyT, VisibilityT, CustomT> {
    async index(
		params?: Partial<IDataGridLoadDataParameters>,
        model?: Model<KeyT, VisibilityT, CustomT>    
    ): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
        throw new Error("Not implemented");
    }

    async create(
        data: Record<string, unknown>,
        model?: Model<KeyT, VisibilityT, CustomT>
    ): Promise<Record<KeyT, unknown>> {
        throw new Error("Not implemented");
    }

    async read(
      id: string,
      model?: Model<KeyT, VisibilityT, CustomT>
    ): Promise<ModelGetResponse<KeyT>> {
        throw new Error("Not implemented");
    }

    async update(
        data: Record<ModelFieldName, unknown>,
        model?: Model<KeyT, VisibilityT, CustomT>
    ): Promise<Record<KeyT, unknown>> {
        throw new Error("Not implemented");
    }

    async delete(
      id: string,
      model?: Model<KeyT, VisibilityT, CustomT>
    ): Promise<void> {
        throw new Error("Not implemented");
    }
/* Only implement if your backend can handle multiple deletes in one request
	async deleteMultiple(
	  ids: string[],
	  model?: Model<KeyT, VisibilityT, CustomT>
    ): Promise<void> {
		return super.deleteMultiple(ids);
	}
*/
/* Only implement if your backend can handle delete all requests
	deleteAdvanced = async (
	  req: AdvancedDeleteRequest,
	  model?: Model<KeyT, VisibilityT, CustomT>
	) => {
        throw new Error("Not implemented");
    };
*/
/* Define if your backend supports data exporters
	dataGridExporters = undefined;
*/
}

export default BackendConnector;

````
</details>

<details>
    <summary>JavaScript</summary>

```javascript
import {Connector, ModelFieldName} from "components-care";

class BackendConnector extends Connector {
    async index(params, model) {
        throw new Error("Not implemented");
    }

    async create(data, model) {
        throw new Error("Not implemented");
    }

    async read(id, model) {
        throw new Error("Not implemented");
    }

    async update(data, model) {
        throw new Error("Not implemented");
    }

    async delete(id, model) {
        throw new Error("Not implemented");
    }
/* Only implement if your backend can handle multiple deletes in one request
	async deleteMultiple(ids, model) {
		return super.deleteMultiple(ids);
	}
*/
/* Only implement if your backend can handle delete all requests
	deleteAdvanced = async (req, model) => {
        throw new Error("Not implemented");
    };
*/
/* Define if your backend supports data exporters
	dataGridExporters = undefined;
*/
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

You need to define all additional fields required for your model yourself. A field definition looks like this:

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
+            filterable: true, // optional, used for BackendDataGrid, defualts to false
+            sortable: true, // optional, used for BackendDataGrid, defualts to false
+            onChange: ( // optional on change hook
+                value: string,
+                model: Model<string, PageVisibility, null>,
+                setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void
+            ): string => {
+                // you can modify the model itself in here, useful for e.g.: implementing conditional enums
+                return value;
+            },
+            getRelationModel: () => OtherModel, // required for backend connected data types. otherwise undefined
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
+            filterable: true, // optional, used for BackendDataGrid, defualts to false
+            sortable: true, // optional, used for BackendDataGrid, defualts to false
+            onChange: (value, model, setFieldValue) => { // optional on change hook
+                // you can modify the model itself in here, useful for e.g.: implementing conditional enums
+                return value;
+            },
+            getRelationModel: () => OtherModel, // required for backend connected data types. otherwise undefined
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

### Creating an error component

An error component will display the errors occurring in the form and the form components. It has a single property: `error`.
The `error` property is never null. Its `error` property may get updated from time to time.
Your component won't be unmounted until the form gets unmounted.

A basic error component which uses dialogs can be found below:

<details>
	<summary>TypeScript</summary>
	
```tsx
import React, {useEffect} from "react";
import {ErrorDialog, ErrorComponentProps, useDialogContext} from "components-care"

const ErrorComponent = (props: ErrorComponentProps) => {
    const propError = props.error;

    const [pushDialog] = useDialogContext();

    useEffect(() => {
    	pushDialog(
    		<ErrorDialog
    			title={"An error occurred"}
    			message={propError.message}
    			buttons={[
    				{
    					text: "Okay",
    					autoFocus: true,
    				},
    			]}
    		/>
    	);
    	// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propError]);

    return <></>;

};

export default React.memo(ErrorComponent);

````

</details>


<details>
	<summary>JavaScript</summary>

```jsx
import React, {useEffect} from "react";
import {ErrorDialog, ErrorComponentProps, useDialogContext} from "components-care"

const ErrorComponent = (props) => {
	const propError = props.error;

	const [pushDialog] = useDialogContext();

	useEffect(() => {
		pushDialog(
			<ErrorDialog
				title={"An error occurred"}
				message={propError.message}
				buttons={[
					{
						text: "Okay",
						autoFocus: true,
					},
				]}
			/>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propError]);

	return <></>;
};

export default React.memo(ErrorComponent);
````

</details>

### Creating the form itself

To create a form you need two things:

- a model
- an error component

A form has two components: `Form` and `FormField`.
The `Form` component stores the form state and provides everything needed for validating and submitting the form.
The `FormField` component renders the field according to the model provided to the `Form` component.

A basic form looks like this:

<details>
	<summary>TypeScript/JavaScript</summary>

```tsx
<Form
	model={NameModel}
	id={null || "id"} // null for create new, "id" for edit existing
	errorComponent={ErrorComponent}
	renderConditionally
>
	{({ isSubmitting, values, submit }) => (
		<>
			<FormField name={"field-name"} />
			<Button
				disabled={isSubmitting}
				onClick={async () => {
					try {
						await submit();
						console.log("Submitted");
					} catch (e) {
						console.log("Validation errors:", e);
					}
				}}
			/>
		</>
	)}
</Form>
```

</details>
