import React from "react";
import styles from "./DiagramControls.module.css";
import Button from "../../common/Button";

const DiagramControls = ({
  onToggleRaw,
  isRawVisible,
  onEdit,
  onDownload,
  isDownloadDisabled = false,
}) => {
  return (
    <div className={styles.controls}>
      <Button
        onClick={onToggleRaw}
        variant="secondary"
        className={styles.button}
      >
        {isRawVisible ? "Hide Raw Text" : "Show Raw Text"}
      </Button>
      <Button onClick={onEdit} variant="primary" className={styles.button}>
        Edit Diagram
      </Button>
      <Button
        onClick={onDownload}
        variant="secondary"
        className={styles.button}
        disabled={isDownloadDisabled}
      >
        Download SVG
      </Button>
    </div>
  );
};

export default DiagramControls;
