import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@mui/material";
import { ModelRenderParams } from "../../index";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";
import { SignaturePad } from "../../../../non-standalone";
import { FormControlCC } from "../../../../standalone";

/**
 * Renders an signature field (for electronic signing)
 */
class RendererSignature extends TypeImage {
	render(params: ModelRenderParams<string>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<FormControlCC
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
					onBlur={handleBlur}
					data-name={field}
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<SignaturePad
						name={field}
						signature={value}
						setSignature={(newValue) => handleChange(field, newValue)}
						disabled={visibility.disabled}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlCC>
			);
		}

		const content = value ? (
			<img src={value} alt={label} />
		) : (
			<>
				{ccI18n.t(
					"backend-integration.model.types.renderers.signature.not-set"
				)}
			</>
		);

		return visibility.grid ? (
			content
		) : (
			<FormControl>
				<FormLabel>{label}</FormLabel>
				{content}
			</FormControl>
		);
	}
}

export default RendererSignature;
