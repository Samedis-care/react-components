import React, { Component } from "react";
import { Button, Grid, Typography } from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import File from "./File";

export interface IProps {
	/**
	 * Maximum amount of files allowed
	 */
	maxFiles: number;
	/**
	 * Filter for allowed mime types (see <input accept="VALUE">)
	 */
	acceptMime?: string;
	/**
	 * Optional resolution restrictions for images
	 */
	imageDownscaleOptions?: IDownscaleProps;
	/**
	 * Optional mime type to convert images to
	 */
	convertImagesTo?: string;
	/**
	 * Properties for preview
	 */
	previewSize: number;
	previewImages?: boolean;
}

export interface IDownscaleProps {
	width: number;
	height: number;
	keepRatio: boolean;
}

class FileUpload extends Component<IProps> {
	render() {
		return (
			<>
				<Grid container spacing={2} alignContent={"space-between"}>
					<Grid item xs>
						<Button
							startIcon={<AttachFile />}
							variant={"contained"}
							color={"primary"}
						>
							Upload Files
						</Button>
					</Grid>
					<Grid item xs>
						<Typography align={"right"}>(Formats: any)</Typography>
					</Grid>
					<Grid item xs={12}>
						<Grid
							container
							spacing={2}
							alignContent={"flex-start"}
							alignItems={"flex-start"}
						>
							<File {...this.genFileProps("doc.pdf", "application/pdf")} />
							<File {...this.genFileProps("doc2.pdf", "application/pdf")} />
							<File {...this.genFileProps("doc3.pdf", "application/pdf")} />
							<File {...this.genFileProps("doc4.pdf", "application/pdf")} />
							<File {...this.genFileProps("image.png", "image/png")} />
							<File {...this.genFileProps("long_doc.pdf", "application/pdf")} />
							<File
								{...this.genFileProps("long_doc2.pdf", "application/pdf")}
							/>
							<File
								{...this.genFileProps("long_doc3.pdf", "application/pdf")}
							/>
							<File
								{...this.genFileProps("long_doc4.pdf", "application/pdf")}
							/>
							<File {...this.genFileProps("long_image.png", "image/png")} />
						</Grid>
					</Grid>
				</Grid>
			</>
		);
	}

	genFileProps = (name: string, mime: string) => {
		return {
			name,
			mimeType: mime,
			size: this.props.previewSize,
		};
	};
}

export default FileUpload;
