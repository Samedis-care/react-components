import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import NotchedOutline from "@material-ui/core/OutlinedInput/NotchedOutline";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
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
    left: 0,
    top: 0,
    // slight alteration to spec spacing to match visual spec result
    transform: "translate(0, 24px) scale(1)",
  },
  borderColor: {
    borderColor: "lightgrey",
    borderRadius: 4,
  },
});

export interface GroupBoxProps {
  id?: string;
  label: React.ReactNode;
  children?: React.ReactNode;
}

const GroupBox = (props: GroupBoxProps) => {
  const { id, label, children } = props;
  const classes = useStyles();
  const [labelWidth, setLabelWidth] = React.useState(0);
  const labelRef = React.useRef(null);
  React.useEffect(() => {
    const cur = (labelRef.current as unknown) as HTMLElement;
    setLabelWidth(cur ? cur.offsetWidth : 0);
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
          <NotchedOutline
            notched
            labelWidth={labelWidth}
            className={classes.borderColor}
          />
        </div>
      </div>
    </div>
  );
};
export default React.memo(GroupBox);
