import React, { useState, useRef, useEffect, memo } from "react";
import { makeStyles, InputLabel } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  content: {
    padding: "18.5px 14px",
  },
  inputLabelDiv: {
    position: "relative",
    marginTop: "20px",
  },
  inputLabel: {
    position: "absolute",
    left: '5px',
    top: 0,
  },
  fieldSetRoot: {
    textAlign: 'left',
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: -5,
    left: 0,
    margin: 0,
    padding: '0 8px',
    pointerEvents: 'none',
    borderStyle: 'dotted',
    borderColor: "lightgrey",
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  legend: {
    padding: 0,
    lineHeight: '11px', // sync with `height` in `legend` styles
    transition: theme.transitions.create('width', {
      duration: 150,
      easing: theme.transitions.easing.easeOut,
    }),
  },
}));

export interface GroupBoxProps {
  id?: string;
  label: React.ReactNode;
  children?: React.ReactNode;
}

const GroupBox = (props: GroupBoxProps) => {
  const { id, label, children } = props;
  const classes = useStyles();
  const [labelWidth, setLabelWidth] = useState(0);
  const labelRef = useRef(null);
  useEffect(() => {
    const cur = (labelRef.current as unknown) as HTMLElement;
    setLabelWidth(cur ? cur.offsetWidth * 0.75 + 20 : 0);
  }, [label]);

  return (
    <div className={classes.inputLabelDiv}>
      <InputLabel
        ref={labelRef}
        htmlFor={id}
        variant="outlined"
        className={classes.inputLabel}
        shrink
      >
        {label}
      </InputLabel>
      <div className={classes.root}>
        <div id={id} className={classes.content}>
          {children}
          <fieldset
            aria-hidden
            className={classes.fieldSetRoot}
          >
            <legend
              className={classes.legend}
              style={{
                width: labelWidth,
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: '&#8203;' }} />
            </legend>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
export default memo(GroupBox);
